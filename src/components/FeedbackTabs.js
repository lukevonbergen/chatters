import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Bell, Calendar, Clock, Timer, UserCheck, Hourglass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

const ITEMS_PER_PAGE = 20;
const EXPIRY_THRESHOLD_MINUTES = 120;

const FeedbackTabs = ({ venueId, questionsMap }) => {
  const [sessionFeedback, setSessionFeedback] = useState([]);
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (venueId) {
      loadFeedback();
      loadStaff();
    }
  }, [venueId]);

  const loadFeedback = async () => {
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
      return { session_id, items, isActioned, lowScore, isExpired, createdAt };
    });
    setSessionFeedback(sessions);
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
    if (activeTab === 'alerts') return session.lowScore && !session.isActioned && !session.isExpired;
    if (activeTab === 'actioned') return session.isActioned;
    if (activeTab === 'expired') return session.isExpired && !session.isActioned;
    return true;
  }).sort((a, b) => sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt);

  const paginated = filteredSessions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <div className="flex gap-6 border-b mb-6">
        <button onClick={() => setActiveTab('alerts')} className={`${activeTab === 'alerts' ? 'text-red-600 border-b-2 border-red-500' : 'text-gray-500'} pb-2`}>Alerts</button>
        <button onClick={() => setActiveTab('actioned')} className={`${activeTab === 'actioned' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500'} pb-2`}>Actioned</button>
        <button onClick={() => setActiveTab('expired')} className={`${activeTab === 'expired' ? 'text-yellow-600 border-b-2 border-yellow-500' : 'text-gray-500'} pb-2`}>Expired</button>
        <button onClick={() => setActiveTab('all')} className={`${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500'} pb-2`}>All Feedback</button>
      </div>

      {paginated.map(session => (
        <div key={session.session_id} className="border p-4 rounded mb-4 bg-white">
          <div className="flex justify-between items-start">
            <div onClick={() => { setSelectedSession(session); setShowModal(true); }} className="cursor-pointer">
              <div className="text-sm font-semibold text-gray-800 mb-1">
                Table {session.items[0].table_number}
              </div>
              <div className="flex items-center text-xs text-gray-600 gap-1 mb-1">
                <Calendar size={14} /> {session.createdAt.format('ddd D MMM')}
              </div>
              <div className="flex items-center text-xs text-gray-600 gap-1">
                <Clock size={14} /> {session.createdAt.format('h:mma')}
              </div>
              <div className="flex items-center text-xs text-gray-400 italic gap-1">
                <Timer size={14} /> {session.createdAt.fromNow()}
              </div>
              {session.isExpired && !session.isActioned && (
                <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                  <Hourglass size={14} /> Feedback expired
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {session.lowScore && !session.isActioned && !session.isExpired && <Bell className="text-red-500" size={18} />}
              <button
                onClick={() => navigate('/floorplan')}
                className="text-sm bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                View on Heatmap
              </button>
            </div>
          </div>
        </div>
      ))}

      {showModal && selectedSession && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white w-full max-w-md p-6 rounded shadow-lg relative">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
      >
        &times;
      </button>

      <h2 className="text-lg font-semibold mb-4">Resolve Feedback</h2>

      {/* Staff dropdown */}
      <select
        value={selectedStaffId}
        onChange={e => setSelectedStaffId(e.target.value)}
        className="w-full border mb-4 p-2 rounded"
      >
        <option value="">Select Staff</option>
        {staffList.map(s => (
          <option key={s.id} value={s.id}>
            {s.first_name} {s.last_name}
          </option>
        ))}
      </select>

      <div className="space-y-3 mb-4">
        {selectedSession.items.map((f, i) => (
          <div key={i} className="p-3 bg-gray-50 rounded border">
            {/* Only show question label if it exists */}
            {questionsMap[f.question_id] && (
              <p className="text-sm font-medium text-gray-800 mb-1">
                {questionsMap[f.question_id]}
              </p>
            )}

            {/* Only show rating if it exists */}
            {f.rating !== null && (
              <p className="text-sm text-gray-600">Rating: {f.rating}</p>
            )}

            {/* Show Additional Feedback label and content if present */}
            {f.additional_feedback && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-800 mb-1">Additional Feedback</p>
                <p className="italic text-gray-700 text-sm">"{f.additional_feedback}"</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action button */}
      <button
        onClick={() => markSessionAsActioned(selectedSession)}
        disabled={!selectedStaffId}
        className={`w-full py-2 rounded text-white ${
          selectedStaffId
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        <UserCheck size={16} className="inline mr-1" /> Mark as Actioned
      </button>
    </div>
  </div>
)}

    </>
  );
};

export default FeedbackTabs;