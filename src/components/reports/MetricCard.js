import React from 'react';

const MetricCard = ({ title, value, icon: Icon, description, variant = 'default' }) => {
  const variantStyles = {
    default: 'border-gray-200',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50'
  };

  const iconStyles = {
    default: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600'
  };

  return (
    <div className={`bg-white border rounded-lg p-4 lg:p-6 ${variantStyles[variant]}`}>
      <div className="flex items-start space-x-3 lg:space-x-4">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 lg:w-6 lg:h-6 ${iconStyles[variant]}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;