import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { TrendingUp, DollarSign, Users, Shield, Settings } from 'lucide-react';

const RevenueImpactAnalysis = ({ venueId }) => {
  const [data, setData] = useState({
    totalFeedback: 0,
    positiveFeedback: 0,
    neutralFeedback: 0,
    negativeFeedback: 0,
    resolvedNegative: 0,
    avgResolutionTime: 0,
    tableCount: 0
  });
  
  const [timeFilter, setTimeFilter] = useState('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  
  // Industry assumptions - these could be made configurable per venue
  const [assumptions, setAssumptions] = useState({
    avgTransactionValue: 28.50, // Average UK pub/restaurant meal
    visitsPerMonth: 2.5, // Average customer frequency
    customerLifetimeMonths: 18, // How long customers stay loyal
    lostCustomerRate: 0.65, // % of unresolved negative feedback that results in lost customers
    referralRate: 0.12, // % of positive feedback that generates referrals
    retentionImpactRate: 0.08, // % improvement in retention from good feedback management
    acquisitionCost: 42 // Cost to acquire new customer
  });

  const getDateRange = (filter) => {
    const now = new Date();
    let startDate, endDate;

    switch (filter) {
      case 'week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        startDate = startOfWeek;
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date();
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        startDate = quarterStart;
        endDate = new Date();
        break;
      case 'custom':
        startDate = customStartDate ? new Date(customStartDate) : new Date(0);
        endDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date();
        break;
      default:
        startDate = new Date(0);
        endDate = new Date();
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const fetchRevenueData = async () => {
    if (!venueId) return;
    
    const { startDate, endDate } = getDateRange(timeFilter);

    // Get feedback data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('rating, sentiment, created_at, resolved_at')
      .eq('venue_id', venueId)
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    // Get venue data
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('table_count')
      .eq('id', venueId)
      .single();

    if (feedbackError || venueError) {
      console.error('Error fetching data:', feedbackError || venueError);
      return;
    }

    if (!feedbackData) return;

    // Categorize feedback
    const positive = feedbackData.filter(f => f.rating >= 4).length;
    const neutral = feedbackData.filter(f => f.rating === 3).length;
    const negative = feedbackData.filter(f => f.rating <= 2).length;
    const resolvedNegative = feedbackData.filter(f => f.rating <= 2 && f.resolved_at).length;

    // Calculate average resolution time for resolved negative feedback
    const resolvedNegativeFeedback = feedbackData.filter(f => f.rating <= 2 && f.resolved_at);
    const avgResolutionTime = resolvedNegativeFeedback.length > 0 
      ? resolvedNegativeFeedback.reduce((sum, f) => {
          const created = new Date(f.created_at);
          const resolved = new Date(f.resolved_at);
          return sum + (resolved - created) / (1000 * 60); // minutes
        }, 0) / resolvedNegativeFeedback.length
      : 0;

    setData({
      totalFeedback: feedbackData.length,
      positiveFeedback: positive,
      neutralFeedback: neutral,
      negativeFeedback: negative,
      resolvedNegative,
      avgResolutionTime,
      tableCount: venueData?.table_count || 0
    });
  };

  useEffect(() => {
    fetchRevenueData();
  }, [venueId, timeFilter, customStartDate, customEndDate]);

  const calculateRevenueImpact = () => {
    const { negativeFeedback, resolvedNegative, positiveFeedback } = data;
    const monthlyRevenuePerCustomer = assumptions.avgTransactionValue * assumptions.visitsPerMonth;
    const customerLifetimeValue = monthlyRevenuePerCustomer * assumptions.customerLifetimeMonths;

    // 1. Revenue Protected from Resolving Negative Feedback
    const potentialLostCustomers = negativeFeedback * assumptions.lostCustomerRate;
    const actualLostCustomers = (negativeFeedback - resolvedNegative) * assumptions.lostCustomerRate;
    const customersRetained = potentialLostCustomers - actualLostCustomers;
    const revenueProtected = customersRetained * customerLifetimeValue;

    // 2. Referral Value from Positive Feedback
    const referralsGenerated = positiveFeedback * assumptions.referralRate;
    const referralValue = referralsGenerated * customerLifetimeValue;

    // 3. Retention Improvement Value
    const baseCustomers = Math.max(data.tableCount * 4, 50); // Estimate based on table count
    const retentionImprovement = baseCustomers * assumptions.retentionImpactRate;
    const retentionValue = retentionImprovement * monthlyRevenuePerCustomer * assumptions.customerLifetimeMonths;

    // 4. Cost Savings from Customer Retention vs Acquisition
    const acquisitionCostSavings = customersRetained * assumptions.acquisitionCost;

    return {
      revenueProtected,
      referralValue,
      retentionValue,
      acquisitionCostSavings,
      totalImpact: revenueProtected + referralValue + retentionValue,
      customersRetained: Math.round(customersRetained * 10) / 10,
      referralsGenerated: Math.round(referralsGenerated * 10) / 10
    };
  };

  const impact = calculateRevenueImpact();
  const resolutionRate = data.negativeFeedback > 0 ? (data.resolvedNegative / data.negativeFeedback) * 100 : 0;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const hours = Math.floor((minutes % 1440) / 60);
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
    }
  };

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    setIsCustom(filter === 'custom');
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'week': return 'this week';
      case 'month': return 'this month';
      case 'quarter': return 'this quarter';
      case 'custom': return customStartDate && customEndDate ? `${customStartDate} to ${customEndDate}` : 'custom period';
      default: return 'all time';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Revenue Impact Analysis</h2>
            <p className="text-gray-600 text-sm">
              Estimated revenue impact from customer feedback management.
            </p>
          </div>
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <Settings className="w-4 h-4" />
            <span>View Assumptions</span>
          </button>
        </div>
        
        {/* Time Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['week', 'month', 'quarter', 'custom'].map((filter) => (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                timeFilter === filter
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        {isCustom && (
          <div className="flex gap-2 mt-3 items-center">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            />
            <span className="text-xs text-gray-500">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>
        )}

        {/* Assumptions Panel */}
        {showAssumptions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Calculation Assumptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-600">
              <div>Average transaction value: {formatCurrency(assumptions.avgTransactionValue)}</div>
              <div>Customer visits per month: {assumptions.visitsPerMonth}</div>
              <div>Customer lifetime: {assumptions.customerLifetimeMonths} months</div>
              <div>Lost customer rate (unresolved): {(assumptions.lostCustomerRate * 100).toFixed(0)}%</div>
              <div>Referral rate from positive feedback: {(assumptions.referralRate * 100).toFixed(0)}%</div>
              <div>Customer acquisition cost: {formatCurrency(assumptions.acquisitionCost)}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * These are industry-standard estimates. Actual results may vary based on your business model.
            </p>
          </div>
        )}
      </div>

      {data.totalFeedback === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No feedback data available for {getTimeFilterLabel()}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs font-medium">Total Estimated Impact</p>
                  <p className="text-green-900 text-lg font-bold">{formatCurrency(impact.totalImpact)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs font-medium">Revenue Protected</p>
                  <p className="text-blue-900 text-lg font-bold">{formatCurrency(impact.revenueProtected)}</p>
                </div>
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs font-medium">Referral Value</p>
                  <p className="text-purple-900 text-lg font-bold">{formatCurrency(impact.referralValue)}</p>
                </div>
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-xs font-medium">Resolution Rate</p>
                  <p className="text-orange-900 text-lg font-bold">{resolutionRate.toFixed(0)}%</p>
                </div>
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Impact Breakdown for {getTimeFilterLabel()}</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Customer Retention</p>
                  <p className="text-xs text-gray-500">{impact.customersRetained} customers retained from resolving negative feedback</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(impact.revenueProtected)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Word-of-Mouth Referrals</p>
                  <p className="text-xs text-gray-500">{impact.referralsGenerated} estimated new customers from positive feedback</p>
                </div>
                <span className="text-sm font-semibold text-purple-600">{formatCurrency(impact.referralValue)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Enhanced Customer Loyalty</p>
                  <p className="text-xs text-gray-500">Improved retention from better feedback management</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">{formatCurrency(impact.retentionValue)}</span>
              </div>

              {data.avgResolutionTime > 0 && (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Average Resolution Time</p>
                    <p className="text-xs text-gray-500">How quickly you respond to negative feedback</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{formatTime(data.avgResolutionTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* ROI Calculation */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-2">Chatters Monthly Subscription ROI</p>
              <div className="flex items-center justify-center space-x-4">
                <span className="text-lg font-bold text-gray-900">{formatCurrency(impact.totalImpact)}</span>
                <span className="text-gray-500">÷</span>
                <span className="text-lg font-bold text-gray-900">£199</span>
                <span className="text-gray-500">=</span>
                <span className="text-2xl font-bold text-green-600">
                  {(impact.totalImpact / 199).toFixed(1)}x ROI
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Estimated return on investment based on revenue impact calculations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueImpactAnalysis;