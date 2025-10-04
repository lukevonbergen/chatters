import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Mail, Trophy } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const StaffLeaderboard = () => {
  const { venueId } = useVenue();
  const navigate = useNavigate();
  usePageTitle('Staff Leaderboard');
  const [staffStats, setStaffStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('last7');
  const [recognitionModal, setRecognitionModal] = useState(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [sendingRecognition, setSendingRecognition] = useState(false);
  const [recognitionMessage, setRecognitionMessage] = useState('');

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
      .select('id, first_name, last_name, role, location')
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
        location: e.location,
        feedbackResolved: feedbackCounts[e.id] || 0,
        assistanceResolved: assistanceCounts[e.id] || 0,
        totalResolved: (feedbackCounts[e.id] || 0) + (assistanceCounts[e.id] || 0),
      }))
      .filter(e => e.totalResolved > 0) // Only show employees who have resolved something
      .sort((a, b) => b.totalResolved - a.totalResolved)
      .map((s, index) => ({ ...s, rank: index + 1 }));

    setStaffStats(combined);
  };

  const getPeriodText = (filter) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'thisWeek': return 'This Week';
      case 'last7': return 'Last 7 Days';
      case 'last30': return 'Last 30 Days';
      default: return 'All Time';
    }
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
        getPeriodText(timeFilter)
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

  const sendRecognitionEmail = async (staff) => {
    setSendingRecognition(true);
    setRecognitionMessage('');

    try {
      // Get employee email
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('email')
        .eq('id', staff.id)
        .single();

      if (employeeError || !employeeData?.email) {
        throw new Error('Could not find employee email address');
      }

      // Get venue name
      const { data: venueData } = await supabase
        .from('venues')
        .select('name')
        .eq('id', venueId)
        .single();

      // Get manager name
      const { data: { user } } = await supabase.auth.getUser();
      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const managerName = userData?.first_name && userData?.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : 'Your Manager';

      const response = await supabase.functions.invoke('send-recognition-email', {
        body: {
          employeeId: staff.id,
          employeeEmail: employeeData.email,
          employeeName: staff.name,
          managerName,
          venueName: venueData?.name || 'the team',
          stats: {
            rank: staff.rank,
            feedbackResolved: staff.feedbackResolved,
            assistanceResolved: staff.assistanceResolved,
            totalResolved: staff.totalResolved,
            period: getPeriodText(timeFilter)
          },
          personalMessage: personalMessage.trim() || undefined
        }
      });

      console.log('Edge Function response:', response);

      if (response.error) {
        console.error('Recognition email error:', response.error);
        console.error('Response data:', response.data);

        // Try to get the actual response body for better error details
        if (response.response) {
          try {
            const errorBody = await response.response.json();
            console.error('Error response body:', errorBody);
            if (errorBody.message) {
              throw new Error(errorBody.message);
            }
          } catch (jsonError) {
            console.error('Could not parse error response:', jsonError);
          }
        }

        // Check if it's a deployment issue
        if (response.error.message?.includes('FunctionsRelayError') || response.error.message?.includes('not found')) {
          throw new Error('Recognition email feature not yet deployed. Please deploy the send-recognition-email Edge Function first.');
        }

        // Try to extract more details from the error
        const errorMessage = response.data?.message || response.error.message || 'Failed to send recognition email';
        throw new Error(errorMessage);
      }

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to send recognition email');
      }

      setRecognitionMessage('Recognition email sent successfully!');
      setTimeout(() => {
        setRecognitionModal(null);
        setPersonalMessage('');
        setRecognitionMessage('');
      }, 2000);

    } catch (error) {
      console.error('Error sending recognition:', error);
      setRecognitionMessage(`Error: ${error.message}`);
    } finally {
      setSendingRecognition(false);
    }
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
    <div className="w-full">
      <ChartCard
        title="Staff Leaderboard"
        subtitle="Track staff performance and feedback resolution rates"
        actions={
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
        }
      >
        {/* Staff Leaderboard Table */}
        <div className="overflow-hidden">
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
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
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
                          <button
                            onClick={() => navigate(`/staff-member/${staff.id}`)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {staff.name}
                          </button>
                          <div className="flex items-center space-x-2 text-xs">
                            {staff.role && (
                              <span className="text-gray-500">{staff.role}</span>
                            )}
                            {staff.location && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {staff.location}
                              </span>
                            )}
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
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setRecognitionModal(staff)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                        title="Send recognition email"
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        Recognize
                      </button>
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
      </ChartCard>

      {/* Recognition Modal */}
      {recognitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Trophy className="w-6 h-6 text-white mr-3" />
                  <h3 className="text-xl font-bold text-white">Send Recognition Email</h3>
                </div>
                <button
                  onClick={() => {
                    setRecognitionModal(null);
                    setPersonalMessage('');
                    setRecognitionMessage('');
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Send a recognition email to <strong>{recognitionModal.name}</strong> for their outstanding performance!
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-700">{recognitionModal.rank}</div>
                      <div className="text-xs text-green-600">Rank</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{recognitionModal.feedbackResolved}</div>
                      <div className="text-xs text-green-600">Feedback</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">{recognitionModal.totalResolved}</div>
                      <div className="text-xs text-green-600">Total</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Add a personal note to make this recognition extra special..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
                  rows={4}
                  disabled={sendingRecognition}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be included in the email as a personal message from you
                </p>
              </div>

              {recognitionMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  recognitionMessage.includes('success')
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {recognitionMessage}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setRecognitionModal(null);
                    setPersonalMessage('');
                    setRecognitionMessage('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  disabled={sendingRecognition}
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendRecognitionEmail(recognitionModal)}
                  disabled={sendingRecognition}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {sendingRecognition ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Recognition Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffLeaderboard;