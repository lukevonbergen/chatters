import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../../utils/supabase';
import {
  Search,
  Settings,
  Building2,
  Users,
  RefreshCw,
  Plus,
  X,
  ChevronRight,
  CreditCard,
  Calendar,
  ExternalLink,
  Clock,
  Loader2,
  LogOut
} from 'lucide-react';

const AdminAccountsList = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    paidAccounts: 0,
    trialAccounts: 0,
    totalVenues: 0,
    loading: true
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);

      // Load accounts with master user and venue count
      const { data: accountsData, error: accountsError} = await supabase
        .from('accounts')
        .select(`
          *,
          users(id, email, first_name, last_name, role),
          venues(id)
        `)
        .order('created_at', { ascending: false });

      if (accountsError) throw accountsError;

      // Process accounts to include venue count
      const processedAccounts = accountsData?.map(account => ({
        ...account,
        venueCount: account.venues?.length || 0,
        masterUser: account.users?.find(u => u.role === 'master') || account.users?.[0]
      })) || [];

      setAccounts(processedAccounts);

      // Calculate statistics
      const now = new Date();
      const paidCount = processedAccounts.filter(a => a.is_paid).length;
      const trialCount = processedAccounts.filter(a =>
        !a.is_paid && a.trial_ends_at && new Date(a.trial_ends_at) > now
      ).length;
      const totalVenueCount = processedAccounts.reduce((sum, a) => sum + a.venueCount, 0);

      setStats({
        totalAccounts: processedAccounts.length,
        paidAccounts: paidCount,
        trialAccounts: trialCount,
        totalVenues: totalVenueCount,
        loading: false
      });

    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const getAccountStatus = (account) => {
    const now = new Date();

    if (account.is_paid) {
      return {
        status: 'paid',
        color: 'green',
        label: 'Paid',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    }

    if (account.trial_ends_at && new Date(account.trial_ends_at) > now) {
      return {
        status: 'trial',
        color: 'blue',
        label: 'Trial',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      };
    }

    return {
      status: 'expired',
      color: 'red',
      label: 'Expired',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    };
  };

  const filteredAccounts = accounts.filter(account => {
    if (!searchTerm) return true;

    const search = searchTerm.toLowerCase();
    return (
      account.name?.toLowerCase().includes(search) ||
      account.masterUser?.email?.toLowerCase().includes(search) ||
      account.masterUser?.first_name?.toLowerCase().includes(search) ||
      account.masterUser?.last_name?.toLowerCase().includes(search)
    );
  });

  const getStripeCustomerUrl = (stripeCustomerId) => {
    if (!stripeCustomerId) return null;
    const isLive = !stripeCustomerId.startsWith('cus_test_');
    const mode = isLive ? '' : 'test/';
    return `https://dashboard.stripe.com/${mode}customers/${stripeCustomerId}`;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Settings className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Admin Center
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Manage accounts, users, and billing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAccounts}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Account
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Accounts
                </p>
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.totalAccounts}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building2 className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Paid Accounts
                </p>
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.paidAccounts}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CreditCard className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Trial Accounts
                </p>
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.trialAccounts}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  Total Venues
                </p>
                <p className="text-3xl font-semibold text-gray-900">
                  {stats.totalVenues}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Building2 className="h-7 w-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl mb-6">
          <div className="p-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search accounts by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="h-1 w-1 bg-gray-400 rounded-full"></div>
              <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredAccounts.length}</span> of <span className="font-medium text-gray-900">{accounts.length}</span> accounts
              </p>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account / Company
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Master User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billing Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Venues
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stripe
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => {
                  const status = getAccountStatus(account);
                  const stripeUrl = getStripeCustomerUrl(account.stripe_customer_id);

                  return (
                    <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {account.name || 'Unnamed Account'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {account.masterUser ? (
                            <>
                              <div className="font-medium">
                                {account.masterUser.first_name} {account.masterUser.last_name}
                              </div>
                              <div className="text-gray-500">{account.masterUser.email}</div>
                            </>
                          ) : (
                            <span className="text-gray-400">No master user</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {account.trial_ends_at ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(account.trial_ends_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          {account.venueCount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(account.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {stripeUrl ? (
                          <a
                            href={stripeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400">No Stripe</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/admin/accounts/${account.id}`)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Details
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAccounts.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-50 rounded-2xl w-fit mx-auto mb-4">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No accounts found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first account to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <CreateAccountModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadAccounts();
          }}
        />
      )}
    </div>
  );
};

// Create Account Modal Component
const CreateAccountModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    startTrial: true,
    trialDays: 14
  });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.companyName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const apiUrl = window.location.hostname === 'localhost'
        ? 'https://my.getchatters.com/api/admin/create-account'
        : '/api/admin/create-account';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          companyName: formData.companyName,
          startTrial: formData.startTrial,
          trialDays: formData.trialDays
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      toast.success('Account created successfully! Invitation email sent.');
      onSuccess();

    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account: ' + error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create New Account</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.startTrial}
                onChange={(e) => setFormData({...formData, startTrial: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Start Trial</span>
            </label>

            {formData.startTrial && (
              <div className="mt-3 ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Trial Duration
                </label>
                <select
                  value={formData.trialDays}
                  onChange={(e) => setFormData({...formData, trialDays: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>
            )}
          </div>
        </form>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={creating}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccountsList;
