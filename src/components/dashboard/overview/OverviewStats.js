import React, { useState, useRef, useEffect } from 'react';
import { TrendingUp, Users, Star, Clock, AlertTriangle, CheckCircle, Activity, Target, Building2, ChevronDown, Check } from 'lucide-react';
import useOverviewStats from '../../../hooks/useOverviewStats';
import useMultiVenueStats from '../../../hooks/useMultiVenueStats';
import { useVenue } from '../../../context/VenueContext';
import { MetricCard, StatsGrid, ChartCard } from '../layout/ModernCard';
import GoogleRatingKPITile from '../reports/GoogleRatingKPITile';
import TripAdvisorRatingKPITile from '../reports/TripAdvisorRatingKPITile';

// StatCard component removed - using MetricCard from ModernCard instead

const OverviewStats = () => {
  const { venueId, allVenues, setCurrentVenue } = useVenue();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVenueIds, setSelectedVenueIds] = useState([]);
  const dropdownRef = useRef(null);
  
  // Use multi-venue stats when multiple venues selected, single stats otherwise
  const isMultiMode = selectedVenueIds.length > 1;
  const { stats: multiStats, loading: multiLoading, venueBreakdowns } = useMultiVenueStats(
    selectedVenueIds,
    isMultiMode
  );
  
  const { stats: singleStats, loading: singleLoading } = useOverviewStats(
    selectedVenueIds.length === 1 ? selectedVenueIds[0] : venueId
  );
  
  const stats = isMultiMode ? multiStats : singleStats;
  const loading = isMultiMode ? multiLoading : singleLoading;
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Initialize with current venue
  useEffect(() => {
    if (venueId && !selectedVenueIds.includes(venueId)) {
      setSelectedVenueIds([venueId]);
    }
  }, [venueId, selectedVenueIds]);

  // Track initial load completion
  useEffect(() => {
    if (!loading && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [loading, isInitialLoad]);

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

  const handleVenueToggle = (venueIdToToggle) => {
    if (selectedVenueIds.includes(venueIdToToggle)) {
      // Remove from selection
      const newSelection = selectedVenueIds.filter(id => id !== venueIdToToggle);
      // Ensure at least one venue is selected
      if (newSelection.length === 0) {
        setSelectedVenueIds([venueId]);
      } else {
        setSelectedVenueIds(newSelection);
        // If only one venue left, update the global context
        if (newSelection.length === 1) {
          setCurrentVenue(newSelection[0]);
        }
      }
    } else {
      // Add to selection
      setSelectedVenueIds([...selectedVenueIds, venueIdToToggle]);
    }
  };

  const handleSelectAll = () => {
    setSelectedVenueIds(allVenues.map(v => v.id));
  };

  const handleClearAll = () => {
    setSelectedVenueIds([venueId]);
    setCurrentVenue(venueId);
  };

  const getDisplayText = () => {
    const count = selectedVenueIds.length;
    const total = allVenues?.length || 0;
    
    if (count === 1) {
      const selectedVenue = allVenues?.find(v => v.id === selectedVenueIds[0]);
      return selectedVenue?.name || 'Select Venue';
    }
    
    return count === total ? 'All venues' : `${count} venues`;
  };

  // Only show full loading state on initial load
  if (loading && isInitialLoad) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }


  return (
    <div>
      {/* Header with Venue Selector */}
      <ChartCard
        title="Today's Overview"
        className="mb-8"
        actions={
          allVenues && allVenues.length > 1 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors min-w-0 bg-white"
              >
                <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="truncate max-w-48">{getDisplayText()}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                  {/* Controls */}
                  <div className="p-4 border-b border-gray-100 flex justify-between">
                    <button
                      onClick={handleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-gray-600 hover:text-gray-700 font-semibold transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto p-2">
                    {allVenues.map((venue) => {
                      const isSelected = selectedVenueIds.includes(venue.id);

                      return (
                        <div
                          key={venue.id}
                          onClick={() => handleVenueToggle(venue.id)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // Handled by parent div onClick
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate flex-1 font-medium">{venue.name}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Today's Sessions */}
          <MetricCard
            icon={Users}
            title="Today's Sessions"
            value={stats?.todaySessions || '0'}
            subtitle="Customer interactions"
            color="blue"
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            field="sessions"
          />

          {/* Average Satisfaction */}
          <MetricCard
            icon={Star}
            title="Satisfaction Score"
            value={stats?.avgSatisfaction ? `${stats.avgSatisfaction}/5` : '--'}
            subtitle="Today's average"
            color="amber"
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            field="avgSatisfaction"
          />

          {/* Response Time */}
          <MetricCard
            icon={Clock}
            title="Avg Response Time"
            value={stats?.avgResponseTime || '--'}
            subtitle="To all feedback"
            color="green"
          />

          {/* Completion Rate */}
          <MetricCard
            icon={Target}
            title="Completion Rate"
            value={stats?.completionRate ? `${stats.completionRate}%` : '--'}
            subtitle="Issues resolved"
            color="purple"
          />

          {/* Active Alerts */}
          <MetricCard
            icon={AlertTriangle}
            title="Active Alerts"
            value={stats?.activeAlerts || '0'}
            subtitle="Requiring attention"
            color={stats?.activeAlerts > 0 ? 'red' : 'green'}
            venueBreakdowns={venueBreakdowns}
            allVenues={allVenues}
            field="activeAlerts"
          />

          {/* Resolved Today */}
          <MetricCard
            icon={CheckCircle}
            title="Resolved Today"
            value={stats?.resolvedToday || '0'}
            subtitle="Issues closed"
            color="green"
          />

          {/* Current Activity */}
          <MetricCard
            icon={Activity}
            title="Current Activity"
            value={stats?.currentActivity || 'Low'}
            subtitle="Traffic level"
            color="indigo"
          />

          {/* Peak Hour */}
          <MetricCard
            icon={TrendingUp}
            title="Today's Peak"
            value={stats?.peakHour || '--'}
            subtitle="Busiest time"
            color="purple"
          />

          {/* Google Rating */}
          <GoogleRatingKPITile venueId={selectedVenueIds.length === 1 ? selectedVenueIds[0] : null} />

          {/* TripAdvisor Rating */}
          <TripAdvisorRatingKPITile venueId={selectedVenueIds.length === 1 ? selectedVenueIds[0] : null} />
        </div>
      </ChartCard>
    </div>
  );
};

export default OverviewStats;