import React from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { Target, TrendingUp, Users, Clock } from 'lucide-react';

const ReportsImpactPage = () => {
  usePageTitle('Impact Reports');
  const { venueId } = useVenue();

  const impactMetrics = [
    {
      title: 'Customer Retention',
      value: '85%',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Response Rate',
      value: '92%',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Issue Resolution Time',
      value: '2.3 hours',
      change: '-45%',
      trend: 'down',
      icon: Clock,
      color: 'purple'
    },
    {
      title: 'Overall Satisfaction',
      value: '4.6/5',
      change: '+0.3',
      trend: 'up',
      icon: TrendingUp,
      color: 'emerald'
    }
  ];

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Impact Analysis"
        subtitle="Measure the real-world impact of your feedback initiatives"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactMetrics.map((metric, index) => {
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up' || (metric.trend === 'down' && metric.title.includes('Time'));
            
            return (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                    <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                  </div>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {metric.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
                <p className="text-gray-600 text-sm">{metric.title}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Timeline</h3>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 text-center">Impact timeline visualization coming soon</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default ReportsImpactPage;