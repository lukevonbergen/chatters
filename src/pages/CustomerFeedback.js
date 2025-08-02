import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { v4 as uuidv4 } from 'uuid';

const CustomerFeedbackPage = () => {
  const { venueId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [venue, setVenue] = useState(null);
  const [sessionId] = useState(uuidv4());
  const [tableNumber, setTableNumber] = useState('');
  const [current, setCurrent] = useState(0);
  const [feedbackAnswers, setFeedbackAnswers] = useState([]);
  const [freeText, setFreeText] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data for venueId:', venueId);
        
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

        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('logo, primary_color, secondary_color, table_count')
          .eq('id', venueId)
          .single();

        if (venueError) {
          console.error('Venue error:', venueError);
          throw new Error(`Failed to load venue: ${venueError.message}`);
        }

        console.log('Questions loaded:', questionsData?.length || 0);
        console.log('Venue loaded:', venueData ? 'success' : 'failed');

        if (!questionsData || questionsData.length === 0) {
          throw new Error('No active questions found for this venue');
        }

        if (!venueData) {
          throw new Error('Venue not found');
        }

        setQuestions(questionsData);
        setVenue(venueData);
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

  const handleEmojiAnswer = (emoji) => {
    const rating = { '😠': 1, '😞': 2, '😐': 3, '😊': 4, '😍': 5 }[emoji] || null;
    const question = questions[current];
    setFeedbackAnswers(prev => [...prev, {
      venue_id: venueId,
      question_id: question.id,
      session_id: sessionId,
      sentiment: emoji,
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

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-600 text-lg space-y-4 p-6">
        <div className="text-4xl">⚠️</div>
        <div className="text-center max-w-md">
          <div className="font-semibold mb-2">Unable to load feedback form</div>
          <div className="text-sm text-gray-600 mb-2">{error}</div>
          <div className="text-xs text-gray-400">Venue ID: {venueId}</div>
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
              {Array.from({ length: venue.table_count || 10 }, (_, i) => (
                <option key={i} value={i + 1}>Table {i + 1}</option>
              ))}
            </select>
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
            <h2 className="text-lg font-semibold mb-6">{questions[current].question}</h2>
            
            {/* Mobile-optimized emoji layout */}
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-2 px-2">
                {['😠', '😞', '😐', '😊', '😍'].map((emoji, index) => (
                  <div key={emoji} className="flex flex-col items-center">
                    <button
                      onClick={() => handleEmojiAnswer(emoji)}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-full text-2xl sm:text-3xl shadow-sm border hover:scale-110 transition transform active:scale-95 flex items-center justify-center"
                      style={{
                        borderColor: primary,
                        backgroundColor: secondary,
                      }}
                    >
                      {emoji}
                    </button>
                    <span className="text-xs mt-1 text-gray-500">
                      {['Poor', 'Fair', 'Good', 'Great', 'Excellent'][index]}
                    </span>
                  </div>
                ))}
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