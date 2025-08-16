import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
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
  if (rating == null) return 'text-slate-500';
  if (rating <= 2) return 'text-red-600';
  if (rating <= 3) return 'text-amber-600';
  return 'text-emerald-600';
};

const StarRating = ({ rating, className = '' }) => {
  if (rating == null) return (
    <div className="flex items-center gap-1">
      <span className="text-slate-400 text-sm font-medium">No rating provided</span>
    </div>
  );
  
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-amber-400 fill-current' 
                : 'text-slate-200'
            }`}
            fill={star <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={star <= rating ? 0 : 1.5}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        ))}
      </div>
      <span className={`text-sm font-semibold ${getRatingColor(rating)}`}>
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
        
        // Get staff members and employees for this venue
        if (venueId) {
          const { data: staffData } = await supabase
            .from('staff')
            .select('id, first_name, last_name, role, user_id')
            .eq('venue_id', venueId);

          const { data: employeesData } = await supabase
            .from('employees')
            .select('id, first_name, last_name, role')
            .eq('venue_id', venueId);

          const combinedStaffList = [
            ...(staffData || []).map(person => ({
              ...person,
              source: 'staff',
              display_name: `${person.first_name} ${person.last_name}`,
              role_display: person.role || 'Staff Member'
            })),
            ...(employeesData || []).map(person => ({
              ...person,
              source: 'employee',
              display_name: `${person.first_name} ${person.last_name}`,
              role_display: person.role || 'Employee'
            }))
          ].sort((a, b) => a.display_name.localeCompare(b.display_name));

          setStaffMembers(combinedStaffList);
          
          // Auto-select current user if they're staff at this venue
          if (user && staffData) {
            const currentStaff = staffData.find(s => s.user_id === user.id);
            if (currentStaff) {
              setSelectedStaffMember(`staff-${currentStaff.id}`);
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
      
      // Parse the selected staff member
      let resolvedById = null;
      let resolverInfo = '';
      
      if (selectedStaffMember.startsWith('staff-')) {
        // Staff member selected - can use their ID directly
        resolvedById = selectedStaffMember.replace('staff-', '');
        resolverInfo = selectedStaff ? selectedStaff.display_name : '';
      } else if (selectedStaffMember.startsWith('employee-')) {
        // Employee selected - need to handle differently since they're not in staff table
        // For now, we'll need to either:
        // 1. Create a staff entry for the employee, or 
        // 2. Use a different approach
        
        // Let's use the current user (who must be staff to access kiosk) as resolved_by
        // and store employee info in dismissal_reason or create a new field
        const currentStaffMember = staffMembers.find(s => s.source === 'staff' && s.user_id === currentUser?.id);
        if (currentStaffMember) {
          resolvedById = currentStaffMember.id;
          resolverInfo = `Resolved by ${selectedStaff?.display_name} (Employee) via ${currentStaffMember.display_name}`;
        } else {
          throw new Error('No staff member found to attribute resolution to. Employees cannot directly resolve feedback.');
        }
      }
      
      if (!resolvedById) {
        throw new Error('Invalid staff member selection');
      }
      
      // Use correct Supabase database fields
      const updateData = {
        is_actioned: true,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedById,
        resolution_type: resolutionType
      };
      
      // Add dismissal fields if dismissing
      if (resolutionType === 'dismissed') {
        updateData.dismissed = true;
        updateData.dismissed_at = new Date().toISOString();
        updateData.dismissed_reason = dismissalReason.trim() || 'No reason provided';
        if (resolverInfo) {
          updateData.dismissed_reason += ` (${resolverInfo})`;
        }
      } else {
        // Set resolution type to staff_resolved for resolved feedback
        updateData.resolution_type = 'staff_resolved';
        // Store resolver info if it's an employee resolution
        if (resolverInfo && selectedStaffMember.startsWith('employee-')) {
          updateData.resolution_notes = resolverInfo;
        }
      }
      
      const { error } = await supabase
        .from('feedback')
        .update(updateData)
        .in('session_id', sessionIds);
      
      if (error) throw error;
      
      // Pass the actual staff ID (without prefix) to the parent function
      await onMarkResolved(sessionIds, resolvedById);
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
    urgent: { 
      label: 'URGENT', 
      color: 'bg-red-600 text-white', 
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.95-.833-2.72 0L4.094 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      )
    },
    attention: { 
      label: 'ATTENTION', 
      color: 'bg-amber-600 text-white', 
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    info: { 
      label: 'INFORMATIONAL', 
      color: 'bg-blue-600 text-white', 
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };
  
  const urgency = urgencyConfig[urgencyLevel];
  
  const selectedStaff = staffMembers.find(s => {
    if (selectedStaffMember.startsWith('staff-')) {
      return s.source === 'staff' && s.id === selectedStaffMember.replace('staff-', '');
    } else if (selectedStaffMember.startsWith('employee-')) {
      return s.source === 'employee' && s.id === selectedStaffMember.replace('employee-', '');
    }
    return false;
  });
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
      className="overflow-hidden"
    >
      <div className="space-y-0">
        {/* Professional Header */}
        <div className={`${urgency.bgColor} ${urgency.borderColor} border-b px-6 py-5 -mx-4 -mt-4 mb-6`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border">
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">
                  Table {session.table_number} Feedback
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submitted {dayjs(session.created_at).fromNow()}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {session.items.length} response{session.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session.avg_rating && (
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm border">
                  <StarRating rating={session.avg_rating} />
                </div>
              )}
              <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold ${urgency.color} shadow-sm`}>
                {urgency.icon}
                {urgency.label}
              </span>
            </div>
          </div>
        </div>
        
        {/* Customer Responses */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-slate-900">Customer Responses</h4>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          
          <div className="space-y-4">
            {session.items.map((item, index) => {
              const rating = getRowRating(item);
              const question = item.questions?.question || `Question ${index + 1}`;
              
              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-4">
                      <h6 className="font-semibold text-slate-900 mb-1">
                        {question}
                      </h6>
                      <div className="text-xs text-slate-500 font-medium">
                        Response {index + 1} • {dayjs(item.created_at).format('MMM D, YYYY [at] h:mm A')}
                      </div>
                    </div>
                    {rating && (
                      <div className="flex-shrink-0">
                        <StarRating rating={rating} />
                      </div>
                    )}
                  </div>
                  
                  {item.additional_feedback && item.additional_feedback.trim() && (
                    <div className="mt-4 bg-slate-50 border-l-4 border-blue-400 rounded-r-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-1">Customer Comment</div>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            "{item.additional_feedback.trim()}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Multiple Sessions Alert */}
        {sessions.length > 1 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-amber-900 mb-1">Multiple Feedback Sessions</h5>
                <p className="text-sm text-amber-800 leading-relaxed">
                  This table has submitted <strong>{sessions.length} separate feedback sessions</strong>. 
                  Taking action will resolve all related sessions simultaneously.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Professional Resolution Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mt-8">
          <div className="flex items-center gap-2 mb-6">
            <h4 className="text-lg font-semibold text-slate-900">Resolution Actions</h4>
            <div className="h-px bg-slate-300 flex-1"></div>
          </div>
          
          <div className="space-y-6">
            {/* Action Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Select Action Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  resolutionType === 'resolved' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="resolutionType"
                    value="resolved"
                    checked={resolutionType === 'resolved'}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="mt-1 mr-3 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-emerald-900">Mark as Resolved</div>
                      <div className="text-sm text-emerald-700 mt-1">Issue has been addressed and corrected</div>
                    </div>
                  </div>
                </label>
                <label className={`relative flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  resolutionType === 'dismissed' 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="resolutionType"
                    value="dismissed"
                    checked={resolutionType === 'dismissed'}
                    onChange={(e) => setResolutionType(e.target.value)}
                    className="mt-1 mr-3 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-amber-900">Acknowledge & Dismiss</div>
                      <div className="text-sm text-amber-700 mt-1">Reviewed but no action required</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* Dismissal Reason */}
            {resolutionType === 'dismissed' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <label htmlFor="dismissalReason" className="block text-sm font-semibold text-amber-900 mb-2">
                  Reason for Dismissal <span className="text-amber-600">*</span>
                </label>
                <textarea
                  id="dismissalReason"
                  value={dismissalReason}
                  onChange={(e) => setDismissalReason(e.target.value)}
                  placeholder="Please provide a clear reason for dismissing this feedback (e.g., 'Issue resolved through direct customer contact', 'Not actionable - outside our control', etc.)"
                  rows={3}
                  className="w-full px-3 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white placeholder-amber-500 text-sm"
                />
              </div>
            )}
            
            {/* Staff Member Selection */}
            <div>
              <label htmlFor="staffMember" className="block text-sm font-semibold text-slate-700 mb-3">
                Responsible Staff Member <span className="text-red-500">*</span>
              </label>
              
              <select
                id="staffMember"
                value={selectedStaffMember}
                onChange={(e) => setSelectedStaffMember(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm font-medium"
              >
                <option value="">Choose staff member...</option>
                
                {staffMembers.length === 0 && (
                  <option value="" disabled>No staff members found for this venue</option>
                )}
                
                {staffMembers.some(person => person.source === 'staff') && (
                  <optgroup label="Managers & Staff">
                    {staffMembers
                      .filter(person => person.source === 'staff')
                      .map(staff => (
                        <option key={`staff-${staff.id}`} value={`staff-${staff.id}`}>
                          {staff.display_name} ({staff.role_display})
                        </option>
                      ))
                    }
                  </optgroup>
                )}
                
                {staffMembers.some(person => person.source === 'employee') && (
                  <optgroup label="Employees">
                    {staffMembers
                      .filter(person => person.source === 'employee')
                      .map(employee => (
                        <option key={`employee-${employee.id}`} value={`employee-${employee.id}`}>
                          {employee.display_name} ({employee.role_display})
                        </option>
                      ))
                    }
                  </optgroup>
                )}
              </select>
              {selectedStaff && (
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${selectedStaff.source === 'staff' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                  <span className="text-slate-600">
                    <strong>{selectedStaff.display_name}</strong> ({selectedStaff.role_display})
                    {selectedStaff.source === 'employee' && (
                      <span className="ml-1 text-blue-600">• Employee</span>
                    )}
                    {selectedStaff.source === 'staff' && (
                      <span className="ml-1 text-emerald-600">• Staff Member</span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleMarkResolved}
                disabled={isResolving || !selectedStaffMember || (resolutionType === 'dismissed' && !dismissalReason.trim())}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all shadow-sm ${
                  resolutionType === 'resolved' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                } disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {isResolving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {resolutionType === 'resolved' ? 'Resolving...' : 'Dismissing...'}
                  </span>
                ) : (
                  <>
                    {resolutionType === 'resolved' ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as Resolved
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Dismiss Feedback
                      </span>
                    )}
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
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