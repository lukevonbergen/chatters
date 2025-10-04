import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import FeedbackTimeSelection from '../../components/dashboard/settings/venuetabcomponents/FeedbackTimeSelection';

const FeedbackSettings = () => {
  usePageTitle('Feedback Settings');
  const { venueId } = useVenue();

  // Review Platform Links state
  const [tripadvisorLink, setTripadvisorLink] = useState('');
  const [googleReviewLink, setGoogleReviewLink] = useState('');
  const [reviewLinksLoading, setReviewLinksLoading] = useState(false);
  const [reviewLinksMessage, setReviewLinksMessage] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [tripadvisorLocationId, setTripadvisorLocationId] = useState('');

  // Session Timeout state
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(2);
  const [selectedTimeoutHours, setSelectedTimeoutHours] = useState(2); // For UI state before save
  const [sessionTimeoutLoading, setSessionTimeoutLoading] = useState(false);
  const [sessionTimeoutMessage, setSessionTimeoutMessage] = useState('');

  // NPS state
  const [npsEnabled, setNpsEnabled] = useState(false);
  const [npsDelayHours, setNpsDelayHours] = useState(24);
  const [npsQuestion, setNpsQuestion] = useState('How likely are you to recommend us to a friend or colleague?');
  const [npsLoading, setNpsLoading] = useState(false);
  const [npsMessage, setNpsMessage] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    if (!venueId) return;
    fetchFeedbackSettings();
  }, [venueId]);

  const fetchFeedbackSettings = async () => {
    try {
      const { data: venueData, error } = await supabase
        .from('venues')
        .select('tripadvisor_link, google_review_link, session_timeout_hours, nps_enabled, nps_delay_hours, nps_question, place_id, tripadvisor_location_id')
        .eq('id', venueId)
        .single();

      if (error) {
        console.error('Error fetching feedback settings:', error);
        return;
      }

      setTripadvisorLink(venueData.tripadvisor_link || '');
      setGoogleReviewLink(venueData.google_review_link || '');
      setSessionTimeoutHours(venueData.session_timeout_hours || 2);
      setSelectedTimeoutHours(venueData.session_timeout_hours || 2);
      setNpsEnabled(venueData.nps_enabled || false);
      setNpsDelayHours(venueData.nps_delay_hours || 24);
      setNpsQuestion(venueData.nps_question || 'How likely are you to recommend us to a friend or colleague?');
      setPlaceId(venueData.place_id || '');
      setTripadvisorLocationId(venueData.tripadvisor_location_id || '');
    } catch (error) {
      console.error('Error fetching feedback settings:', error);
    }
  };

  // Regenerate Google Review URL
  const regenerateGoogleUrl = () => {
    if (placeId) {
      const generatedUrl = `https://search.google.com/local/writereview?placeid=${placeId}`;
      setGoogleReviewLink(generatedUrl);
      setReviewLinksMessage('Google review URL regenerated! Click "Save Review Links" to save.');
    } else {
      setReviewLinksMessage('No Google Place ID found. Please link your venue in Settings > Integrations first.');
    }
  };

  // Regenerate TripAdvisor URL
  const regenerateTripAdvisorUrl = () => {
    if (tripadvisorLocationId) {
      // TripAdvisor location ID format is just the numeric ID (e.g., "26229914")
      // The write review URL uses format: UserReviewEdit-d{location_id}
      const generatedUrl = `https://www.tripadvisor.com/UserReviewEdit-d${tripadvisorLocationId}`;
      setTripadvisorLink(generatedUrl);
      setReviewLinksMessage('TripAdvisor review URL regenerated! Click "Save Review Links" to save.');
    } else {
      setReviewLinksMessage('No TripAdvisor Location ID found. Please link your venue in Settings > Integrations first.');
    }
  };

  // Save review links
  const saveReviewLinks = async () => {
    if (!venueId) return;

    setReviewLinksLoading(true);
    setReviewLinksMessage('');

    try {
      const { error } = await supabase
        .from('venues')
        .update({
          tripadvisor_link: tripadvisorLink,
          google_review_link: googleReviewLink,
        })
        .eq('id', venueId);

      if (error) {
        throw error;
      }

      setReviewLinksMessage('Review links updated successfully!');
    } catch (error) {
      console.error('Error updating review links:', error);
      setReviewLinksMessage('Failed to update review links: ' + error.message);
    } finally {
      setReviewLinksLoading(false);
    }
  };

  // Save session timeout
  const saveSessionTimeout = async () => {
    if (!venueId) return;

    setSessionTimeoutLoading(true);
    setSessionTimeoutMessage('');

    try {
      const { data, error, count } = await supabase
        .from('venues')
        .update({ session_timeout_hours: selectedTimeoutHours })
        .eq('id', venueId)
        .select();

      if (error) throw error;

      if (count === 0 || !data || data.length === 0) {
        throw new Error('No rows updated. You may not have permission to update this venue.');
      }

      // Update the stored value to match the selected value
      setSessionTimeoutHours(selectedTimeoutHours);
      setSessionTimeoutMessage('Session timeout updated successfully!');
    } catch (error) {
      console.error('Error saving session timeout:', error);
      const errorDetails = error.code ? `Error ${error.code}: ${error.message}` : error.message;
      setSessionTimeoutMessage(`Failed to save session timeout: ${errorDetails}. Please contact support with this error code.`);
    } finally {
      setSessionTimeoutLoading(false);
    }
  };

  // Save NPS settings
  const saveNPSSettings = async () => {
    if (!venueId) return;

    setNpsLoading(true);
    setNpsMessage('');

    try {
      const { error } = await supabase
        .from('venues')
        .update({
          nps_enabled: npsEnabled,
          nps_delay_hours: npsDelayHours,
          nps_question: npsQuestion
        })
        .eq('id', venueId);

      if (error) throw error;

      setNpsMessage('NPS settings updated successfully!');
    } catch (error) {
      console.error('Error saving NPS settings:', error);
      setNpsMessage(`Failed to save NPS settings: ${error.message}`);
    } finally {
      setNpsLoading(false);
    }
  };

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Feedback Settings"
        subtitle="Configure review platform links, session timeout, and feedback collection hours"
      >
        <div className="space-y-8">
          {/* Review Platform Links Section */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Platform Links</h3>
              <p className="text-sm text-gray-500 mt-1">Direct satisfied customers to leave positive reviews</p>
            </div>
            <div className="space-y-6">
              {/* TripAdvisor */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                TripAdvisor
              </label>
              <p className="text-xs text-gray-500">Your TripAdvisor review page</p>
            </div>
            <div className="lg:col-span-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://www.tripadvisor.com/your-venue"
                  value={tripadvisorLink}
                  onChange={(e) => setTripadvisorLink(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={regenerateTripAdvisorUrl}
                  disabled={!tripadvisorLocationId}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  title={tripadvisorLocationId ? "Generate TripAdvisor review URL" : "Link venue in Integrations first"}
                >
                  Regenerate Feedback URL
                </button>
              </div>
              {tripadvisorLink && tripadvisorLink.includes('tripadvisor.com/UserReviewEdit') && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Generated from TripAdvisor integration
                </p>
              )}
              {!tripadvisorLocationId && (
                <p className="text-xs text-amber-600">
                  Link your TripAdvisor venue in Settings → Integrations to enable URL generation
                </p>
              )}
            </div>
          </div>

          {/* Google Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Reviews
              </label>
              <p className="text-xs text-gray-500">Your Google Business review link</p>
            </div>
            <div className="lg:col-span-2 space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={googleReviewLink}
                  onChange={(e) => setGoogleReviewLink(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={regenerateGoogleUrl}
                  disabled={!placeId}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  title={placeId ? "Generate Google review URL" : "Link venue in Integrations first"}
                >
                  Regenerate Feedback URL
                </button>
              </div>
              {googleReviewLink && googleReviewLink.includes('writereview?placeid=') && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Generated from Google Places integration
                </p>
              )}
              {!placeId && (
                <p className="text-xs text-amber-600">
                  Link your Google Business venue in Settings → Integrations to enable URL generation
                </p>
              )}
            </div>
          </div>

          {/* Save Action */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Update review links to guide satisfied customers
              </div>
              <button
                onClick={saveReviewLinks}
                disabled={reviewLinksLoading}
                className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reviewLinksLoading ? 'Saving...' : 'Save Review Links'}
              </button>
            </div>
            {reviewLinksMessage && (
              <div className={`text-xs p-2 rounded-lg mt-3 ${
                reviewLinksMessage.includes('success') || reviewLinksMessage.includes('regenerated')
                  ? 'text-green-700 bg-green-50 border border-green-200'
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {reviewLinksMessage}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Two Column Layout for Session Timeout and Collection Hours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Session Timeout Settings */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Session Timeout</h3>
                <p className="text-sm text-gray-500">Configure how long feedback sessions remain visible in the kiosk view</p>
              </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeout Duration (Hours)
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  Feedback older than this will be filtered from kiosk view
                </p>
                
                {/* Radio button options */}
                <div className="space-y-3">
                  {[1, 2, 4, 6, 8, 12, 24].map((hours) => (
                    <label key={hours} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="sessionTimeout"
                        value={hours}
                        checked={selectedTimeoutHours === hours}
                        onChange={() => setSelectedTimeoutHours(hours)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {hours} hour{hours !== 1 ? 's' : ''}{hours === 2 ? ' (default)' : ''}
                      </span>
                    </label>
                  ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-3">
                  Current setting: Feedback older than {sessionTimeoutHours} hour{sessionTimeoutHours !== 1 ? 's' : ''} will be hidden from staff kiosk
                </p>
                
                {/* Show if changes are pending */}
                {selectedTimeoutHours !== sessionTimeoutHours && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700">
                      You have unsaved changes. Click "Save Settings" to apply the new timeout of {selectedTimeoutHours} hour{selectedTimeoutHours !== 1 ? 's' : ''}.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Save Action */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-col space-y-2">
                <button
                  onClick={saveSessionTimeout}
                  disabled={sessionTimeoutLoading || selectedTimeoutHours === sessionTimeoutHours}
                  className="w-full bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sessionTimeoutLoading ? 'Saving...' : 'Save Settings'}
                </button>
                <div className="text-xs text-gray-500 text-center">
                  {selectedTimeoutHours === sessionTimeoutHours 
                    ? 'Changes apply immediately to all staff devices' 
                    : 'Click Save Settings to apply changes'}
                </div>
              </div>
              {sessionTimeoutMessage && (
                <div className={`text-xs p-2 rounded-lg mt-3 ${
                  sessionTimeoutMessage.includes('success') 
                    ? 'text-green-700 bg-green-50 border border-green-200' 
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}>
                  {sessionTimeoutMessage}
                </div>
              )}
            </div>
          </div>
          </div>

          {/* Right Column - Feedback Collection Hours */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Feedback Collection Hours</h3>
                <p className="text-sm text-gray-500">Set when customers can leave feedback during operating hours</p>
              </div>
              <FeedbackTimeSelection currentVenueId={venueId} />
          </div>
        </div>

        {/* NPS Settings Section */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Net Promoter Score (NPS)</h3>
            <p className="text-sm text-gray-500 mt-1">Send automated follow-up emails to gather customer loyalty insights</p>
          </div>

          <div className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enable NPS Emails
                </label>
                <p className="text-xs text-gray-500">Automatically send NPS surveys after visits</p>
              </div>
              <div className="lg:col-span-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={npsEnabled}
                    onChange={(e) => setNpsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">
                    {npsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            </div>

            {/* Delay Hours */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Send Delay
                </label>
                <p className="text-xs text-gray-500">Hours after visit to send NPS email</p>
              </div>
              <div className="lg:col-span-2">
                <div className="space-y-2">
                  {[12, 24, 36].map((hours) => (
                    <label key={hours} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="npsDelay"
                        value={hours}
                        checked={npsDelayHours === hours}
                        onChange={() => setNpsDelayHours(hours)}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {hours} hours {hours === 24 ? '(recommended)' : ''}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* NPS Question */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NPS Question
                </label>
                <p className="text-xs text-gray-500">Customize the question shown to customers</p>
              </div>
              <div className="lg:col-span-2">
                <textarea
                  value={npsQuestion}
                  onChange={(e) => setNpsQuestion(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="How likely are you to recommend us to a friend or colleague?"
                />
              </div>
            </div>

            {/* Save Action */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {npsEnabled
                    ? 'Customers who provide email will receive NPS surveys'
                    : 'Enable to start collecting NPS data'}
                </div>
                <button
                  onClick={saveNPSSettings}
                  disabled={npsLoading}
                  className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {npsLoading ? 'Saving...' : 'Save NPS Settings'}
                </button>
              </div>
              {npsMessage && (
                <div className={`text-xs p-2 rounded-lg mt-3 ${
                  npsMessage.includes('success')
                    ? 'text-green-700 bg-green-50 border border-green-200'
                    : 'text-red-700 bg-red-50 border border-red-200'
                }`}>
                  {npsMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </ChartCard>
    </div>
  );
};

export default FeedbackSettings;