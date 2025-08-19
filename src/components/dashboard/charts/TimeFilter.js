import React from 'react';

const TimeFilter = ({ timeFilter, setTimeFilter }) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm text-gray-500">Filter by:</span>
    <select
      value={timeFilter}
      onChange={(e) => setTimeFilter(e.target.value)}
      className="p-2 border border-gray-300 rounded-lg text-sm"
    >
      <option value="1hour">Last Hour</option>
      <option value="today">Today</option>
      <option value="7days">Last 7 Days</option>
    </select>
  </div>
);

export default TimeFilter;