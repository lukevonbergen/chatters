// /src/components/google-reviews/ReviewStats.jsx
import React from 'react';

const ReviewStats = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      label: 'Total Reviews',
      value: stats.total,
      icon: '📊',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Needs Reply',
      value: stats.unresponded,
      icon: '💬',
      color: 'bg-orange-50 text-orange-700'
    },
    {
      label: 'Average Rating',
      value: `${stats.avgRating} ⭐`,
      icon: '⭐',
      color: 'bg-yellow-50 text-yellow-700'
    },
    {
      label: 'Responded',
      value: stats.responded,
      icon: '✅',
      color: 'bg-green-50 text-green-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-lg p-6 border border-gray-200`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-80">{stat.label}</p>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
            </div>
            <div className="text-4xl opacity-50">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewStats;
