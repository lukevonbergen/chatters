import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { supabase } from '../../../utils/supabase';

dayjs.extend(relativeTime);

// Helper to safely get rating
const getRowRating = (row) => {
  const cand = row.session_rating ?? row.rating ?? row.score ?? null;
  const num = typeof cand === 'number' ? cand : Number(cand);
  return Number.isFinite(num) ? num : null;
};

// Group feedback items by session
const groupBySession = (feedbackItems) => {
  const sessionMap = new Map();
  
  for (const item of feedbackItems) {
    const sessionId = item.session_id;
    if (!sessionId) continue;
    
    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, {
        session_id: sessionId,
        table_number: item.table_number,
        created_at: item.created_at,
        items: [],
        venue_id: item.venue_id,
      });
    }
    
    sessionMap.get(sessionId).items.push(item);
  }
  
  return Array.from(sessionMap.values())
    .map(session => {
      // Calculate session-level metrics
      const ratings = session.items
        .map(item => getRowRating(item))
        .filter(rating => rating !== null);
      
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : null;
      
      const hasComments = session.items.some(item => 
        item.additional_feedback && item.additional_feedback.trim()
      );
      
      // Sort items by question order or creation time
      session.items.sort((a, b) => {
        const aOrder = a.questions?.order || 0;
        const bOrder = b.questions?.order || 0;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return new Date(a.created_at) - new Date(b.created_at);
      });
      
      return {
        ...session,
        avg_rating: avgRating,
        has_comments: hasComments,
      };
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

const getRatingColor = (rating) => {
  if (rating == null) return 'text-gray-600';
  if (rating <= 2) return 'text-red-600';
  if (rating <= 3) return 'text-yellow-600';
  return 'text-green-600';
};

const StarRating = ({ rating, className = '' }) => {
  if (rating == null) return <span className="text-gray-400 text-sm">No rating</span>;
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
          fill={star <= rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ))}
      <span className={`ml-1 text-sm font-medium ${getRatingColor(rating)}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

const FeedbackDetailModal = ({ 
  isOpen, 
  onClose, 
  feedbackItems = [], 
  onMarkResolved,
  venueId
}) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedStaffMember, setSelectedStaffMember] = useState('');
  const [resolutionType, setResolutionType] = useState('resolved');
  const [dismissalReason, setDismissalReason] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  
  const sessions = useMemo(() => groupBySession(feedbackItems), [feedbackItems]);
  
  // Load current user and staff members
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        
        if (user) {
          // Get user profile from your users table
          const { data: userProfile } = await supabase
            .from('users')
            .select('id, email, role, account_id')
            .eq('id', user.id)
            .single();
          
          setCurrentUser(userProfile);
        }
        
        // Get staff members for this venue
        if (venueId) {
          const { data: staff } = await supabase
            .from('staff')
            .select('id, first_name, last_name, role, user_id')
            .eq('venue_id', venueId);
          
          setStaffMembers(staff || []);
          
          // Auto-select current user if they're staff at this venue
          if (user && staff) {
            const currentStaff = staff.find(s => s.user_id === user.id);
            if (currentStaff) {
              setSelectedStaffMember(currentStaff.id);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    if (isOpen) {
      loadData();
    }
  }, [isOpen, venueId]);
  
  if (!sessions.length) return null;
  
  // For now, show the first (most recent) session
  const session = sessions[0];
  
  const handleMarkResolved = async () => {
    if (!selectedStaffMember) {
      alert('Please select the staff member who resolved this feedback.');
      return;
    }
    
    setIsResolving(true);
    
    try {
      const sessionIds = sessions.map(s => s.session_id);
      
      // Use your existing database fields
      const updateData = {
        is_actioned: true,
        resolved_at: new Date().toISOString(),
        resolved_by: selectedStaffMember,
        resolution_type: resolutionType
      };
      
      // Add dismissal fields if dismissing
      if (resolutionType === 'dismissed') {
        updateData.dismissed = true;
        updateData.dismissed_at = new Date().toISOString();
        updateData.dismissed_reason = dismissalReason.trim() || 'No reason provided';
      }
      
      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .in('session_id', sessionIds);
      
      if (error) throw error;
      
      await onMarkResolved(sessionIds, selectedStaffMember);
      onClose();
    } catch (error) {
      console.error('Error marking feedback as resolved:', error);
      alert('Failed to mark feedback as resolved. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };
  
  const urgencyLevel = session.avg_rating <= 2 ? 'urgent' : 
                      session.avg_rating <= 3 && session.has_comments ? 'attention' : 'info';
  
  const urgencyConfig = {
    urgent: { label: 'URGENT', color: 'bg-red-600 text-white', icon: '🚨' },
    attention: { label: 'ATTENTION', color: 'bg-yellow-500 text-white', icon: '⚠️' },
    info: { label: 'INFO', color: 'bg-blue-500 text-white', icon: 'ℹ️' }
  };
  
  const urgency = urgencyConfig[urgencyLevel];
  
  const selectedStaff = staffMembers.find(s => s.id === selectedStaffMember);
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Feedback Details - Table ${session.table_number}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Table {session.table_number}
              </h4>
              <p className="text-sm text-gray-600">
                Submitted {dayjs(session.created_at).fromNow()} • {session.items.length} question{session.items.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgency.color}`}>
                {urgency.icon} {urgency.label}
              </span>
              {session.avg_rating && (
                <StarRating rating={session.avg_rating} />
              )}
            </div>
          </div>
        </div>
        
        {/* Feedback Items */}
        <div className="space-y-4">
          <h5 className="font-medium text-gray-900">Customer Responses</h5>
          
          {session.items.map((item, index) => {
            const rating = getRowRating(item);
            const question = item.questions?.question || `Question ${index + 1}`;
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h6 className="font-medium text-gray-900 flex-1 pr-4">
                    {question}
                  </h6>
                  {rating && (
                    <StarRating rating={rating} className="flex-shrink-0" />
                  )}
                </div>
                
                {item.additional_feedback && item.additional_feedback.trim() && (
                  <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                    <p className="text-sm text-gray-700 italic">
                      "{item.additional_feedback.trim()}"
                    </p>
                  </div>
                )}
                
                <div className="mt-2 text-xs text-gray-500">
                  Answered {dayjs(item.created_at).format('MMM D, YYYY [at] h:mm A')}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Multiple Sessions Notice */}
        {sessions.length > 1 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-amber-800">
                <strong>Multiple feedback sessions found.</strong> This table has {sessions.length} separate feedback submissions. 
                Resolving will mark all sessions as handled.
              </p>
            </div>
          </div>
        )}
        
        {/* Resolution Section */}
        <div className="border-t pt-6">
          <h5 className="font-medium text-gray-900 mb-4">Resolution Actions</h5>
          
          <div className="space-y-4">
            {/* Resolution Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="resolutionType"
                    value="resolved"
                    checked={resolutionType === 'resolved'}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-green-700">✅ Resolved</div>
                    <div className="text-xs text-gray-600">Issue addressed and fixed</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="resolutionType"
                    value="dismissed"
                    checked={resolutionType === 'dismissed'}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-orange-700">🗂️ Dismiss</div>
                    <div className="text-xs text-gray-600">Mark as seen but no action needed</div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Dismissal Reason (if dismissing) */}
            {resolutionType === 'dismissed' && (
              <div>
                <label htmlFor="dismissalReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Dismissal
                </label>
                <textarea
                  id="dismissalReason"
                  value={dismissalReason}
                  onChange={(e) => setDismissalReason(e.target.value)}
                  placeholder="Why is this feedback being dismissed? (e.g., 'Customer complaint resolved separately', 'Not actionable', etc.)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            {/* Staff Member Selection */}
            <div>
              <label htmlFor="staffMember" className="block text-sm font-medium text-gray-700 mb-2">
                Staff Member Handling This
              </label>
              <select
                id="staffMember"
                value={selectedStaffMember}
                onChange={(e) => setSelectedStaffMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select staff member...</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name} {staff.role && `(${staff.role})`}
                  </option>
                ))}
              </select>
              {selectedStaff && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedStaff.first_name} {selectedStaff.last_name}
                </p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleMarkResolved}
                disabled={isResolving || !selectedStaffMember}
                className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                  resolutionType === 'resolved' 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {isResolving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {resolutionType === 'resolved' ? 'Resolving...' : 'Dismissing...'}
                  </span>
                ) : (
                  resolutionType === 'resolved' ? 'Mark as Resolved' : 'Dismiss Feedback'
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default FeedbackDetailModal;