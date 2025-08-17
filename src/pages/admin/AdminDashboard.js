import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  Loader2, 
  Image as ImageIcon,
  Building2,
  Users,
  TrendingUp,
  Upload,
  Download,
  Eye,
  CheckCircle
} from 'lucide-react';

const emptyVenue = () => ({
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  tableCount: '',
  logo: null,
  _open: true,           // UI only
  _previewUrl: null,     // UI only
  _csvFile: null,        // CSV file for employees
  _csvPreview: null,     // Parsed CSV data
});

const in30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10); // yyyy-mm-dd for input[type=date]
};

// CSV parsing helper
const parseCSV = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return null;
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['first_name', 'last_name', 'role'];
  const hasRequired = requiredHeaders.every(h => headers.includes(h));
  
  if (!hasRequired) {
    throw new Error(`CSV must include columns: ${requiredHeaders.join(', ')}`);
  }
  
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  }).filter(row => row.first_name && row.last_name);
  
  return { headers, rows };
};

export default function AdminDashboard() {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    accountPhone: '',
    companyName: '',
    trialEndsAt: in30Days(),
    venues: [emptyVenue()],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Account statistics state
  const [accountStats, setAccountStats] = useState({
    totalAccounts: 0,
    activeAccounts: 0,
    trialAccounts: 0,
    totalVenues: 0,
    totalUsers: 0,
    loading: true
  });

  const totalTables = useMemo(
    () =>
      formData.venues.reduce(
        (acc, v) => acc + (Number.isFinite(+v.tableCount) ? parseInt(v.tableCount || '0', 10) : 0),
        0
      ),
    [formData.venues]
  );

  // Load account statistics
  useEffect(() => {
    const loadAccountStats = async () => {
      try {
        // Get account counts
        const { data: accounts } = await supabase
          .from('accounts')
          .select('id, is_paid, trial_ends_at');
        
        const { data: venues } = await supabase
          .from('venues')
          .select('id');
          
        const { data: users } = await supabase
          .from('users')
          .select('id, role')
          .neq('role', 'admin');

        const now = new Date();
        const activeAccounts = accounts?.filter(a => 
          a.is_paid || (a.trial_ends_at && new Date(a.trial_ends_at) > now)
        ).length || 0;
        
        const trialAccounts = accounts?.filter(a => 
          !a.is_paid && a.trial_ends_at && new Date(a.trial_ends_at) > now
        ).length || 0;

        setAccountStats({
          totalAccounts: accounts?.length || 0,
          activeAccounts,
          trialAccounts,
          totalVenues: venues?.length || 0,
          totalUsers: users?.length || 0,
          loading: false
        });
      } catch (error) {
        console.error('Error loading account stats:', error);
        setAccountStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadAccountStats();
  }, []);

  const setField = (name, value) =>
    setFormData(prev => ({ ...prev, [name]: value }));

  const setVenueField = (index, name, value) =>
    setFormData(prev => {
      const venues = [...prev.venues];
      venues[index] = { ...venues[index], [name]: value };
      return { ...prev, venues };
    });

  const toggleVenueOpen = (index) =>
    setFormData(prev => {
      const venues = [...prev.venues];
      venues[index] = { ...venues[index], _open: !venues[index]._open };
      return { ...prev, venues };
    });

  const addVenue = () =>
    setFormData(prev => ({ ...prev, venues: [...prev.venues, emptyVenue()] }));

  const removeVenue = (index) =>
    setFormData(prev => {
      const venues = prev.venues.slice();
      venues.splice(index, 1);
      return { ...prev, venues: venues.length ? venues : [emptyVenue()] };
    });

  const onLogoChange = (index, file) => {
    if (!file) {
      setVenueField(index, 'logo', null);
      setVenueField(index, '_previewUrl', null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Logo must be an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB.');
      return;
    }
    setVenueField(index, 'logo', file);
    setVenueField(index, '_previewUrl', URL.createObjectURL(file));
  };

  // CSV employee upload handling
  const onCSVChange = (index, file) => {
    if (!file) {
      setVenueField(index, '_csvFile', null);
      setVenueField(index, '_csvPreview', null);
      return;
    }
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Employee file must be a CSV.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvData = parseCSV(e.target.result);
        setVenueField(index, '_csvFile', file);
        setVenueField(index, '_csvPreview', csvData);
        toast.success(`${csvData.rows.length} employees found in CSV`);
      } catch (error) {
        toast.error(error.message);
        setVenueField(index, '_csvFile', null);
        setVenueField(index, '_csvPreview', null);
      }
    };
    reader.readAsText(file);
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csvContent = 'first_name,last_name,role,email,phone\n' +
                      'John,Smith,Server,john@example.com,07123456789\n' +
                      'Jane,Doe,Manager,jane@example.com,07987654321\n' +
                      'Mike,Johnson,Chef,,07555123456';
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const validate = () => {
    const e = {};

    // Basic account + user checks
    if (!formData.email?.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) e.email = 'Enter a valid email';

    if (!formData.firstName?.trim()) e.firstName = 'First name is required';
    if (!formData.lastName?.trim()) e.lastName = 'Last name is required';
    if (!formData.companyName?.trim()) e.companyName = 'Company name is required';
    if (!formData.accountPhone?.trim()) e.accountPhone = 'Company phone is required';
    if (!formData.phone?.trim()) e.phone = 'User phone is required';
    if (!formData.trialEndsAt) e.trialEndsAt = 'Trial end date is required';

    // Venues
    formData.venues.forEach((v, i) => {
      if (!v.name?.trim()) e[`venue_${i}_name`] = 'Venue name is required';
      const t = parseInt(v.tableCount || '0', 10);
      if (!Number.isFinite(t) || t < 1) e[`venue_${i}_tableCount`] = 'Table count must be ≥ 1';
      if (!v.postcode?.trim()) e[`venue_${i}_postcode`] = 'Postcode is required';
      if (!v.city?.trim()) e[`venue_${i}_city`] = 'City is required';
      if (!v.addressLine1?.trim()) e[`venue_${i}_addressLine1`] = 'Address line 1 is required';
    });

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Fix the highlighted fields.');
      const first = document.querySelector('[data-error="true"]');
      if (first?.scrollIntoView) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);

    try {
      // Build venues with optional logo upload
      const venuesPayload = await Promise.all(
        formData.venues.map(async (venue) => {
          let logoPath = null;

          if (venue.logo) {
            const fileName = `${Date.now()}-${venue.logo.name.replace(/\s+/g, '-')}`;
            const filePath = `logos/${fileName}`;
            const { error: uploadError } = await supabase.storage
              .from('venue-assets')
              .upload(filePath, venue.logo);

            if (uploadError) throw uploadError;
            logoPath = filePath;
          }

          return {
            name: venue.name.trim(),
            table_count: parseInt(venue.tableCount, 10),
            logo: logoPath,
            primary_color: '#000000',
            secondary_color: '#ffffff',
            address: {
              line1: venue.addressLine1,
              line2: venue.addressLine2,
              city: venue.city,
              postcode: venue.postcode.toUpperCase(),
            },
            employees: venue._csvPreview?.rows || [],
          };
        })
      );

      const payload = {
        email: formData.email.trim().toLowerCase(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        accountPhone: formData.accountPhone.trim(),
        companyName: formData.companyName.trim(),
        trialEndsAt: formData.trialEndsAt, // yyyy-mm-dd
        venues: venuesPayload,
      };

      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error || 'Unknown error');

      toast.success('Master user and locations created 🎉');
      // Reset form
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        accountPhone: '',
        companyName: '',
        trialEndsAt: in30Days(),
        venues: [emptyVenue()],
      });
      setErrors({});
      
      // Refresh account stats
      setAccountStats(prev => ({ ...prev, loading: true }));
      // Stats will be reloaded by useEffect dependency change
    } catch (err) {
      console.error('[AdminDashboard] submit error', err);
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chatters Admin Center</h1>
        <p className="text-gray-600 mt-1">
          Create a master user, company, and one or more locations. You can add more locations later.
        </p>
      </div>

      {/* Account Statistics */}
      <section className="bg-white rounded-2xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          System Overview
        </h2>
        
        {accountStats.loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading statistics...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Accounts</p>
                  <p className="text-2xl font-bold text-blue-900">{accountStats.totalAccounts}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Active Accounts</p>
                  <p className="text-2xl font-bold text-green-900">{accountStats.activeAccounts}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Trial Accounts</p>
                  <p className="text-2xl font-bold text-yellow-900">{accountStats.trialAccounts}</p>
                </div>
                <Users className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Total Venues</p>
                  <p className="text-2xl font-bold text-purple-900">{accountStats.totalVenues}</p>
                </div>
                <Building2 className="w-8 h-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold text-indigo-900">{accountStats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-indigo-500" />
              </div>
            </div>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Account & Master User */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Account & Master User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
                className={`w-full border rounded px-3 py-2 ${errors.companyName ? 'border-red-500' : 'border-gray-300'}`}
                data-error={!!errors.companyName}
              />
              {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Company Phone</label>
              <input
                type="tel"
                name="accountPhone"
                value={formData.accountPhone}
                onChange={(e) => setField('accountPhone', e.target.value)}
                className={`w-full border rounded px-3 py-2 ${errors.accountPhone ? 'border-red-500' : 'border-gray-300'}`}
                data-error={!!errors.accountPhone}
              />
              {errors.accountPhone && <p className="text-xs text-red-600 mt-1">{errors.accountPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setField('email', e.target.value)}
                className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                data-error={!!errors.email}
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) => setField('firstName', e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                  data-error={!!errors.firstName}
                />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) => setField('lastName', e.target.value)}
                  className={`w-full border rounded px-3 py-2 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                  data-error={!!errors.lastName}
                />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">User Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className={`w-full border rounded px-3 py-2 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                data-error={!!errors.phone}
              />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Trial Ends</label>
              <input
                type="date"
                name="trialEndsAt"
                min={new Date().toISOString().slice(0,10)}
                value={formData.trialEndsAt}
                onChange={(e) => setField('trialEndsAt', e.target.value)}
                className={`w-full border rounded px-3 py-2 ${errors.trialEndsAt ? 'border-red-500' : 'border-gray-300'}`}
                data-error={!!errors.trialEndsAt}
              />
              {errors.trialEndsAt && <p className="text-xs text-red-600 mt-1">{errors.trialEndsAt}</p>}
            </div>
          </div>
        </section>

        {/* Locations */}
        <section className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Venues & Staff
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={downloadCSVTemplate}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
              >
                <Download className="w-4 h-4" /> CSV Template
              </button>
              <button 
                type="button" 
                onClick={addVenue} 
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add Venue
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.venues.map((venue, index) => (
              <div key={index} className="border rounded-xl overflow-hidden">
                {/* Card header */}
                <button
                  type="button"
                  onClick={() => toggleVenueOpen(index)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50"
                >
                  <div className="text-left">
                    <div className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {venue.name?.trim() ? venue.name : `Venue ${index + 1}`}
                      {venue._csvPreview && (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                          {venue._csvPreview.rows.length} employees
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Number(venue.tableCount || 0)} tables
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${venue._open ? 'rotate-180' : ''}`} />
                </button>

                {/* Card body */}
                {venue._open && (
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Venue Name</label>
                        <input
                          type="text"
                          name="name"
                          value={venue.name}
                          onChange={(e) => setVenueField(index, 'name', e.target.value)}
                          className={`w-full border rounded px-3 py-2 ${errors[`venue_${index}_name`] ? 'border-red-500' : 'border-gray-300'}`}
                          data-error={!!errors[`venue_${index}_name`]}
                        />
                        {errors[`venue_${index}_name`] && <p className="text-xs text-red-600 mt-1">{errors[`venue_${index}_name`]}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Table Count</label>
                        <input
                          type="number"
                          min={1}
                          name="tableCount"
                          value={venue.tableCount}
                          onChange={(e) => setVenueField(index, 'tableCount', e.target.value)}
                          className={`w-full border rounded px-3 py-2 ${errors[`venue_${index}_tableCount`] ? 'border-red-500' : 'border-gray-300'}`}
                          data-error={!!errors[`venue_${index}_tableCount`]}
                        />
                        {errors[`venue_${index}_tableCount`] && <p className="text-xs text-red-600 mt-1">{errors[`venue_${index}_tableCount`]}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium">Address Line 1</label>
                        <input
                          type="text"
                          name="addressLine1"
                          value={venue.addressLine1}
                          onChange={(e) => setVenueField(index, 'addressLine1', e.target.value)}
                          className={`w-full border rounded px-3 py-2 ${errors[`venue_${index}_addressLine1`] ? 'border-red-500' : 'border-gray-300'}`}
                          data-error={!!errors[`venue_${index}_addressLine1`]}
                        />
                        {errors[`venue_${index}_addressLine1`] && <p className="text-xs text-red-600 mt-1">{errors[`venue_${index}_addressLine1`]}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Address Line 2</label>
                        <input
                          type="text"
                          name="addressLine2"
                          value={venue.addressLine2}
                          onChange={(e) => setVenueField(index, 'addressLine2', e.target.value)}
                          className="w-full border rounded px-3 py-2 border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium">City</label>
                        <input
                          type="text"
                          name="city"
                          value={venue.city}
                          onChange={(e) => setVenueField(index, 'city', e.target.value)}
                          className={`w-full border rounded px-3 py-2 ${errors[`venue_${index}_city`] ? 'border-red-500' : 'border-gray-300'}`}
                          data-error={!!errors[`venue_${index}_city`]}
                        />
                        {errors[`venue_${index}_city`] && <p className="text-xs text-red-600 mt-1">{errors[`venue_${index}_city`]}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium">Postcode</label>
                        <input
                          type="text"
                          name="postcode"
                          value={venue.postcode}
                          onChange={(e) => setVenueField(index, 'postcode', e.target.value.toUpperCase())}
                          className={`w-full border rounded px-3 py-2 ${errors[`venue_${index}_postcode`] ? 'border-red-500' : 'border-gray-300'}`}
                          data-error={!!errors[`venue_${index}_postcode`]}
                        />
                        {errors[`venue_${index}_postcode`] && <p className="text-xs text-red-600 mt-1">{errors[`venue_${index}_postcode`]}</p>}
                      </div>
                    </div>

                    {/* Logo and Employee Upload */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Logo</label>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer bg-white hover:bg-gray-50">
                            <ImageIcon className="w-4 h-4" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => onLogoChange(index, e.target.files?.[0] || null)}
                            />
                          </label>
                          {venue._previewUrl && (
                            <img src={venue._previewUrl} alt="preview" className="h-10 w-10 rounded object-cover border" />
                          )}
                          {venue.logo && (
                            <button
                              type="button"
                              onClick={() => onLogoChange(index, null)}
                              className="text-sm text-gray-600 hover:text-gray-900 underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Employee CSV Upload */}
                      <div>
                        <label className="block text-sm font-medium mb-2">Employee List (CSV)</label>
                        <div className="space-y-2">
                          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer bg-white hover:bg-gray-50">
                            <Upload className="w-4 h-4" />
                            <span>Upload CSV</span>
                            <input
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={(e) => onCSVChange(index, e.target.files?.[0] || null)}
                            />
                          </label>
                          {venue._csvFile && (
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {venue._csvFile.name} ({venue._csvPreview?.rows.length} employees)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* CSV Preview */}
                    {venue._csvPreview && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Eye className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Employee Preview</span>
                        </div>
                        <div className="max-h-32 overflow-y-auto">
                          <div className="text-xs text-green-700 space-y-1">
                            {venue._csvPreview.rows.slice(0, 5).map((row, i) => (
                              <div key={i} className="flex gap-4">
                                <span className="font-medium">{row.first_name} {row.last_name}</span>
                                <span>{row.role}</span>
                                <span className="text-green-600">{row.email}</span>
                              </div>
                            ))}
                            {venue._csvPreview.rows.length > 5 && (
                              <div className="text-green-600 italic">
                                ...and {venue._csvPreview.rows.length - 5} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Remove Venue */}
                    <div className="flex justify-end pt-2">
                      {formData.venues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVenue(index)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" /> Remove Venue
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="text-gray-600">Venues</p>
                <p className="font-semibold text-lg">{formData.venues.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Total Tables</p>
                <p className="font-semibold text-lg">{totalTables}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Total Employees</p>
                <p className="font-semibold text-lg">
                  {formData.venues.reduce((acc, v) => acc + (v._csvPreview?.rows.length || 0), 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-600">Logos</p>
                <p className="font-semibold text-lg">
                  {formData.venues.filter(v => v.logo).length}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setFormData({ 
                email: '', 
                firstName: '', 
                lastName: '', 
                phone: '', 
                accountPhone: '', 
                companyName: '', 
                trialEndsAt: in30Days(), 
                venues: [emptyVenue()] 
              });
              setErrors({});
              toast('Form cleared');
            }}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 font-medium"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {loading ? 'Creating Account...' : 'Create Account & Venues'}
          </button>
        </div>
      </form>
    </div>
  );
}