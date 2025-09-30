import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';

const FeedbackFeedPage = () => {
  const [feedback, setFeedback] = useState([]);
  const [venueId, setVenueId] = useState(null);
  const navigate = useNavigate();

  // Fetch venue ID and feedback
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/signin'); // Redirect to sign-in if not authenticated
      } else {
        fetchVenueId(user.email); // Fetch venue ID
      }
    };

    fetchSession();
  }, [navigate]);

  // Fetch venue ID
  const fetchVenueId = async (email) => {
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('id, is_paid')
      .eq('email', email)
      .single();

    if (venueError) {
      console.error('Error fetching venue ID:', venueError);
    } else {
      if (!venueData.is_paid) {
        navigate('/pricing'); // Redirect to pricing if not paid
        return;
      }

      setVenueId(venueData.id);
      fetchFeedback(venueData.id);
    }
  };

  // Fetch feedback for the venue
  const fetchFeedback = async (venueId) => {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('venue_id', venueId)
      .not('additional_feedback', 'is', null) // Only fetch rows with additional_feedback
      .order('timestamp', { ascending: false }); // Sort by most recent

    if (error) {
      console.error('Error fetching feedback:', error);
    } else {
      setFeedback(data);
    }
  };

  return (
    <div className="space-y-6">
      <ChartCard
        title="Customer Feedback Feed"
        subtitle="Recent feedback from your customers"
      >
        <div className="space-y-4">
          {feedback.map((f, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{f.additional_feedback}</p>
                  {f.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < f.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({f.rating}/5)</span>
                    </div>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{new Date(f.timestamp).toLocaleDateString()}</div>
                  <div>{new Date(f.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          ))}
          {feedback.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-500">Customer feedback will appear here once submitted.</p>
            </div>
          )}
        </div>
      </ChartCard>
    </div>
  );
};

export default FeedbackFeedPage;