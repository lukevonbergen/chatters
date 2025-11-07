import React, { useState } from 'react';
import { X, Calendar, PieChart, BarChart3, TrendingUp, Activity } from 'lucide-react';
import { useVenue } from '../../../context/VenueContext';

const DATE_RANGE_OPTIONS = [
  { value: '7_days', label: 'Last 7 Days', icon: Calendar },
  { value: 'this_month', label: 'This Month', icon: Calendar },
  { value: 'last_month', label: 'Last Month', icon: Calendar },
  { value: 'last_quarter', label: 'Last Quarter', icon: Calendar },
  { value: 'all_time', label: 'All Time', icon: Calendar }
];

const CHART_TYPE_OPTIONS = [
  { value: 'kpi', label: 'KPI Tile', description: 'Simple score display', icon: Activity },
  { value: 'bar', label: 'Bar Graph', description: 'Category breakdown bars', icon: BarChart3 },
  { value: 'line', label: 'Line Graph', description: 'Trend over time', icon: TrendingUp },
  { value: 'donut', label: 'Donut Chart', description: 'Category distribution', icon: PieChart }
];

const NPSConfigModal = ({ isOpen, onClose, onSave, currentConfig = {} }) => {
  const { venueId, allVenues } = useVenue();

  const [dateRangePreset, setDateRangePreset] = useState(currentConfig.date_range_preset || 'all_time');
  const [chartType, setChartType] = useState(currentConfig.chart_type || 'donut');
  // Single venue selection - store as array with one item for consistency
  const [selectedVenueId, setSelectedVenueId] = useState(
    (currentConfig.venue_ids && currentConfig.venue_ids.length > 0)
      ? currentConfig.venue_ids[0]
      : venueId
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      date_range_preset: dateRangePreset,
      chart_type: chartType,
      venue_ids: [selectedVenueId]  // Single item array
    });
    onClose();
  };

  const selectCurrentVenue = () => {
    if (venueId) {
      setSelectedVenueId(venueId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Configure NPS Chart
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Date Range Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-3">
              {DATE_RANGE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = dateRangePreset === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setDateRangePreset(option.value)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                    {isSelected && (
                      <div className="ml-auto flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chart Type Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Visualization Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {CHART_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = chartType === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => setChartType(option.value)}
                    className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${
                          isSelected ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {option.label}
                        </span>
                        {isSelected && (
                          <div className="flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Venue Selection Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Venue</h3>
              <button
                onClick={selectCurrentVenue}
                className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Current Venue
              </button>
            </div>
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {allVenues.map(venue => (
                <label
                  key={venue.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                >
                  <input
                    type="radio"
                    name="venue"
                    value={venue.id}
                    checked={selectedVenueId === venue.id}
                    onChange={() => setSelectedVenueId(venue.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{venue.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select a single venue for this tile
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedVenueId}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedVenueId
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPSConfigModal;
