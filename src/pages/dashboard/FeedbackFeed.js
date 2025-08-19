import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import PageContainer from '../../components/dashboard/layout/PageContainer';

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
      <PageContainer>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Feedback Feed</h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Feedback</h2>
          <div className="space-y-4">
            {feedback.map((f, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">{f.additional_feedback}</p>
                  <span className="text-sm text-gray-400">
                    {new Date(f.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
            {feedback.length === 0 && (
              <p className="text-gray-500 text-center">No feedback available.</p>
            )}
          </div>
        </div>
      </PageContainer>
  );
};

export default FeedbackFeedPage;