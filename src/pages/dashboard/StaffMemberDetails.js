import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StaffMemberDetails = () => {
  const { staffId } = useParams();
  const navigate = useNavigate();
  const { venueId } = useVenue();
  
  const [staffMember, setStaffMember] = useState(null);
  const [resolvedFeedback, setResolvedFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [totalStats, setTotalStats] = useState({
    feedbackResolved: 0,
    assistanceResolved: 0,
    totalResolved: 0
  });

  usePageTitle(staffMember ? `${staffMember.name} - Resolved Feedback` : 'Staff Details');

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { start: today.toISOString(), end: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString() };
      case 'thisWeek': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        return { start: startOfWeek.toISOString(), end: new Date().toISOString() };
      }
      case 'last7':
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };
      case 'last30':
        return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };
      case 'last90':
        return { start: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() };
      case 'all':
      default:
        return { start: null, end: new Date().toISOString() };
    }
  };

  const fetchStaffMemberDetails = async () => {
    setLoading(true);
    
    try {
      // Get staff member info
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role, email, phone, created_at')
        .eq('id', staffId)
        .single();

      if (employeeError || !employeeData) {
        console.error('Error fetching staff member:', employeeError);
        return;
      }

      const staffInfo = {
        id: employeeData.id,
        name: `${employeeData.first_name} ${employeeData.last_name}`,
        role: employeeData.role,
        email: employeeData.email,
        phone: employeeData.phone,
        joinedDate: employeeData.created_at
      };

      setStaffMember(staffInfo);

      // Get resolved feedback and assistance requests
      await fetchResolvedItems(staffId);

    } catch (error) {
      console.error('Error loading staff member details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResolvedItems = async (employeeId) => {
    const { start: fromDate } = getDateRange(timeFilter);

    // Fetch resolved feedback sessions
    let feedbackQuery = supabase
      .from('feedback')
      .select(`
        session_id, 
        resolved_by, 
        resolved_at,
        rating,
        feedback_text,
        table_number,
        created_at,
        venue_id,
        venues!inner (name)
      `)
      .eq('venue_id', venueId)
      .eq('resolved_by', employeeId)
      .not('resolved_by', 'is', null);

    if (fromDate) feedbackQuery = feedbackQuery.gte('resolved_at', fromDate);

    // Fetch resolved assistance requests
    let assistanceQuery = supabase
      .from('assistance_requests')
      .select(`
        id,
        resolved_by,
        resolved_at,
        request_type,
        description,
        table_number,
        created_at,
        venue_id,
        venues!inner (name)
      `)
      .eq('venue_id', venueId)
      .eq('resolved_by', employeeId)
      .not('resolved_by', 'is', null);

    if (fromDate) assistanceQuery = assistanceQuery.gte('resolved_at', fromDate);

    const [
      { data: feedbackData, error: feedbackError },
      { data: assistanceData, error: assistanceError }
    ] = await Promise.all([feedbackQuery, assistanceQuery]);

    if (feedbackError || assistanceError) {
      console.error('Error fetching resolved items:', feedbackError || assistanceError);
      return;
    }

    // Combine and format the data
    const combinedData = [];

    // Process feedback sessions (group by session_id to avoid duplicates)
    if (feedbackData?.length) {
      const sessionMap = {};
      feedbackData.forEach(item => {
        if (item.session_id && !sessionMap[item.session_id]) {
          sessionMap[item.session_id] = {
            id: item.session_id,
            type: 'feedback',
            rating: item.rating,
            content: item.feedback_text,
            table_number: item.table_number,
            created_at: item.created_at,
            resolved_at: item.resolved_at,
            venue_name: item.venues?.name
          };
        }
      });
      combinedData.push(...Object.values(sessionMap));
    }

    // Process assistance requests
    if (assistanceData?.length) {
      assistanceData.forEach(request => {
        combinedData.push({
          id: request.id,
          type: 'assistance',
          request_type: request.request_type,
          content: request.description,
          table_number: request.table_number,
          created_at: request.created_at,
          resolved_at: request.resolved_at,
          venue_name: request.venues?.name
        });
      });
    }

    // Sort by resolved_at descending (most recent first)
    combinedData.sort((a, b) => new Date(b.resolved_at) - new Date(a.resolved_at));

    setResolvedFeedback(combinedData);

    // Calculate stats
    const feedbackCount = Object.keys(feedbackData?.reduce((acc, item) => {
      if (item.session_id) acc[item.session_id] = true;
      return acc;
    }, {}) || {}).length;
    
    const assistanceCount = assistanceData?.length || 0;

    setTotalStats({
      feedbackResolved: feedbackCount,
      assistanceResolved: assistanceCount,
      totalResolved: feedbackCount + assistanceCount
    });
  };

  const exportData = () => {
    if (resolvedFeedback.length === 0) return;
    
    const csvContent = [
      ['Date Resolved', 'Type', 'Content', 'Table', 'Rating', 'Request Type', 'Date Created', 'Resolution Time'].join(','),
      ...resolvedFeedback.map(item => [
        `"${dayjs(item.resolved_at).format('YYYY-MM-DD HH:mm:ss')}"`,
        item.type === 'feedback' ? 'Negative Feedback' : 'Assistance Request',
        `"${(item.content || '').replace(/"/g, '""')}"`,
        item.table_number || 'N/A',
        item.type === 'feedback' ? (item.rating || 'N/A') : 'N/A',
        item.type === 'assistance' ? (item.request_type || 'N/A') : 'N/A',
        `"${dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')}"`,
        `"${dayjs(item.resolved_at).from(dayjs(item.created_at), true)}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${staffMember?.name.replace(/\s+/g, '_')}-resolved-feedback-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (venueId && staffId) {
      fetchStaffMemberDetails();
    }
  }, [venueId, staffId, timeFilter]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <span className="text-gray-500 text-sm lg:text-base">Loading staff details...</span>
        </div>
      </PageContainer>
    );
  }

  if (!staffMember) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900 mb-2">Staff Member Not Found</h2>
            <button
              onClick={() => navigate('/staff/leaderboard')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Staff Leaderboard
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/staff/leaderboard')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-4"
          >
            ← Back to Staff Leaderboard
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-lg font-medium text-gray-600 mr-4">
              {staffMember.name.split(' ').map(word => word[0]).join('').toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{staffMember.name}</h1>
              <p className="text-gray-600 text-sm lg:text-base">{staffMember.role}</p>
              <p className="text-gray-500 text-xs">Member since {dayjs(staffMember.joinedDate).format('MMM YYYY')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            {/* Export Button */}
            {resolvedFeedback.length > 0 && (
              <button
                onClick={exportData}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                Export CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{totalStats.feedbackResolved}</div>
            <div className="text-sm text-gray-600">Negative Feedback Resolved</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalStats.assistanceResolved}</div>
            <div className="text-sm text-gray-600">Assistance Requests Resolved</div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalStats.totalResolved}</div>
            <div className="text-sm text-gray-600">Total Resolved</div>
          </div>
        </div>
      </div>

      {/* Resolved Feedback Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Resolved Feedback & Assistance Requests</h3>
          <p className="text-sm text-gray-600 mt-1">
            {timeFilter === 'all' ? 'All time' : `Filtered by: ${timeFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
          </p>
        </div>

        {resolvedFeedback.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date Resolved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Table
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Resolution Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {resolvedFeedback.map((item, index) => (
                  <tr 
                    key={`${item.type}-${item.id}`}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dayjs(item.resolved_at).format('MMM D, YYYY')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dayjs(item.resolved_at).format('h:mm A')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'feedback' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type === 'feedback' ? 'Negative Feedback' : item.request_type || 'Assistance'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        <div className="line-clamp-2">
                          {item.content || 'No content provided'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {item.table_number || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.type === 'feedback' ? (
                        <div className={`text-sm font-medium ${
                          item.rating <= 2 ? 'text-red-600' : 
                          item.rating <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {item.rating ? `${item.rating}/5` : 'N/A'}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900">
                        {dayjs(item.resolved_at).from(dayjs(item.created_at), true)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 mb-1">No resolved feedback found</p>
              <p className="text-xs text-gray-500">
                {timeFilter === 'all' 
                  ? 'This staff member hasn\'t resolved any feedback yet' 
                  : 'Try selecting a different time period'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default StaffMemberDetails;