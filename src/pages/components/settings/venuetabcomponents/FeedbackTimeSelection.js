import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../utils/supabase';

const FeedbackTimeSelection = () => {
  // Feedback hours state
  const [feedbackHours, setFeedbackHours] = useState({
    monday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] },
    tuesday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] },
    wednesday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] },
    thursday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] },
    friday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] },
    saturday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] },
    sunday: { enabled: true, periods: [{ start: '09:00', end: '22:00' }] }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Fetch feedback hours on component mount
  useEffect(() => {
    fetchFeedbackHours();
  }, []);

  const fetchFeedbackHours = async () => {
    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { data: userRow } = await supabase
        .from('users')
        .select('venue_id')
        .eq('id', user.id)
        .single();

      if (!userRow?.venue_id) return;

      const { data: venue } = await supabase
        .from('venues')
        .select('feedback_hours')
        .eq('id', userRow.venue_id)
        .single();

      if (venue?.feedback_hours) {
        setFeedbackHours(venue.feedback_hours);
      }
    } catch (error) {
      console.error('Error fetching feedback hours:', error);
    }
  };

  // Feedback hours utility functions
  const validateTime = (time) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
  };

  const roundToQuarterHour = (time) => {
    if (!validateTime(time)) return time;
    const [hours, minutes] = time.split(':').map(Number);
    const roundedMinutes = Math.round(minutes / 15) * 15;
    if (roundedMinutes === 60) {
      return `${String((hours + 1) % 24).padStart(2, '0')}:00`;
    }
    return `${String(hours).padStart(2, '0')}:${String(roundedMinutes).padStart(2, '0')}`;
  };

  const updateFeedbackHours = (day, field, value, periodIndex = 0) => {
    setFeedbackHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: field === 'enabled' ? value : prev[day][field],
        periods: field === 'enabled' ? prev[day].periods : 
          prev[day].periods.map((period, index) => 
            index === periodIndex ? { ...period, [field]: roundToQuarterHour(value) } : period
          )
      }
    }));
  };

  const addPeriod = (day) => {
    setFeedbackHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        periods: [...prev[day].periods, { start: '12:00', end: '18:00' }]
      }
    }));
  };

  const removePeriod = (day, periodIndex) => {
    if (feedbackHours[day].periods.length <= 1) return;
    setFeedbackHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        periods: prev[day].periods.filter((_, index) => index !== periodIndex)
      }
    }));
  };

  const copyToAllDays = (sourceDay) => {
    const sourceConfig = feedbackHours[sourceDay];
    const newConfig = {};
    dayNames.forEach(day => {
      newConfig[day] = { 
        enabled: sourceConfig.enabled,
        periods: [...sourceConfig.periods] // Deep copy the periods array
      };
    });
    setFeedbackHours(newConfig);
  };

  const saveFeedbackHours = async () => {
    setLoading(true);
    setMessage('');

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userRow } = await supabase
        .from('users')
        .select('venue_id')
        .eq('id', user.id)
        .single();

      if (!userRow?.venue_id) {
        throw new Error('No venue found for user');
      }

      const { error } = await supabase
        .from('venues')
        .update({ feedback_hours: feedbackHours })
        .eq('id', userRow.venue_id);

      if (error) throw error;

      setMessage('Feedback hours saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);

    } catch (error) {
      console.error('Error saving feedback hours:', error);
      setMessage('Failed to save feedback hours: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 lg:p-8">
      <div className="mb-6">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Feedback Collection Hours</h3>
        <p className="text-gray-600 text-sm">Set when customers can leave feedback. Useful for avoiding feedback during busy periods or when operating as different venue types.</p>
      </div>

      <div className="space-y-6">
        {dayNames.map((day, dayIndex) => (
          <div key={day} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={feedbackHours[day].enabled}
                  onChange={(e) => updateFeedbackHours(day, 'enabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  {dayLabels[dayIndex]}
                </label>
              </div>
              
              {feedbackHours[day].enabled && (
                <button
                  onClick={() => copyToAllDays(day)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  Copy to all days
                </button>
              )}
            </div>

            {feedbackHours[day].enabled && (
              <div className="space-y-3 ml-7">
                {feedbackHours[day].periods.map((period, periodIndex) => (
                  <div key={periodIndex} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={period.start}
                        onChange={(e) => updateFeedbackHours(day, 'start', e.target.value, periodIndex)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="time"
                        value={period.end}
                        onChange={(e) => updateFeedbackHours(day, 'end', e.target.value, periodIndex)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    {feedbackHours[day].periods.length > 1 && (
                      <button
                        onClick={() => removePeriod(day, periodIndex)}
                        className="text-red-500 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  onClick={() => addPeriod(day)}
                  className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  + Add break time
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Feedback Hours</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Set break times if you close between lunch and dinner service</li>
            <li>• Disable late hours if your venue becomes a nightclub to avoid intoxicated feedback</li>
            <li>• Times automatically round to 15-minute intervals</li>
            <li>• Overnight hours (e.g., 22:00 to 02:00) are supported</li>
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={saveFeedbackHours}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Feedback Hours'}
        </button>
        
        {message && (
          <div className={`text-sm p-3 rounded-md mt-3 ${
            message.includes('success') 
              ? 'text-green-700 bg-green-50 border border-green-200' 
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTimeSelection;