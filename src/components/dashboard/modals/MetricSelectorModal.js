import React, { useState } from 'react';
import { X, BarChart3, ThumbsUp, Star, AlertTriangle, Award, PieChart, MessageSquare } from 'lucide-react';

const AVAILABLE_METRICS = [
  {
    value: 'total_feedback',
    label: 'Total Feedback Count',
    description: 'Number of feedback sessions today',
    icon: BarChart3
  },
  {
    value: 'resolved_feedback',
    label: 'Total Resolved Feedback',
    description: 'Feedback sessions that have been actioned',
    icon: ThumbsUp
  },
  {
    value: 'avg_satisfaction',
    label: 'Average Satisfaction Score',
    description: 'Average rating across all feedback',
    icon: Star
  },
  {
    value: 'unresolved_alerts',
    label: 'Unresolved Alerts',
    description: 'Urgent feedback & assistance requiring attention',
    icon: AlertTriangle
  },
  {
    value: 'best_staff',
    label: 'Best Staff Member',
    description: 'Staff member with most resolutions today',
    icon: Award
  },
  {
    value: 'google_rating',
    label: 'Google Rating',
    description: 'Current Google review rating',
    icon: Star
  },
  {
    value: 'tripadvisor_rating',
    label: 'TripAdvisor Rating',
    description: 'Current TripAdvisor review rating',
    icon: Star
  },
  {
    value: 'nps_chart',
    label: 'NPS Score Chart',
    description: 'Net Promoter Score with breakdown by category',
    icon: PieChart
  },
  {
    value: 'feedback_chart',
    label: 'Overall Feedback Chart',
    description: 'Feedback metrics with multi-venue support and multiple views',
    icon: MessageSquare
  }
];

const MetricSelectorModal = ({ isOpen, onClose, onSelect, currentMetric = null, existingMetrics = [] }) => {
  const [selectedMetric, setSelectedMetric] = useState(currentMetric);

  if (!isOpen) return null;

  const handleSave = () => {
    if (selectedMetric) {
      onSelect(selectedMetric);
      onClose();
    }
  };

  const isMetricDisabled = (metricValue) => {
    // Don't disable the current metric (for editing)
    if (metricValue === currentMetric) return false;
    // Disable if metric is already used in another tile
    return existingMetrics.includes(metricValue);
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
              {currentMetric ? 'Change Metric' : 'Select Metric'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Metric List */}
          <div className="space-y-2 mb-6 max-h-[500px] overflow-y-auto">
            {AVAILABLE_METRICS.map((metric) => {
              const Icon = metric.icon;
              const disabled = isMetricDisabled(metric.value);
              const isSelected = selectedMetric === metric.value;

              return (
                <button
                  key={metric.value}
                  onClick={() => !disabled && setSelectedMetric(metric.value)}
                  disabled={disabled}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : disabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSelected
                        ? 'bg-blue-100'
                        : disabled
                        ? 'bg-gray-200'
                        : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected
                          ? 'text-blue-600'
                          : disabled
                          ? 'text-gray-400'
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium ${
                          disabled ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {metric.label}
                        </h3>
                        {disabled && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                            Already added
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        disabled ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {metric.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                        <svg
                          className="w-4 h-4 text-white"
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
                </button>
              );
            })}
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
              disabled={!selectedMetric}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedMetric
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentMetric ? 'Update Metric' : 'Add Metric'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricSelectorModal;
