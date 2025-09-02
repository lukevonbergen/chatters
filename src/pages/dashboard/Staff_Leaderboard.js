import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StaffLeaderboard = () => {
  const { venueId } = useVenue();
  usePageTitle('Staff Leaderboard');
  const [staffStats, setStaffStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('last7');

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
      default:
        return { start: null, end: new Date().toISOString() };
    }
  };

  const fetchStaffLeaderboard = async (venueId) => {
    const { start: fromDate } = getDateRange(timeFilter);

    // Fetch resolved feedback sessions
    let feedbackQuery = supabase
      .from('feedback')
      .select('session_id, resolved_by, resolved_at')
      .eq('venue_id', venueId)
      .not('resolved_by', 'is', null);

    if (fromDate) feedbackQuery = feedbackQuery.gte('resolved_at', fromDate);

    // Fetch resolved assistance requests
    let assistanceQuery = supabase
      .from('assistance_requests')
      .select('id, resolved_by, resolved_at')
      .eq('venue_id', venueId)
      .not('resolved_by', 'is', null);

    if (fromDate) assistanceQuery = assistanceQuery.gte('resolved_at', fromDate);

    const [
      { data: feedbackData, error: feedbackError },
      { data: assistanceData, error: assistanceError }
    ] = await Promise.all([feedbackQuery, assistanceQuery]);

    if (feedbackError || assistanceError) {
      console.error('Error fetching data:', feedbackError || assistanceError);
      return;
    }

    const feedbackCounts = {};
    const assistanceCounts = {};

    // Count feedback sessions resolved by each employee (negative feedback only)
    if (feedbackData?.length) {
      const sessionMap = {};
      feedbackData.forEach(item => {
        if (item.session_id && item.resolved_by) {
          sessionMap[item.session_id] = item.resolved_by;
        }
      });
      
      Object.values(sessionMap).forEach(employeeId => {
        feedbackCounts[employeeId] = (feedbackCounts[employeeId] || 0) + 1;
      });
    }

    // Count assistance requests resolved by each employee
    if (assistanceData?.length) {
      assistanceData.forEach(request => {
        if (request.resolved_by) {
          assistanceCounts[request.resolved_by] = (assistanceCounts[request.resolved_by] || 0) + 1;
        }
      });
    }

    // Get all unique employee IDs from both types of resolutions
    const allEmployeeIds = [...new Set([...Object.keys(feedbackCounts), ...Object.keys(assistanceCounts)])];
    if (allEmployeeIds.length === 0) return setStaffStats([]);

    // Fetch employee details (staff are stored in employees table)
    const { data: employeeData, error: employeeError } = await supabase
      .from('employees')
      .select('id, first_name, last_name, role')
      .in('id', allEmployeeIds);

    if (employeeError) {
      console.error('Error fetching employee data:', employeeError);
      return;
    }

    const combined = employeeData
      .map(e => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        role: e.role,
        feedbackResolved: feedbackCounts[e.id] || 0,
        assistanceResolved: assistanceCounts[e.id] || 0,
        totalResolved: (feedbackCounts[e.id] || 0) + (assistanceCounts[e.id] || 0),
      }))
      .filter(e => e.totalResolved > 0) // Only show employees who have resolved something
      .sort((a, b) => b.totalResolved - a.totalResolved)
      .map((s, index) => ({ ...s, rank: index + 1 }));

    setStaffStats(combined);
  };

  const exportLeaderboard = () => {
    if (staffStats.length === 0) return;
    
    const csvContent = [
      ['Rank', 'Staff Name', 'Role', 'Negative Feedback Resolved', 'Assistance Requests Resolved', 'Total Resolved', 'Period'].join(','),
      ...staffStats.map(staff => [
        staff.rank,
        `"${staff.name}"`,
        `"${staff.role}"`,
        staff.feedbackResolved,
        staff.assistanceResolved,
        staff.totalResolved,
        timeFilter === 'today' ? 'Today' : 
        timeFilter === 'thisWeek' ? 'This Week' :
        timeFilter === 'last7' ? 'Last 7 Days' :
        timeFilter === 'last30' ? 'Last 30 Days' : 'All Time'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `staff-leaderboard-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (venueId) fetchStaffLeaderboard(venueId);
  }, [venueId, timeFilter]);

  const rankSuffix = (rank) => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <PageContainer>
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Staff Leaderboard</h1>
            <p className="text-gray-600 text-sm lg:text-base">Track staff performance and feedback resolution rates.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Date Filter */}
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
                <option value="all">All Time</option>
              </select>
            </div>
            
            {/* Export Button */}
            <button
              onClick={() => exportLeaderboard()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Staff Leaderboard Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {staffStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Negative Feedback
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assistance Requests
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Resolved
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {staffStats.map((staff, index) => (
                  <tr 
                    key={staff.id}
                    className={`hover:bg-blue-50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {staff.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 mr-4">
                          {staff.name.split(' ').map(word => word[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                          <div className="text-xs text-gray-500">
                            {staff.role}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {staff.feedbackResolved}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {staff.assistanceResolved}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {staff.totalResolved}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 mb-1">No staff performance data</p>
              <p className="text-xs text-gray-500">Data will appear here as staff resolve feedback</p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default StaffLeaderboard;