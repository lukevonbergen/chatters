import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ModernCard = ({ 
  children, 
  className = '',
  padding = 'p-6',
  shadow = 'shadow-sm hover:shadow-md',
  border = 'border border-gray-100',
  rounded = 'rounded-xl',
  background = 'bg-white',
  transition = 'transition-all duration-200'
}) => {
  return (
    <div 
      className={`${background} ${rounded} ${padding} ${border} ${shadow} ${transition} ${className}`}
    >
      {children}
    </div>
  );
};

const MetricCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  trendDirection = 'up',
  color = 'blue',
  comparison,
  venueBreakdowns,
  allVenues,
  field,
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  const hasBreakdowns = venueBreakdowns && Object.keys(venueBreakdowns).length > 1 && field;

  return (
    <ModernCard className={`relative overflow-hidden ${className}`} padding="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trendDirection === 'up' ? 'bg-green-50 text-green-700' : 
            trendDirection === 'down' ? 'bg-red-50 text-red-700' : 
            'bg-gray-50 text-gray-700'
          }`}>
            {trendDirection === 'up' && <TrendingUp className="w-3 h-3" />}
            {trendDirection === 'down' && <TrendingDown className="w-3 h-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value || '0'}
        </div>
        {comparison && (
          <div className="text-sm text-gray-500">
            {comparison}
          </div>
        )}
      </div>

      {/* Venue Breakdowns */}
      {hasBreakdowns && (
        <div className="pt-4 border-t border-gray-100">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              By Venue
            </h4>
            {Object.entries(venueBreakdowns).map(([venueId, breakdown]) => {
              const venue = allVenues?.find(v => v.id === venueId);
              if (!venue || !breakdown) return null;
              
              let breakdownValue = breakdown[field];
              if (field === 'avgSatisfaction' && breakdownValue) {
                breakdownValue = `${breakdownValue}/5`;
              }
              
              return (
                <div key={venueId} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 truncate flex-1 mr-2">
                    {venue.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
                    {breakdownValue || '0'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <Icon className="w-full h-full" />
      </div>
    </ModernCard>
  );
};

const ChartCard = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  actions
}) => {
  return (
    <ModernCard className={className} padding="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="w-full">
        {children}
      </div>
    </ModernCard>
  );
};

const ActivityCard = ({ 
  title, 
  items = [], 
  loading = false,
  className = '',
  emptyState
}) => {
  return (
    <ModernCard className={className} padding="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {title}
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              {item}
            </div>
          ))}
        </div>
      ) : (
        emptyState || (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <p className="text-sm">No recent activity</p>
            </div>
          </div>
        )
      )}
    </ModernCard>
  );
};

const StatsGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
};

export default ModernCard;
export { MetricCard, ChartCard, ActivityCard, StatsGrid };