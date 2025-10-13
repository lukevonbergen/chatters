// /src/components/google-reviews/ReviewCard.jsx
import React, { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useVenue } from '../../context/VenueContext';

const ReviewCard = ({ review, venueId, onReplySuccess }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { userRole } = useVenue();
  const [canReply, setCanReply] = useState(true);

  // Check reply permission for managers
  React.useEffect(() => {
    const checkReplyPermission = async () => {
      if (userRole === 'manager') {
        const { data: permissions } = await supabase
          .from('venue_permissions')
          .select('can_reply_to_google_reviews')
          .eq('venue_id', venueId)
          .single();

        setCanReply(permissions?.can_reply_to_google_reviews || false);
      }
    };

    checkReplyPermission();
  }, [userRole, venueId]);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      alert('Please enter a reply');
      return;
    }

    if (replyText.length > 4096) {
      alert('Reply is too long (max 4096 characters)');
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to reply');
        return;
      }

      const response = await fetch('/api/google-reviews?action=reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          reviewId: review.id,
          replyText: replyText.trim(),
          venueId
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit reply');
      }

      setShowReplyBox(false);
      setReplyText('');
      onReplySuccess();
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert(error.message || 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 fill-current'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Reviewer Photo */}
          {review.reviewer_profile_photo ? (
            <img
              src={review.reviewer_profile_photo}
              alt={review.reviewer_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Reviewer Info */}
          <div>
            <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
            <div className="flex items-center gap-3 mt-1">
              {renderStars(review.star_rating)}
              <span className="text-sm text-gray-500">
                {formatDate(review.review_date)}
              </span>
            </div>
          </div>
        </div>

        {/* Location Badge */}
        {review.google_locations && (
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg text-sm text-gray-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {review.google_locations.location_name}
          </div>
        )}
      </div>

      {/* Review Text */}
      {review.review_text && (
        <p className="text-gray-700 leading-relaxed mb-4">{review.review_text}</p>
      )}

      {/* Reply Section */}
      {review.is_replied ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-900">Your Reply</span>
            <span className="text-xs text-blue-700">{formatDate(review.reply_date)}</span>
          </div>
          <p className="text-blue-900 text-sm leading-relaxed">{review.review_reply}</p>
        </div>
      ) : (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {!showReplyBox ? (
            <button
              onClick={() => setShowReplyBox(true)}
              disabled={!canReply}
              className="inline-flex items-center px-4 py-2 bg-custom-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={!canReply ? 'You do not have permission to reply to reviews' : ''}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              Reply to Review
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a thoughtful reply to this review..."
                maxLength={4096}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {replyText.length} / 4096 characters
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText('');
                    }}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={submitting || !replyText.trim()}
                    className="px-4 py-2 bg-custom-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
