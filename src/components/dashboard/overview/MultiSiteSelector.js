import React, { useState, useRef, useEffect } from 'react';
import { useVenue } from '../../../context/VenueContext';
import { Check, ChevronDown, Search, Building2 } from 'lucide-react';

const MultiSiteSelector = ({ onSelectionChange, selectedVenues = [], componentId }) => {
  const { allVenues, venueId } = useVenue();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMultiSiteEnabled, setIsMultiSiteEnabled] = useState(false);
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

  // Load saved preferences
  useEffect(() => {
    if (!allVenues || allVenues.length <= 1) return;
    
    const savedPrefs = localStorage.getItem(`overview_reporting_${componentId}`);
    if (savedPrefs) {
      const { isMultiSite, venues } = JSON.parse(savedPrefs);
      setIsMultiSiteEnabled(isMultiSite);
      if (isMultiSite && venues && venues.length > 0) {
        // Only call if venues are different from current selection
        const venuesChanged = venues.length !== selectedVenues.length || 
                             venues.some(id => !selectedVenues.includes(id));
        if (venuesChanged) {
          onSelectionChange(venues, true);
        }
      }
    } else {
      // Default: multi-site enabled with all venues for multi-venue users
      setIsMultiSiteEnabled(true);
      const allVenueIds = allVenues.map(v => v.id);
      // Only call if different from current selection
      const venuesChanged = allVenueIds.length !== selectedVenues.length || 
                           allVenueIds.some(id => !selectedVenues.includes(id));
      if (venuesChanged) {
        onSelectionChange(allVenueIds, true);
      }
    }
  }, [allVenues, componentId, selectedVenues]);

  // Don't show for single venue users
  if (!allVenues || allVenues.length <= 1) {
    return null;
  }

  // Save preferences
  const savePreferences = (isMultiSite, venues) => {
    localStorage.setItem(`overview_reporting_${componentId}`, JSON.stringify({
      isMultiSite,
      venues
    }));
  };

  const handleMultiSiteToggle = (checked) => {
    setIsMultiSiteEnabled(checked);
    if (checked) {
      // Enable multi-site with all venues selected
      const allVenueIds = allVenues.map(v => v.id);
      onSelectionChange(allVenueIds, true);
      savePreferences(true, allVenueIds);
    } else {
      // Disable multi-site, use current venue
      onSelectionChange([venueId], false);
      savePreferences(false, [venueId]);
    }
    setIsOpen(false);
  };

  const handleVenueToggle = (venueIdToToggle) => {
    let newSelection;
    if (selectedVenues.includes(venueIdToToggle)) {
      newSelection = selectedVenues.filter(id => id !== venueIdToToggle);
    } else {
      newSelection = [...selectedVenues, venueIdToToggle];
    }
    
    // Ensure at least one venue is selected
    if (newSelection.length === 0) {
      newSelection = [venueId];
    }
    
    onSelectionChange(newSelection, isMultiSiteEnabled);
    savePreferences(isMultiSiteEnabled, newSelection);
  };

  const handleSelectAll = () => {
    const allVenueIds = allVenues.map(v => v.id);
    onSelectionChange(allVenueIds, isMultiSiteEnabled);
    savePreferences(isMultiSiteEnabled, allVenueIds);
  };

  const handleClearAll = () => {
    const currentVenueOnly = [venueId];
    onSelectionChange(currentVenueOnly, isMultiSiteEnabled);
    savePreferences(isMultiSiteEnabled, currentVenueOnly);
  };

  const filteredVenues = allVenues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedVenues.length;
  const totalCount = allVenues.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Multi-Site Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isMultiSiteEnabled}
            onChange={(e) => handleMultiSiteToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Multi-Site View</span>
        </label>

        {/* Venue Selector Button */}
        {isMultiSiteEnabled && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Building2 className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">
              {selectedCount === totalCount ? 'All venues' : `${selectedCount} of ${totalCount}`}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && isMultiSiteEnabled && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 border-b border-gray-100 flex justify-between">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-gray-600 hover:text-gray-700 font-medium"
            >
              Clear All
            </button>
          </div>

          {/* Venue List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredVenues.map((venue) => (
              <label
                key={venue.id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedVenues.includes(venue.id)}
                  onChange={() => handleVenueToggle(venue.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{venue.name}</span>
                {selectedVenues.includes(venue.id) && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </label>
            ))}
          </div>

          {filteredVenues.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              No venues found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSiteSelector;