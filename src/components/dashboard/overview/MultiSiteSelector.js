import React, { useState, useRef, useEffect } from 'react';
import { useVenue } from '../../../context/VenueContext';
import { Check, ChevronDown, Search, Building2 } from 'lucide-react';

const MultiSiteSelector = ({ onSelectionChange, selectedVenues = [], componentId }) => {
  const { allVenues, venueId } = useVenue();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      const { venues } = JSON.parse(savedPrefs);
      if (venues && venues.length > 0) {
        // Only call if venues are different from current selection
        const venuesChanged = venues.length !== selectedVenues.length || 
                             venues.some(id => !selectedVenues.includes(id));
        if (venuesChanged) {
          const isMultiSite = venues.length > 1;
          onSelectionChange(venues, isMultiSite);
        }
      }
    } else {
      // Default: all venues selected for multi-venue users
      const allVenueIds = allVenues.map(v => v.id);
      // Only call if different from current selection
      const venuesChanged = allVenueIds.length !== selectedVenues.length || 
                           allVenueIds.some(id => !selectedVenues.includes(id));
      if (venuesChanged) {
        const isMultiSite = allVenueIds.length > 1;
        onSelectionChange(allVenueIds, isMultiSite);
      }
    }
  }, [allVenues, componentId, selectedVenues]);

  // Don't show for single venue users
  if (!allVenues || allVenues.length <= 1) {
    return null;
  }

  // Save preferences
  const savePreferences = (venues) => {
    localStorage.setItem(`overview_reporting_${componentId}`, JSON.stringify({
      venues
    }));
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
    
    const isMultiSite = newSelection.length > 1;
    onSelectionChange(newSelection, isMultiSite);
    savePreferences(newSelection);
  };

  const handleSelectAll = () => {
    const allVenueIds = allVenues.map(v => v.id);
    const isMultiSite = allVenueIds.length > 1;
    onSelectionChange(allVenueIds, isMultiSite);
    savePreferences(allVenueIds);
  };

  const handleClearAll = () => {
    const currentVenueOnly = [venueId];
    onSelectionChange(currentVenueOnly, false);
    savePreferences(currentVenueOnly);
  };

  const filteredVenues = allVenues.filter(venue =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCount = selectedVenues.length;
  const totalCount = allVenues.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Venue Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors min-w-0 bg-white"
      >
        <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="truncate max-w-48">
          {selectedCount === totalCount ? 'All venues' : selectedCount === 1 ? 
            allVenues.find(v => v.id === selectedVenues[0])?.name || 'Select venues' :
            `${selectedCount} of ${totalCount} venues`}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
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