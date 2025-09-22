import React, { useState, useEffect, useRef } from 'react';
import { useVenue } from '../../../context/VenueContext';
import { supabase } from '../../../utils/supabase';
import VenuePreviewModal from './VenuePreviewModal';

const GoogleReviewsCard = () => {
  const { venueId } = useVenue();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentRating, setCurrentRating] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentVenueData, setCurrentVenueData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [canGenerateReviewLink, setCanGenerateReviewLink] = useState(false);
  const [generateLinkLoading, setGenerateLinkLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  // Load current Google rating and venue data on mount
  useEffect(() => {
    if (venueId) {
      loadCurrentRating();
      loadCurrentVenueData();
    }
  }, [venueId]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadCurrentRating = async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/reviews?platform=google&action=ratings&venueId=${venueId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentRating(data);
      } else if (response.status !== 404) {
        console.error('Failed to load current rating');
      }
    } catch (error) {
      console.error('Error loading current rating:', error);
    }
  };

  const loadCurrentVenueData = async () => {
    try {
      const { data: venue, error } = await supabase
        .from('venues')
        .select('id, name, address, phone, website, venue_locked, place_id, google_review_link')
        .eq('id', venueId)
        .single();

      if (!error && venue) {
        setCurrentVenueData(venue);
        setIsLocked(venue.venue_locked || false);
        // Check if we can generate a review link (has place_id but no google_review_link)
        setCanGenerateReviewLink(venue.place_id && !venue.google_review_link);
      }
    } catch (error) {
      console.error('Error loading venue data:', error);
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    setShowDropdown(value.length > 2);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
    if (value.length > 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(value);
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const performSearch = async (query) => {
    console.log('🔍 Performing search for:', query);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      console.log('🔑 Token exists:', !!token);
      if (!token) {
        console.error('❌ No authentication token');
        return;
      }

      const url = `/api/reviews?platform=google&action=places-search&query=${encodeURIComponent(query)}&type=autocomplete`;
      console.log('📡 Fetching:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Search results:', data);
        setSearchResults(data.suggestions || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Search failed:', response.status, errorData);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectPlace = async (place) => {
    if (isLocked) {
      setMessage('Error: Venue is already locked to a Google listing');
      return;
    }

    setShowDropdown(false);
    setSearchQuery(place.description);
    setLoading(true);

    try {
      // Fetch full venue details from Google
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/reviews?platform=google&action=place-details&placeId=${place.place_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const venueData = await response.json();
        setSelectedPlace({ ...place, ...venueData });
        setShowPreviewModal(true);
      } else {
        const error = await response.json();
        setMessage(`Error fetching venue details: ${error.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVenue = async (autoPopulate) => {
    if (!selectedPlace) return;

    setLoading(true);
    setMessage('');
    setShowPreviewModal(false);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`/api/reviews?platform=google&action=update-venue&venueId=${venueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          place_id: selectedPlace.place_id,
          venue_data: selectedPlace,
          auto_populate: autoPopulate
        })
      });

      if (response.ok) {
        setMessage('Google listing linked successfully and venue locked!');
        setIsLocked(true);
        setSelectedPlace(null);
        setTimeout(() => {
          loadCurrentRating();
          loadCurrentVenueData();
        }, 1000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReviewLink = async () => {
    if (!currentVenueData?.place_id) return;

    setGenerateLinkLoading(true);
    setMessage('');

    try {
      const googleReviewLink = `https://search.google.com/local/writereview?placeid=${currentVenueData.place_id}`;
      
      // Update the venue with the generated review link
      const { error } = await supabase
        .from('venues')
        .update({ google_review_link: googleReviewLink })
        .eq('id', venueId);

      if (error) {
        throw error;
      }

      setMessage('Google review link generated and saved successfully!');
      setCanGenerateReviewLink(false);
      
      // Reload venue data to reflect the change
      setTimeout(() => {
        loadCurrentVenueData();
      }, 1000);

    } catch (error) {
      setMessage(`Error generating review link: ${error.message}`);
    } finally {
      setGenerateLinkLoading(false);
    }
  };

  const handleGoogleMapUrl = async () => {
    if (!googleMapUrl.trim() || isLocked) return;

    setLoading(true);
    setMessage('');

    try {
      // Extract place_id from Google Maps URL
      const placeIdMatch = googleMapUrl.match(/place_id=([^&]+)/);
      const dataMatch = googleMapUrl.match(/data=([^&]+)/);
      
      let placeId = null;
      
      if (placeIdMatch) {
        placeId = placeIdMatch[1];
      } else if (dataMatch) {
        // Handle encoded URLs - this is a simplified extraction
        const decoded = decodeURIComponent(dataMatch[1]);
        const pidMatch = decoded.match(/0x[a-f0-9]+:0x[a-f0-9]+/);
        if (pidMatch) {
          // For complex URLs, we'll need to use Find Place API
          const token = (await supabase.auth.getSession()).data.session?.access_token;
          const response = await fetch(`/api/reviews?platform=google&action=places-search&query=${encodeURIComponent(googleMapUrl)}&type=findplace`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.places && data.places.length > 0) {
              placeId = data.places[0].place_id;
            }
          }
        }
      }

      if (!placeId) {
        setMessage('Could not extract Place ID from URL. Please use the search instead.');
        return;
      }

      // Get full venue details and show preview modal
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const detailsResponse = await fetch(`/api/reviews?platform=google&action=place-details&placeId=${placeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (detailsResponse.ok) {
        const venueData = await detailsResponse.json();
        setSelectedPlace(venueData);
        setShowPreviewModal(true);
        setGoogleMapUrl('');
      } else {
        const error = await detailsResponse.json();
        setMessage(`Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Google Reviews</h3>
        <p className="text-sm text-gray-600">
          Link your Google Business listing to display star ratings and track review performance.
        </p>
      </div>

      {/* Current Rating Display */}
      {currentRating && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-gray-900">
              {currentRating.rating ? currentRating.rating.toFixed(1) : 'N/A'}
            </div>
            <div className="text-yellow-500 text-xl">⭐</div>
            <div className="text-sm text-gray-600">
              ({currentRating.ratings_count || 0} reviews)
            </div>
          </div>
          
          {/* Attribution */}
          {currentRating.attributions && currentRating.attributions.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              <div dangerouslySetInnerHTML={{ __html: currentRating.attributions[0] }} />
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            Last updated: {new Date(currentRating.fetched_at).toLocaleString()}
            {currentRating.cached && ' (cached)'}
          </div>
        </div>
      )}

      {/* Locked Status */}
      {isLocked && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-800">Google Venue Locked</h4>
                <p className="text-sm text-green-700">
                  Your venue is linked to Google and cannot be changed. This ensures rating progression tracking.
                </p>
              </div>
            </div>
            
            {/* Generate Review Link Button */}
            {canGenerateReviewLink && (
              <button
                onClick={handleGenerateReviewLink}
                disabled={generateLinkLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generateLinkLoading ? 'Generating...' : 'Generate Review Link'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search Section - Only show if not locked */}
      {!isLocked && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Find your business listing
            </label>
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search for your business name + city/postcode"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            
            {/* Search Dropdown */}
            {showDropdown && (searchResults.length > 0 || isSearching) && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                ) : (
                  searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => selectPlace(result)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-sm text-gray-900">
                        {result.structured_formatting?.main_text || result.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.structured_formatting?.secondary_text || ''}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

          {/* Google Maps URL Fallback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or paste Google Maps URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleGoogleMapUrl}
                disabled={loading || !googleMapUrl.trim()}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          message.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        </div>
      )}

      {/* Venue Preview Modal */}
      <VenuePreviewModal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedPlace(null);
        }}
        onConfirm={handleConfirmVenue}
        venueData={selectedPlace}
        currentVenueData={currentVenueData}
        isLoading={loading}
      />
    </div>
  );
};

export default GoogleReviewsCard;