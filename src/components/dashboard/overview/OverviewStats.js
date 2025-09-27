import React from 'react';
import { TrendingUp, Users, Star, Clock, AlertTriangle, CheckCircle, Activity, Target } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendDirection, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {subtitle && (
              <div className="text-sm text-gray-500">{subtitle}</div>
            )}
          </div>
        </div>

        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendColors[trendDirection]}`}>
            <TrendingUp className={`w-4 h-4 ${trendDirection === 'down' ? 'rotate-180' : ''}`} />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const OverviewStats = ({ stats, loading }) => {
  if (loading) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Today's Sessions */}
      <StatCard
        icon={Users}
        title="Today's Sessions"
        value={stats?.todaySessions || '0'}
        subtitle="Customer interactions"
        trend={stats?.sessionsTrend}
        trendDirection={stats?.sessionsTrendDirection}
        color="blue"
      />

      {/* Average Satisfaction */}
      <StatCard
        icon={Star}
        title="Satisfaction Score"
        value={stats?.avgSatisfaction ? `${stats.avgSatisfaction}/5` : '--'}
        subtitle="Today's average"
        trend={stats?.satisfactionTrend}
        trendDirection={stats?.satisfactionTrendDirection}
        color="amber"
      />

      {/* Response Time */}
      <StatCard
        icon={Clock}
        title="Avg Response Time"
        value={stats?.avgResponseTime || '--'}
        subtitle="To assistance requests"
        trend={stats?.responseTimeTrend}
        trendDirection={stats?.responseTimeTrendDirection}
        color="green"
      />

      {/* Completion Rate */}
      <StatCard
        icon={Target}
        title="Completion Rate"
        value={stats?.completionRate ? `${stats.completionRate}%` : '--'}
        subtitle="Issues resolved"
        trend={stats?.completionTrend}
        trendDirection={stats?.completionTrendDirection}
        color="purple"
      />

      {/* Active Alerts */}
      <StatCard
        icon={AlertTriangle}
        title="Active Alerts"
        value={stats?.activeAlerts || '0'}
        subtitle="Requiring attention"
        color={stats?.activeAlerts > 0 ? 'red' : 'green'}
      />

      {/* Resolved Today */}
      <StatCard
        icon={CheckCircle}
        title="Resolved Today"
        value={stats?.resolvedToday || '0'}
        subtitle="Issues closed"
        color="green"
      />

      {/* Current Activity */}
      <StatCard
        icon={Activity}
        title="Current Activity"
        value={stats?.currentActivity || 'Low'}
        subtitle="Venue traffic level"
        color="indigo"
      />

      {/* Peak Hour */}
      <StatCard
        icon={TrendingUp}
        title="Today's Peak"
        value={stats?.peakHour || '--'}
        subtitle="Busiest time"
        color="purple"
      />
    </div>
  );
};

export default OverviewStats;