import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../utils/supabase';
import { v4 as uuidv4 } from 'uuid';
import { HandHeart, Clock, Star } from 'lucide-react';

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [venue, setVenue] = useState(null);
  const [activeTables, setActiveTables] = useState([]);
  const [sessionId] = useState(uuidv4());
  const [tableNumber, setTableNumber] = useState('');
  const [current, setCurrent] = useState(0);
  const [feedbackAnswers, setFeedbackAnswers] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackUnavailable, setFeedbackUnavailable] = useState(false);
  const [assistanceLoading, setAssistanceLoading] = useState(false);
  const [assistanceRequested, setAssistanceRequested] = useState(false);

  // Utility function to check if current time is within feedback hours
  const isFeedbackTimeAllowed = (feedbackHours) => {
    if (!feedbackHours) return true; // If no hours set, allow feedback anytime
    
    try {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      const dayConfig = feedbackHours[currentDay];
      if (!dayConfig || !dayConfig.enabled) {
        return false; // Feedback disabled for this day
      }
      
      // Check if current time falls within any of the allowed periods
      return dayConfig.periods.some(period => {
        const { start, end } = period;
        
        // Handle overnight hours (e.g., 22:00 to 02:00)
        if (start > end) {
          return currentTime >= start || currentTime <= end;
        } else {
          return currentTime >= start && currentTime <= end;
        }
      });
    } catch (error) {
      console.error('Error checking feedback time:', error);
      // If there's an error checking time, default to allowing feedback
      return true;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for venueId:', venueId);
        
        // Load venue data first (including feedback_hours)
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('logo, primary_color, secondary_color, feedback_hours')
          .eq('id', venueId)
          .single();

        if (venueError) {
          console.error('Venue error:', venueError);
          throw new Error(`Failed to load venue: ${venueError.message}`);
        }

        if (!venueData) {
          throw new Error('Venue not found');
        }

        // Check if feedback is currently allowed
        const feedbackAllowed = isFeedbackTimeAllowed(venueData.feedback_hours);
        if (!feedbackAllowed) {
          setFeedbackUnavailable(true);
          setVenue(venueData);
          setLoading(false);
          return;
        }

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('venue_id', venueId)
          .eq('active', true)
          .order('order');

        if (questionsError) {
          console.error('Questions error:', questionsError);
          throw new Error(`Failed to load questions: ${questionsError.message}`);
        }

        // Load active tables from floor plan
        const { data: tablesData, error: tablesError } = await supabase
          .from('table_positions')
          .select('table_number')
          .eq('venue_id', venueId)
          .order('table_number');

        if (tablesError) {
          console.error('Tables error:', tablesError);
          // Don't throw error here, just log it and continue with empty tables
          console.warn('Could not load tables, continuing without table selection');
        }

        console.log('Questions loaded:', questionsData?.length || 0);
        console.log('Venue loaded:', venueData ? 'success' : 'failed');
        console.log('Tables loaded:', tablesData?.length || 0);

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No active questions found for this venue');
        }

        setQuestions(questionsData);
        setVenue(venueData);
        
        // Process and sort tables numerically
        if (tablesData && tablesData.length > 0) {
          const sortedTables = tablesData
            .map(t => t.table_number)
            .filter(Boolean) // Remove any null/empty table numbers
            .sort((a, b) => {
              // Handle mixed alphanumeric sorting
              const aNum = parseInt(a);
              const bNum = parseInt(b);
              
              // If both are numbers, sort numerically
              if (!isNaN(aNum) && !isNaN(bNum)) {
                return aNum - bNum;
              }
              
              // Otherwise, sort alphabetically
              return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
            });
          
          setActiveTables(sortedTables);
        } else {
          setActiveTables([]);
        }
        
        setError(null);

      } catch (err) {
        console.error('Error loading feedback form:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      loadData();
    } else {
      setError('No venue ID provided');
      setLoading(false);
    }
  }, [venueId]);

  const handleStarAnswer = (rating) => {
    const question = questions[current];
    setFeedbackAnswers(prev => [...prev, {
      venue_id: venueId,
      question_id: question.id,
      session_id: sessionId,
      sentiment: null, // No emoji sentiment for stars
      rating,
      table_number: tableNumber || null,
    }]);

    if (current < questions.length - 1) setCurrent(current + 1);
    else setCurrent(-1); // Move to free-text input
  };

  const handleSubmit = async () => {
    try {
      const entries = [...feedbackAnswers];
      if (freeText.trim()) {
        entries.push({
          venue_id: venueId,
          question_id: null,
          sentiment: null,
          rating: null,
          additional_feedback: freeText,
          table_number: tableNumber || null,
          session_id: sessionId,
        });
      }

      const { error } = await supabase.from('feedback').insert(entries);
      if (error) {
        console.error('Error submitting feedback:', error);
        alert('Failed to submit feedback. Please try again.');
        return;
      }
      
      setIsFinished(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleAssistanceRequest = async () => {
    if (assistanceLoading || !tableNumber) return;

    setAssistanceLoading(true);
    
    try {
      // Use Edge Function to bypass RLS restrictions
      const { data, error } = await supabase.functions.invoke('create-assistance-request', {
        body: {
          venueId: venueId,
          tableNumber: tableNumber,
          message: 'Just need assistance - Our team will be right with you'
        }
      });

      if (error) {
        console.error('Error requesting assistance:', error);
        alert('Failed to request assistance. Please try again.');
        return;
      }

      setAssistanceRequested(true);
    } catch (err) {
      console.error('Error requesting assistance:', err);
      alert('Failed to request assistance. Please try again.');
    } finally {
      setAssistanceLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600 text-lg space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <div>Loading feedback form...</div>
        <div className="text-sm text-gray-400">Venue ID: {venueId}</div>
      </div>
    );
  }

  // Feedback unavailable state (outside of allowed hours)
  if (feedbackUnavailable) {
    const primary = venue?.primary_color || '#111827';
    const secondary = venue?.secondary_color || '#f3f4f6';
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: secondary }}>
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 text-center" style={{ color: primary }}>
          {venue?.logo && (
            <div className="mb-6">
              <img src={venue.logo} alt="Venue Logo" className="h-14 mx-auto" />
            </div>
          )}
          
          <div className="text-4xl mb-4">🕒</div>
          <h2 className="text-xl font-semibold mb-4">Feedback Currently Unavailable</h2>
          <p className="text-gray-600 text-sm mb-6">
            We're not accepting feedback at the moment. Please try again during our service hours.
          </p>
          
          <div className="text-xs text-gray-400">
            Thank you for your interest in providing feedback!
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600 text-lg space-y-4 p-6">
        <div className="text-4xl">⚠️</div>
        <div className="text-center max-w-md">
          <div className="font-semibold mb-2">Unable to load feedback form</div>
          <div className="text-sm text-gray-600 mb-2">{error}</div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Success state
  if (isFinished) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-green-600 space-y-4">
        <div className="text-4xl">✅</div>
        <div className="text-xl font-semibold text-center">Thanks for your feedback!</div>
        <div className="text-sm text-gray-500">Your response has been submitted successfully.</div>
      </div>
    );
  }

  // Assistance requested state
  if (assistanceRequested) {
    const primary = venue?.primary_color || '#111827';
    const secondary = venue?.secondary_color || '#f3f4f6';
    
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: secondary }}>
        <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 text-center" style={{ color: primary }}>
          {venue?.logo && (
            <div className="mb-6">
              <img src={venue.logo} alt="Venue Logo" className="h-14 mx-auto" />
            </div>
          )}
          
          <HandHeart className="w-16 h-16 text-orange-500 mx-auto mb-6" />
          <h2 className="text-xl font-semibold mb-4">Help is on the way!</h2>
          <p className="text-gray-600 text-sm mb-6">
            We've notified our team that Table {tableNumber} needs assistance. 
            Someone will be with you shortly.
          </p>
          
          <div className="flex items-center justify-center text-orange-600 mb-4">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium text-sm">Expected response time: 2-5 minutes</span>
          </div>
          
          <div className="text-xs text-gray-400">
            You can close this page now.
          </div>
        </div>
      </div>
    );
  }

  const primary = venue.primary_color || '#111827';
  const secondary = venue.secondary_color || '#f3f4f6';

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: secondary }}>
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-6 text-center" style={{ color: primary }}>
        {venue.logo && (
          <div className="mb-6">
            <img src={venue.logo} alt="Venue Logo" className="h-14 mx-auto" />
          </div>
        )}

        {!tableNumber ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Select Your Table</h2>
            
            {activeTables.length > 0 && (
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg text-base"
                style={{
                  borderColor: primary,
                  backgroundColor: secondary,
                }}
              >
                <option value="">Choose your table</option>
                {activeTables.map((tableNum) => (
                  <option key={tableNum} value={tableNum}>
                    {tableNum}
                  </option>
                ))}
              </select>
            )}
          </div>
        ) : current >= 0 ? (
          <div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                Question {current + 1} of {questions.length}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${((current + 1) / questions.length) * 100}%`,
                    backgroundColor: primary 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Show selected table */}
            {tableNumber && (
              <div className="mb-4 text-sm text-gray-600">
                Feedback for Table {tableNumber}
              </div>
            )}
            
            <h2 className="text-lg font-semibold mb-6">{questions[current].question}</h2>
            
            {/* Star rating system */}
            <div className="space-y-6">
              <div className="flex justify-center items-center space-x-2 px-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex flex-col items-center">
                    <button
                      onClick={() => handleStarAnswer(rating)}
                      className="p-2 rounded-full hover:scale-110 transition transform active:scale-95 flex items-center justify-center"
                      style={{
                        backgroundColor: secondary,
                      }}
                    >
                      <Star 
                        className="w-8 h-8 sm:w-10 sm:h-10" 
                        style={{ color: primary }}
                        fill={primary}
                      />
                    </button>
                    <span className="text-xs mt-1 text-gray-500">
                      {rating}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Tap a star to rate</p>
                <div className="flex justify-center space-x-4 text-xs text-gray-500">
                  <span>1 = Poor</span>
                  <span>5 = Excellent</span>
                </div>
              </div>

              {/* Assistance Request Button */}
              <div className="border-t pt-4 mt-6">
                <p className="text-gray-600 text-sm mb-3 text-center">Don't want to leave feedback right now?</p>
                <button
                  onClick={handleAssistanceRequest}
                  disabled={assistanceLoading}
                  className="w-full bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 text-orange-800 py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {assistanceLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                      Requesting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <HandHeart className="w-4 h-4 mr-2" />
                      <div className="text-center">
                        <div className="font-bold text-sm">Just need assistance?</div>
                        <div className="text-xs">Our team will be right with you</div>
                      </div>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Anything else you'd like to tell us?</h2>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              rows={4}
              placeholder="Leave any additional comments..."
              className="w-full p-3 border rounded-lg text-base mb-4"
              style={{
                borderColor: primary,
                backgroundColor: secondary,
              }}
            />
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-lg font-semibold text-white text-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: primary }}
            >
              Submit Feedback
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerFeedbackPage;