import React, { useState, useRef, useEffect } from 'react';
import { useVenue } from '../../../context/VenueContext';
import { ChevronDown, Building2, Check } from 'lucide-react';

const VenueSelector = () => {
  const { venueId, venueName, allVenues, setCurrentVenue, userRole } = useVenue();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show selector if only one venue
  if (!allVenues || allVenues.length <= 1) {
    return null;
  }

  const handleVenueSelect = (venue) => {
    setCurrentVenue(venue.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-50 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{venueName}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[250px]">
          <div className="p-2 border-b border-gray-100">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-2">
              Switch Venue
            </div>
          </div>
          <div className="p-2">
            {allVenues.map((venue) => (
              <button
                key={venue.id}
                onClick={() => handleVenueSelect(venue)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors ${
                  venue.id === venueId
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{venue.name}</span>
                </div>
                {venue.id === venueId && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          {userRole === 'master' && (
            <div className="p-2 border-t border-gray-100">
              <button
                onClick={() => {
                  window.location.href = '/dashboard/settings?tab=Venue';
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors text-left"
              >
                + Add New Venue
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueSelector;