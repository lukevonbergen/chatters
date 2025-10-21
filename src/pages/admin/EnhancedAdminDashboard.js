import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import {
  Search,
  Filter,
  Settings,
  Building2,
  Users,
  TrendingUp,
  X,
  Edit3,
  Save,
  Undo,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Palette,
  Clock,
  Star,
  Link,
  Phone,
  Globe,
  MapPin,
  Mail,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Info,
  CreditCard,
  Calendar as CalendarIcon,
  MessageSquare,
  MousePointerClick,
  ExternalLink,
  Sparkles,
  Loader2
} from 'lucide-react';

// Billing Management Component
const BillingManagement = ({ venue, onUpdate }) => {
  const [editingAccount, setEditingAccount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [seedingDemoData, setSeedingDemoData] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const account = venue.accounts;

  const startEditingAccount = () => {
    setEditingAccount({
      name: account?.name || '',
      is_paid: account?.is_paid || false,
      trial_ends_at: account?.trial_ends_at ? account.trial_ends_at.split('T')[0] : '',
      phone: account?.phone || '',
      demo_account: account?.demo_account || false
    });
  };

  const saveAccountChanges = async () => {
    if (!editingAccount || !account) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('accounts')
        .update({
          name: editingAccount.name,
          is_paid: editingAccount.is_paid,
          trial_ends_at: editingAccount.trial_ends_at || null,
          phone: editingAccount.phone,
          demo_account: editingAccount.demo_account
        })
        .eq('id', account.id);

      if (error) throw error;

      // Update local venue data
      const updatedVenue = {
        ...venue,
        accounts: { ...account, ...editingAccount }
      };
      
      onUpdate(updatedVenue);
      setEditingAccount(null);
      toast.success('Account updated successfully!');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Show date range picker for demo data
  const showDemoDataPicker = () => {
    setShowDateRangePicker(true);

    // Set default date range (yesterday only - single day to avoid timeouts)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    setSelectedDateRange({
      startDate: yesterday.toISOString().split('T')[0],
      endDate: yesterday.toISOString().split('T')[0]
    });
  };

  // Close date range picker
  const closeDateRangePicker = () => {
    setShowDateRangePicker(false);
    setSelectedDateRange({ startDate: '', endDate: '' });
  };

  // Populate demo data for the account
  const populateDemoData = async () => {
    if (!account || !selectedDateRange.startDate || !selectedDateRange.endDate) {
      toast.error('Please select a valid date range');
      return;
    }

    const dayCount = Math.ceil((new Date(selectedDateRange.endDate) - new Date(selectedDateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1;

    if (!window.confirm(
      `Populate demo data for "${account.name}"?\n\n` +
      `Date Range: ${selectedDateRange.startDate} to ${selectedDateRange.endDate} (${dayCount} days)\n\n` +
      `This will create PER VENUE PER DAY:\n` +
      `- 30 feedback sessions (~81 feedback items)\n` +
      `- 20 NPS submissions\n` +
      `- 1 Google review\n` +
      `- 1 historical rating snapshot\n\n` +
      `Dates with existing data will be SKIPPED.`
    )) {
      return;
    }

    setSeedingDemoData(true);
    setShowDateRangePicker(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Use production API URL for localhost, relative path for production
      const apiUrl = window.location.hostname === 'localhost'
        ? 'https://my.getchatters.com/api/admin/seed-demo'
        : '/api/admin/seed-demo';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          accountId: account.id,
          startDate: selectedDateRange.startDate,
          endDate: selectedDateRange.endDate
        })
      });

      // Log response for debugging
      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        throw new Error(`API returned invalid JSON. Status: ${response.status}. Response: ${responseText.substring(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(result.error || 'Failed to populate demo data');
      }

      toast.success(
        `Demo data created successfully!\n` +
        `${result.stats.sessionsCreated} sessions, ` +
        `${result.stats.feedbackCreated} feedback items, ` +
        `${result.stats.googleReviewsCreated} reviews, ` +
        `${result.stats.npsCreated} NPS submissions, ` +
        `${result.stats.externalRatingsCreated} rating snapshots\n` +
        `${result.stats.datesSkipped || 0} dates skipped (existing data)`,
        { duration: 6000 }
      );

      closeDateRangePicker();

    } catch (error) {
      console.error('Error populating demo data:', error);
      toast.error('Failed to populate demo data: ' + error.message);
    } finally {
      setSeedingDemoData(false);
    }
  };

  const getAccountStatus = () => {
    const now = new Date();
    if (account?.is_paid) return { status: 'paid', color: 'green', label: 'Paid Account' };
    if (account?.trial_ends_at && new Date(account.trial_ends_at) > now) {
      return { status: 'trial', color: 'blue', label: 'Trial Active' };
    }
    return { status: 'expired', color: 'red', label: 'Trial Expired' };
  };

  const status = getAccountStatus();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Account & Billing Management</h3>
      
      {/* Account Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Account Status</h4>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            status.color === 'green' ? 'bg-green-100 text-green-800' :
            status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            <CreditCard className="w-4 h-4 mr-2" />
            {status.label}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Name
            </label>
            {editingAccount ? (
              <input
                type="text"
                value={editingAccount.name}
                onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                {account?.name || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Phone
            </label>
            {editingAccount ? (
              <input
                type="tel"
                value={editingAccount.phone}
                onChange={(e) => setEditingAccount({...editingAccount, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
                {account?.phone || 'Not set'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="px-3 py-2 bg-white border border-gray-200 rounded-md">
              {account?.created_at ? new Date(account.created_at).toLocaleDateString() : 'Unknown'}
            </div>
          </div>
        </div>
      </div>

      {/* Billing Settings */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Billing & Trial Settings</h4>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Paid Account Status
                </div>
                <div className="text-sm text-gray-500">
                  {account?.is_paid ? 'This account has active billing' : 'This account is not paying'}
                </div>
              </div>
            </div>
            {editingAccount ? (
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={editingAccount.is_paid}
                  onChange={(e) => setEditingAccount({...editingAccount, is_paid: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Paid Account</span>
              </label>
            ) : (
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                account?.is_paid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {account?.is_paid ? 'Paid' : 'Not Paid'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Trial End Date
                </div>
                <div className="text-sm text-gray-500">
                  {account?.trial_ends_at 
                    ? `Trial ends ${new Date(account.trial_ends_at).toLocaleDateString()}`
                    : 'No trial date set'
                  }
                </div>
              </div>
            </div>
            {editingAccount ? (
              <input
                type="date"
                value={editingAccount.trial_ends_at}
                onChange={(e) => setEditingAccount({...editingAccount, trial_ends_at: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="text-sm text-gray-600">
                {account?.trial_ends_at 
                  ? new Date(account.trial_ends_at).toLocaleDateString()
                  : 'Not set'
                }
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <Info className="w-5 h-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  Demo Account
                </div>
                <div className="text-sm text-gray-500">
                  {account?.demo_account ? 'This is a demo account' : 'This is not a demo account'}
                </div>
              </div>
            </div>
            {editingAccount ? (
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={editingAccount.demo_account}
                  onChange={(e) => setEditingAccount({...editingAccount, demo_account: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm">Demo Account</span>
              </label>
            ) : (
              <div className={`px-2 py-1 rounded text-sm font-medium ${
                account?.demo_account ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {account?.demo_account ? 'Demo' : 'Live'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={showDemoDataPicker}
          disabled={seedingDemoData}
          className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
          title="Populate this account with demo feedback, reviews, and ratings"
        >
          {seedingDemoData ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Populating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Populate Demo Data</span>
            </>
          )}
        </button>

        <div className="flex space-x-3">
          {editingAccount ? (
            <>
              <button
                onClick={() => setEditingAccount(null)}
                disabled={saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAccountChanges}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={startEditingAccount}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Range Picker Modal for Demo Data */}
      {showDateRangePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Populate Demo Data
              </h2>
              <button
                onClick={closeDateRangePicker}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  Select the date range to populate with demo data for <strong>{account?.name}</strong>.
                </p>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-purple-800">
                    <strong>Per venue, per day:</strong><br/>
                    • 30 feedback sessions (~81 items)<br/>
                    • 20 NPS submissions<br/>
                    • 1 Google review<br/>
                    • 1 historical rating snapshot
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={selectedDateRange.startDate}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  max={selectedDateRange.endDate || undefined}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={selectedDateRange.endDate}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  min={selectedDateRange.startDate || undefined}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {selectedDateRange.startDate && selectedDateRange.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Duration:</strong> {Math.ceil((new Date(selectedDateRange.endDate) - new Date(selectedDateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Dates with existing data will be automatically skipped to avoid duplicates.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Recommendation:</strong> Populate 1-3 days at a time to avoid timeouts. You can run this multiple times for different date ranges.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDateRangePicker}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={populateDemoData}
                disabled={!selectedDateRange.startDate || !selectedDateRange.endDate}
                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Populate Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EnhancedAdminDashboard = () => {
  // Main state
  const [venues, setVenues] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Venue editing state
  const [editingVenue, setEditingVenue] = useState(null);
  const [originalVenueData, setOriginalVenueData] = useState(null);
  const [savingVenue, setSavingVenue] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalVenues: 0,
    activeVenues: 0,
    lockedVenues: 0,
    totalTables: 0,
    loading: true
  });

  // Load data on mount
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load accounts with user info
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select(`
          *,
          users(id, email, first_name, last_name, role)
        `)
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      // Load venues with comprehensive data
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select(`
          *,
          accounts:account_id(id, name, is_paid, trial_ends_at, demo_account),
          external_ratings(rating, ratings_count, fetched_at),
          staff(id, users(email, first_name, last_name, role))
        `)
        .order('created_at', { ascending: false });

      if (venuesError) throw venuesError;

      setAccounts(accountsData || []);
      setVenues(venuesData || []);

      // Calculate statistics
      const totalVenues = venuesData?.length || 0;
      const activeVenues = venuesData?.filter(v => {
        const account = v.accounts;
        const now = new Date();
        return account?.is_paid || (account?.trial_ends_at && new Date(account.trial_ends_at) > now);
      }).length || 0;
      const lockedVenues = venuesData?.filter(v => v.venue_locked).length || 0;
      const totalTables = venuesData?.reduce((sum, v) => sum + (v.table_count || 0), 0) || 0;

      setStats({
        totalVenues,
        activeVenues,
        lockedVenues,
        totalTables,
        loading: false
      });

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  // Filter venues based on search and status
  const filteredVenues = useMemo(() => {
    if (!venues) return [];
    
    return venues.filter(venue => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.accounts?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.staff?.some(s => 
          s.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${s.users?.first_name} ${s.users?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Status filter
      const account = venue.accounts;
      const now = new Date();
      const isActive = account?.is_paid || (account?.trial_ends_at && new Date(account.trial_ends_at) > now);
      const isLocked = venue.venue_locked;
      
      const matchesStatus = filterStatus === 'all' || 
        (filterStatus === 'active' && isActive) ||
        (filterStatus === 'inactive' && !isActive) ||
        (filterStatus === 'locked' && isLocked) ||
        (filterStatus === 'unlocked' && !isLocked);

      return matchesSearch && matchesStatus;
    });
  }, [venues, searchTerm, filterStatus]);

  const startEditing = (venue) => {
    setEditingVenue({ ...venue });
    setOriginalVenueData({ ...venue });
  };

  const cancelEditing = () => {
    setEditingVenue(null);
    setOriginalVenueData(null);
  };

  const saveVenue = async () => {
    if (!editingVenue) return;

    setSavingVenue(true);
    try {
      const { error } = await supabase
        .from('venues')
        .update({
          name: editingVenue.name,
          address: editingVenue.address,
          phone: editingVenue.phone,
          website: editingVenue.website,
          table_count: editingVenue.table_count,
          primary_color: editingVenue.primary_color,
          secondary_color: editingVenue.secondary_color,
          venue_locked: editingVenue.venue_locked,
          session_timeout_hours: editingVenue.session_timeout_hours,
          feedback_hours: editingVenue.feedback_hours,
          tripadvisor_link: editingVenue.tripadvisor_link,
          google_review_link: editingVenue.google_review_link
        })
        .eq('id', editingVenue.id);

      if (error) throw error;

      // Update local state
      setVenues(prev => prev.map(v => 
        v.id === editingVenue.id ? { ...v, ...editingVenue } : v
      ));

      if (selectedVenue?.id === editingVenue.id) {
        setSelectedVenue({ ...selectedVenue, ...editingVenue });
      }

      setEditingVenue(null);
      setOriginalVenueData(null);
      toast.success('Venue updated successfully!');
    } catch (error) {
      console.error('Error saving venue:', error);
      toast.error('Failed to save venue: ' + error.message);
    } finally {
      setSavingVenue(false);
    }
  };

  const toggleVenueLock = async (venue) => {
    try {
      const newLockStatus = !venue.venue_locked;
      
      const { error } = await supabase
        .from('venues')
        .update({ venue_locked: newLockStatus })
        .eq('id', venue.id);

      if (error) throw error;

      // Update local state
      setVenues(prev => prev.map(v => 
        v.id === venue.id ? { ...v, venue_locked: newLockStatus } : v
      ));

      if (selectedVenue?.id === venue.id) {
        setSelectedVenue({ ...selectedVenue, venue_locked: newLockStatus });
      }

      toast.success(`Venue ${newLockStatus ? 'locked' : 'unlocked'} successfully!`);
    } catch (error) {
      console.error('Error toggling venue lock:', error);
      toast.error('Failed to toggle venue lock');
    }
  };

  const getVenueStatus = (venue) => {
    const account = venue.accounts;
    const now = new Date();
    
    if (account?.is_paid) {
      return { status: 'paid', color: 'green', label: 'Paid' };
    }
    
    if (account?.trial_ends_at && new Date(account.trial_ends_at) > now) {
      return { status: 'trial', color: 'blue', label: 'Trial' };
    }
    
    return { status: 'expired', color: 'red', label: 'Expired' };
  };

  const formatAddress = (address) => {
    if (!address) return 'No address';
    if (typeof address === 'string') return address;
    
    const parts = [address.line1, address.line2, address.city, address.county, address.postalCode]
      .filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No address';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                Chatters Admin Center
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Venues
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalVenues}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Venues
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeVenues}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Lock className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Locked Venues
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.lockedVenues}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Tables
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalTables}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search venues, accounts, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Venues</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="locked">Locked</option>
                  <option value="unlocked">Unlocked</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredVenues.length} of {venues.length} venues
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVenues.map((venue) => {
            const status = getVenueStatus(venue);
            const googleRating = venue.external_ratings?.[0];
            const isEditing = editingVenue?.id === venue.id;
            
            return (
              <div
                key={venue.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {venue.name || 'Unnamed Venue'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.color === 'green' ? 'bg-green-100 text-green-800' :
                        status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {status.label}
                      </span>
                      {venue.venue_locked && (
                        <Lock className="w-4 h-4 text-yellow-500" title="Venue Locked" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => toggleVenueLock(venue)}
                            className={`p-2 rounded-lg transition-colors ${
                              venue.venue_locked 
                                ? 'text-yellow-600 hover:bg-yellow-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={venue.venue_locked ? 'Unlock venue' : 'Lock venue'}
                          >
                            {venue.venue_locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEditing(venue)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit venue"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={cancelEditing}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Cancel editing"
                          >
                            <Undo className="w-4 h-4" />
                          </button>
                          <button
                            onClick={saveVenue}
                            disabled={savingVenue}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Save changes"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="px-6 py-4 space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Venue Name
                          </label>
                          <input
                            type="text"
                            value={editingVenue.name || ''}
                            onChange={(e) => setEditingVenue({...editingVenue, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Table Count
                          </label>
                          <input
                            type="number"
                            value={editingVenue.table_count || ''}
                            onChange={(e) => setEditingVenue({...editingVenue, table_count: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="w-4 h-4 mr-2" />
                          <span>{venue.table_count || 0} tables</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="truncate">{formatAddress(venue.address)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Account Info */}
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="truncate">
                      {venue.accounts?.name || 'No account'} 
                      {venue.staff?.length > 0 && ` • ${venue.staff.length} staff`}
                    </span>
                  </div>

                  {/* Google Rating */}
                  {googleRating && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      <span>
                        {googleRating.rating?.toFixed(1)} ⭐ ({googleRating.ratings_count} reviews)
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedVenue(venue)}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Full Details
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVenues.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No venues found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>

      {/* Venue Details Modal */}
      {selectedVenue && (
        <VenueDetailsModal
          venue={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onUpdate={(updatedVenue) => {
            setVenues(prev => prev.map(v => 
              v.id === updatedVenue.id ? { ...v, ...updatedVenue } : v
            ));
            setSelectedVenue({ ...selectedVenue, ...updatedVenue });
          }}
        />
      )}
    </div>
  );
};

// Venue Details Modal Component
const VenueDetailsModal = ({ venue, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [editingData, setEditingData] = useState(null);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'feedback', label: 'Feedback', icon: Clock },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'billing', label: 'Account & Billing', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const startEditing = () => {
    setEditingData({ ...venue });
  };

  const saveChanges = async () => {
    if (!editingData) return;

    setSaving(true);
    try {
      // Filter out only updatable venue fields (exclude relations)
      const venueFields = {};
      
      // Only include fields that have actually changed and are valid
      if (editingData.name !== undefined) venueFields.name = editingData.name;
      if (editingData.address !== undefined) venueFields.address = editingData.address;
      if (editingData.phone !== undefined) venueFields.phone = editingData.phone;
      if (editingData.website !== undefined) venueFields.website = editingData.website;
      if (editingData.table_count !== undefined) venueFields.table_count = editingData.table_count;
      if (editingData.primary_color !== undefined) venueFields.primary_color = editingData.primary_color;
      if (editingData.secondary_color !== undefined) venueFields.secondary_color = editingData.secondary_color;
      if (editingData.venue_locked !== undefined) venueFields.venue_locked = editingData.venue_locked;
      if (editingData.session_timeout_hours !== undefined) venueFields.session_timeout_hours = editingData.session_timeout_hours;
      if (editingData.feedback_hours !== undefined) venueFields.feedback_hours = editingData.feedback_hours;
      if (editingData.tripadvisor_link !== undefined) venueFields.tripadvisor_link = editingData.tripadvisor_link;
      if (editingData.google_review_link !== undefined) venueFields.google_review_link = editingData.google_review_link;
      if (editingData.place_id !== undefined) venueFields.place_id = editingData.place_id;

      // Check current user and permissions
      const { data: currentUser } = await supabase.auth.getUser();
      console.log('Current user:', currentUser.user?.email, 'ID:', currentUser.user?.id);
      
      console.log('Updating venue with fields:', venueFields);
      console.log('Venue ID:', venue.id);

      const { data, error, count } = await supabase
        .from('venues')
        .update(venueFields)
        .eq('id', venue.id)
        .select(); // Add select to return updated data

      console.log('Supabase response:', { data, error, count });

      if (error) {
        console.error('Supabase error details:', error);
        if (error.code === 'PGRST116' || error.message?.includes('RLS')) {
          throw new Error('Permission denied: Admin RLS policy missing. Please contact support to add the admin venue management policy.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No rows were updated - venue may not exist or you may not have permission to edit this venue');
      }

      onUpdate(editingData);
      setEditingData(null);
      toast.success('Venue updated successfully!');
    } catch (error) {
      console.error('Error saving venue:', error);
      toast.error('Failed to save venue: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    const data = editingData || venue;
    const isEditing = !!editingData;

    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={data.name || ''}
                    onChange={(e) => setEditingData({...editingData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    {data.name || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Count
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={data.table_count || ''}
                    onChange={(e) => setEditingData({...editingData, table_count: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    {data.table_count || 0}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={data.phone || ''}
                    onChange={(e) => setEditingData({...editingData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    {data.phone || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={data.website || ''}
                    onChange={(e) => setEditingData({...editingData, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    {data.website ? (
                      <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {data.website}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['line1', 'line2', 'city', 'county', 'postalCode', 'country'].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field === 'line1' ? 'Address Line 1' :
                       field === 'line2' ? 'Address Line 2' :
                       field === 'postalCode' ? 'Postal Code' :
                       field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.address?.[field] || ''}
                        onChange={(e) => setEditingData({
                          ...editingData, 
                          address: {...(editingData.address || {}), [field]: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                        {data.address?.[field] || 'Not set'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'branding':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Branding Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Color
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={data.primary_color || '#000000'}
                      onChange={(e) => setEditingData({...editingData, primary_color: e.target.value})}
                      className="h-10 w-20 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={data.primary_color || '#000000'}
                      onChange={(e) => setEditingData({...editingData, primary_color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-10 w-20 border border-gray-300 rounded-md"
                      style={{ backgroundColor: data.primary_color || '#000000' }}
                    ></div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex-1">
                      {data.primary_color || '#000000'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Color
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={data.secondary_color || '#ffffff'}
                      onChange={(e) => setEditingData({...editingData, secondary_color: e.target.value})}
                      className="h-10 w-20 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      value={data.secondary_color || '#ffffff'}
                      onChange={(e) => setEditingData({...editingData, secondary_color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-10 w-20 border border-gray-300 rounded-md"
                      style={{ backgroundColor: data.secondary_color || '#ffffff' }}
                    ></div>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex-1">
                      {data.secondary_color || '#ffffff'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logo Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo
              </label>
              <div className="mt-1 flex items-center space-x-4">
                {data.logo ? (
                  <img 
                    src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/venue-assets/${data.logo}`}
                    alt="Venue logo"
                    className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {data.logo ? 'Logo uploaded' : 'No logo uploaded'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Feedback Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (Hours)
              </label>
              {isEditing ? (
                <select
                  value={data.session_timeout_hours || 2}
                  onChange={(e) => setEditingData({...editingData, session_timeout_hours: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 hour</option>
                  <option value={2}>2 hours</option>
                  <option value={4}>4 hours</option>
                  <option value={6}>6 hours</option>
                  <option value={8}>8 hours</option>
                  <option value={12}>12 hours</option>
                  <option value={24}>24 hours</option>
                </select>
              ) : (
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                  {data.session_timeout_hours || 2} hours
                </div>
              )}
            </div>

            {/* Feedback Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback Collection Hours
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-sm text-gray-600">
                  {data.feedback_hours ? 'Custom hours configured' : 'Default: 9:00 AM - 10:00 PM daily'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'reviews':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Review Platform Links</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  TripAdvisor Link
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={data.tripadvisor_link || ''}
                    onChange={(e) => setEditingData({...editingData, tripadvisor_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://www.tripadvisor.com/..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    {data.tripadvisor_link ? (
                      <a href={data.tripadvisor_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate block">
                        {data.tripadvisor_link}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Google Review Link
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={data.google_review_link || ''}
                    onChange={(e) => setEditingData({...editingData, google_review_link: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://g.page/..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                    {data.google_review_link ? (
                      <a href={data.google_review_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate block">
                        {data.google_review_link}
                      </a>
                    ) : (
                      'Not set'
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Google Reviews Integration Status */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Google Reviews Integration</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {venue.venue_locked ? (
                      <Lock className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <Unlock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Venue Lock Status
                      </div>
                      <div className="text-sm text-gray-500">
                        {venue.venue_locked ? 'Locked - Google venue cannot be changed' : 'Unlocked - Google venue can be modified'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      // Toggle venue lock
                      const newStatus = !venue.venue_locked;
                      supabase
                        .from('venues')
                        .update({ venue_locked: newStatus })
                        .eq('id', venue.id)
                        .then(({ error }) => {
                          if (!error) {
                            onUpdate({ ...venue, venue_locked: newStatus });
                            toast.success(`Venue ${newStatus ? 'locked' : 'unlocked'} successfully!`);
                          }
                        });
                    }}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      venue.venue_locked 
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {venue.venue_locked ? 'Unlock' : 'Lock'}
                  </button>
                </div>

                {venue.place_id && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="text-sm font-medium text-green-800">
                        Google Place Connected
                      </div>
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Place ID: {venue.place_id}
                    </div>
                  </div>
                )}

                {venue.external_ratings?.[0] && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <div className="text-sm font-medium text-blue-800">
                          Current Google Rating
                        </div>
                      </div>
                      <div className="text-sm text-blue-700">
                        {venue.external_ratings[0].rating?.toFixed(1)} ⭐ 
                        ({venue.external_ratings[0].ratings_count} reviews)
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Last updated: {new Date(venue.external_ratings[0].fetched_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'staff':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Staff Management</h3>
            
            <div className="space-y-4">
              {venue.staff?.length > 0 ? (
                venue.staff.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700">
                          {staff.users?.first_name?.[0]}{staff.users?.last_name?.[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {staff.users?.first_name} {staff.users?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {staff.users?.email} • {staff.users?.role}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-8 w-8 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No staff assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Staff members will appear here when assigned to this venue
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'billing':
        return <BillingManagement venue={venue} onUpdate={onUpdate} />;

      case 'analytics':
        return <VenueAnalytics venue={venue} />;

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {venue.name || 'Unnamed Venue'}
            </h2>
            <p className="text-sm text-gray-500">
              {venue.accounts?.name} • {venue.table_count || 0} tables
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!editingData ? (
              <button
                onClick={startEditing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditingData(null)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Venue Analytics Component
const VenueAnalytics = ({ venue }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Fetch feedback analytics
        const { data: feedbackData } = await supabase
          .from('feedback')
          .select('*')
          .eq('venue_id', venue.id)
          .gte('created_at', getDateRange(timeRange));

        // Process analytics data
        const processedAnalytics = {
          feedback: processFeedbackData(feedbackData || []),
          reviews: { byPlatform: {}, total: 0 }, // No review interactions data available
          overview: {
            totalFeedback: feedbackData?.length || 0,
            averageRating: calculateAverageRating(feedbackData || []),
            reviewClicks: 0, // No review interactions data available
            activeStaff: venue.staff?.length || 0
          }
        };

        setAnalytics(processedAnalytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [venue.id, timeRange]);

  const getDateRange = (range) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const date = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return date.toISOString();
  };

  const processFeedbackData = (feedback) => {
    const byRating = feedback.reduce((acc, item) => {
      const rating = item.rating || 0;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {});

    const byDay = feedback.reduce((acc, item) => {
      const day = new Date(item.created_at).toLocaleDateString();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return { byRating, byDay, total: feedback.length };
  };

  const processReviewData = (interactions) => {
    const byPlatform = interactions.reduce((acc, item) => {
      const platform = item.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    return { byPlatform, total: interactions.length };
  };

  const calculateAverageRating = (feedback) => {
    if (!feedback.length) return 0;
    const sum = feedback.reduce((acc, item) => acc + (item.rating || 0), 0);
    return (sum / feedback.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Analytics & Insights</h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-blue-600 mr-2" />
            <div className="text-blue-600 text-sm font-medium">Total Feedback</div>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {analytics?.overview.totalFeedback || 0}
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-green-600 mr-2" />
            <div className="text-green-600 text-sm font-medium">Avg Rating</div>
          </div>
          <div className="text-2xl font-bold text-green-900 mt-1">
            {analytics?.overview.averageRating || '0.0'}
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <MousePointerClick className="w-5 h-5 text-purple-600 mr-2" />
            <div className="text-purple-600 text-sm font-medium">Review Clicks</div>
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">
            {analytics?.overview.reviewClicks || 0}
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-orange-600 mr-2" />
            <div className="text-orange-600 text-sm font-medium">Active Staff</div>
          </div>
          <div className="text-2xl font-bold text-orange-900 mt-1">
            {analytics?.overview.activeStaff || 0}
          </div>
        </div>
      </div>

      {/* Feedback Distribution */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Feedback Distribution
        </h4>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = analytics?.feedback.byRating[rating] || 0;
            const total = analytics?.feedback.total || 1;
            const percentage = ((count / total) * 100).toFixed(1);
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 w-16 text-right">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Platform Performance */}
      {analytics?.reviews.total > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Review Platform Clicks
          </h4>
          <div className="space-y-3">
            {Object.entries(analytics.reviews.byPlatform).map(([platform, count]) => {
              const percentage = ((count / analytics.reviews.total) * 100).toFixed(1);
              
              return (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium capitalize">{platform}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {count} clicks ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Venue Configuration Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Configuration Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Google Reviews</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                venue.place_id ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {venue.place_id ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Venue Locked</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                venue.venue_locked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {venue.venue_locked ? 'Locked' : 'Active'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Table Count</span>
              <span className="text-sm font-medium text-gray-900">
                {venue.table_count || 0} tables
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Feedback Hours</span>
              <span className="text-sm font-medium text-gray-900">
                {venue.feedback_hours || 24}h timeout
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Account Type</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                venue.accounts?.demo_account ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {venue.accounts?.demo_account ? 'Demo' : 'Paid'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Google Rating</span>
              <span className="text-sm font-medium text-gray-900">
                {venue.external_ratings?.[0]?.rating?.toFixed(1) || 'N/A'} ⭐
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Export Analytics Data</h4>
            <p className="text-xs text-gray-600 mt-1">
              Download detailed analytics and feedback data for this venue
            </p>
          </div>
          <button
            onClick={() => {
              // In a real implementation, this would trigger a CSV/Excel export
              alert('Export functionality would be implemented here');
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;