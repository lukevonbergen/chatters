import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { AlertTriangle, CheckCircle, Clock, MapPin, Calendar, Timer, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const EXPIRY_THRESHOLD_MINUTES = 120;

const FeedbackTabs = ({ venueId, questionsMap, sortOrder = 'desc', tableFilter = '' }) => {
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (venueId) {
      loadFeedback();
      loadStaff();
    }
  }, [venueId]);

  const loadFeedback = async () => {
    setLoading(true);
    const { data } = await supabase.from('feedback').select('*').eq('venue_id', venueId);
    const grouped = {};
    for (const row of data || []) {
      if (!grouped[row.session_id]) grouped[row.session_id] = [];
      grouped[row.session_id].push(row);
    }
    const now = dayjs();
    const sessions = Object.entries(grouped).map(([session_id, items]) => {
      const createdAt = dayjs(items[0].created_at);
      const isExpired = now.diff(createdAt, 'minute') > EXPIRY_THRESHOLD_MINUTES;
      const isActioned = items.every(i => i.is_actioned);
      const lowScore = items.some(i => i.rating !== null && i.rating <= 2);
      const avgRating = items.filter(i => i.rating !== null).length > 0 
        ? items.filter(i => i.rating !== null).reduce((a, b) => a + b.rating, 0) / items.filter(i => i.rating !== null).length 
        : null;
      return { session_id, items, isActioned, lowScore, isExpired, createdAt, avgRating };
    });
    setSessionFeedback(sessions);
    setLoading(false);
  };

  const loadStaff = async () => {
    const { data } = await supabase.from('staff').select('id, first_name, last_name').eq('venue_id', venueId);
    setStaffList(data || []);
  };

  const markSessionAsActioned = async (session) => {
    if (!selectedStaffId) return alert('Please select a staff member');
    const ids = session.items.map(i => i.id);
    await supabase.from('feedback').update({
      is_actioned: true,
      resolved_by: selectedStaffId,
      resolved_at: new Date(),
    }).in('id', ids);
    setSelectedStaffId('');
    setShowModal(false);
    setSelectedSession(null);
    loadFeedback();
  };

  const filteredSessions = sessionFeedback.filter(session => {
    // Table filter
    if (tableFilter && session.items[0]?.table_number !== tableFilter) return false;
    
    // Tab filter
    if (activeTab === 'alerts') return session.lowScore && !session.isActioned && !session.isExpired;
    if (activeTab === 'actioned') return session.isActioned;
    if (activeTab === 'expired') return session.isExpired && !session.isActioned;
    return true;
  }).sort((a, b) => sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  const getTabCounts = () => {
    const alerts = sessionFeedback.filter(s => s.lowScore && !s.isActioned && !s.isExpired).length;
    const actioned = sessionFeedback.filter(s => s.isActioned).length;
    const expired = sessionFeedback.filter(s => s.isExpired && !s.isActioned).length;
    const all = sessionFeedback.length;
    return { alerts, actioned, expired, all };
  };

  const counts = getTabCounts();

  const getRatingColor = (rating) => {
    if (rating === null) return 'text-gray-400';
    if (rating <= 2) return 'text-red-500';
    if (rating <= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRatingBg = (rating) => {
    if (rating === null) return 'bg-gray-100';
    if (rating <= 2) return 'bg-red-50';
    if (rating <= 3) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Loading feedback...</span>
      </div>
    );
  }

  return (
    <>
      {/* Modern Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle, count: counts.alerts, color: 'red' },
            { id: 'actioned', label: 'Resolved', icon: CheckCircle, count: counts.actioned, color: 'green' },
            { id: 'expired', label: 'Expired', icon: Clock, count: counts.expired, color: 'yellow' },
            { id: 'all', label: 'All Feedback', icon: null, count: counts.all, color: 'blue' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? `text-${tab.color}-600 border-b-2 border-${tab.color}-500`
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-100 text-${tab.color}-800`
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Feedback Cards */}
      {filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            {activeTab === 'alerts' && <AlertTriangle className="w-8 h-8 text-gray-400" />}
            {activeTab === 'actioned' && <CheckCircle className="w-8 h-8 text-gray-400" />}
            {activeTab === 'expired' && <Clock className="w-8 h-8 text-gray-400" />}
            {activeTab === 'all' && <Calendar className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'alerts' && 'No alerts'}
            {activeTab === 'actioned' && 'No resolved feedback'}
            {activeTab === 'expired' && 'No expired feedback'}
            {activeTab === 'all' && 'No feedback yet'}
          </h3>
          <p className="text-gray-500">
            {activeTab === 'alerts' && 'All feedback is looking good!'}
            {activeTab === 'actioned' && 'Resolved feedback will appear here.'}
            {activeTab === 'expired' && 'Expired feedback will appear here.'}
            {activeTab === 'all' && 'Customer feedback will appear here once submitted.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map(session => (
            <div
              key={session.session_id}
              className={`relative rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                session.lowScore && !session.isActioned && !session.isExpired
                  ? 'border-red-200 bg-red-50 hover:bg-red-100'
                  : session.isActioned
                  ? 'border-green-200 bg-green-50 hover:bg-green-100'
                  : session.isExpired
                  ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => { setSelectedSession(session); setShowModal(true); }}
            >
              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                {session.lowScore && !session.isActioned && !session.isExpired && (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="w-5 h-5 mr-1" />
                    <span className="text-xs font-medium">Needs Attention</span>
                  </div>
                )}
                {session.isActioned && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    <span className="text-xs font-medium">Resolved</span>
                  </div>
                )}
                {session.isExpired && !session.isActioned && (
                  <div className="flex items-center text-yellow-600">
                    <Clock className="w-5 h-5 mr-1" />
                    <span className="text-xs font-medium">Expired</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Table {session.items[0].table_number}
                    </h3>
                    
                    {/* Rating Display */}
                    {session.avgRating !== null && (
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRatingBg(session.avgRating)} ${getRatingColor(session.avgRating)}`}>
                        <span className="text-lg mr-1">
                          {session.avgRating <= 2 ? '😞' : session.avgRating <= 3 ? '😐' : session.avgRating <= 4 ? '😊' : '😍'}
                        </span>
                        Average: {session.avgRating.toFixed(1)}/5
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center text-sm text-gray-600 space-x-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {session.createdAt.format('MMM D, YYYY')}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {session.createdAt.format('h:mm A')}
                  </div>
                  <div className="flex items-center">
                    <Timer className="w-4 h-4 mr-1" />
                    {session.createdAt.fromNow()}
                  </div>
                </div>

                {/* Preview of feedback items */}
                <div className="space-y-2">
                  {session.items.slice(0, 2).map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.additional_feedback && (
                        <p className="text-gray-700 italic">"{item.additional_feedback.substring(0, 100)}{item.additional_feedback.length > 100 ? '...' : ''}"</p>
                      )}
                      {questionsMap[item.question_id] && item.rating && (
                        <p className="text-gray-600">
                          <span className="font-medium">{questionsMap[item.question_id]}:</span> 
                          <span className={getRatingColor(item.rating)}> {item.rating}/5</span>
                        </p>
                      )}
                    </div>
                  ))}
                  {session.items.length > 2 && (
                    <p className="text-xs text-gray-500">+{session.items.length - 2} more responses</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/floorplan');
                    }}
                    className="inline-flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    View on Floor Plan
                  </button>

                  {!session.isActioned && !session.isExpired && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSession(session);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4 mr-1" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Improved Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Resolve Feedback - Table {selectedSession.items[0].table_number}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Staff Member
                </label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Staff Member</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                {selectedSession.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {questionsMap[item.question_id] && (
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {questionsMap[item.question_id]}
                        </h4>
                        {item.rating !== null && (
                          <div className="flex items-center">
                            <span className="text-lg mr-2">
                              {item.rating <= 2 ? '😞' : item.rating <= 3 ? '😐' : item.rating <= 4 ? '😊' : '😍'}
                            </span>
                            <span className={`font-semibold ${getRatingColor(item.rating)}`}>
                              {item.rating}/5
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {item.additional_feedback && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Additional Comments:</h5>
                        <p className="text-gray-800 italic">"{item.additional_feedback}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => markSessionAsActioned(selectedSession)}
                disabled={!selectedStaffId}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  selectedStaffId
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackTabs;