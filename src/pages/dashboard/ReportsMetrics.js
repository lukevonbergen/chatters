import React from 'react';
import { ChartCard } from '../../components/dashboard/layout/ModernCard';
import usePageTitle from '../../hooks/usePageTitle';
import { useVenue } from '../../context/VenueContext';
import { PieChart, BarChart3, Activity, TrendingUp } from 'lucide-react';

const ReportsMetricsPage = () => {
  usePageTitle('Metrics Dashboard');
  const { venueId } = useVenue();

  const metricCategories = [
    {
      title: 'Response Metrics',
      icon: Activity,
      color: 'blue',
      metrics: [
        { label: 'Total Responses', value: '1,234', period: 'This month' },
        { label: 'Response Rate', value: '87%', period: 'vs last month' },
        { label: 'Avg Response Time', value: '2.5 mins', period: 'Customer time' }
      ]
    },
    {
      title: 'Satisfaction Metrics',
      icon: TrendingUp,
      color: 'green',
      metrics: [
        { label: 'Overall Score', value: '4.6/5', period: 'Average rating' },
        { label: 'NPS Score', value: '+42', period: 'Net Promoter' },
        { label: 'Happy Customers', value: '92%', period: '4+ star ratings' }
      ]
    },
    {
      title: 'Engagement Metrics',
      icon: BarChart3,
      color: 'purple',
      metrics: [
        { label: 'Page Views', value: '5,678', period: 'Feedback page' },
        { label: 'Completion Rate', value: '94%', period: 'Full surveys' },
        { label: 'Return Visitors', value: '23%', period: 'Repeat feedback' }
      ]
    },
    {
      title: 'Performance Metrics',
      icon: PieChart,
      color: 'orange',
      metrics: [
        { label: 'Resolution Rate', value: '89%', period: 'Issues resolved' },
        { label: 'Avg Resolution', value: '4.2 hours', period: 'Time to resolve' },
        { label: 'Follow-up Rate', value: '76%', period: 'Customer contact' }
      ]
    }
  ];

  if (!venueId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ChartCard
        title="Metrics Dashboard"
        subtitle="Comprehensive metrics and KPIs for your feedback system"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metricCategories.map((category, index) => {
            const Icon = category.icon;
            
            return (
              <div key={index} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-${category.color}-100`}>
                    <Icon className={`w-5 h-5 text-${category.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className="text-xs text-gray-400">{metric.period}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Metrics</h3>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-600 text-center">Configure custom metrics and tracking parameters</p>
          </div>
        </div>
      </ChartCard>
    </div>
  );
};

export default ReportsMetricsPage;