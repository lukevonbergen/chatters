import React from 'react';

const slowPulseStyle = {
  animation: 'slow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite'
};

const pulseKeyframes = `
@keyframes slow-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

const TableComponent = ({ table, editMode, feedbackMap, onTableClick, onRemoveTable }) => {
  const getFeedbackStatus = (avg) => {
    if (avg === null || avg === undefined) {
      return { borderColor: 'border-gray-800', bgColor: 'bg-gray-700', status: 'no-feedback' };
    }
    if (avg > 4) {
      return { borderColor: 'border-green-500', bgColor: 'bg-gray-700', status: 'happy' };
    }
    if (avg >= 2.5) {
      return { borderColor: 'border-yellow-500', bgColor: 'bg-gray-700', status: 'attention' };
    }
    return { borderColor: 'border-red-500', bgColor: 'bg-gray-700', status: 'unhappy' };
  };

  const getTableShapeClasses = (shape, feedbackStatus) => {
    const baseClasses = `text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-200 ${feedbackStatus.bgColor} ${feedbackStatus.borderColor}`;
    const pulseStyle = feedbackStatus.status === 'unhappy' ? slowPulseStyle : {};

    switch (shape) {
      case 'circle':
        return { className: `${baseClasses} w-14 h-14 rounded-full hover:bg-gray-600`, style: pulseStyle };
      case 'long':
        return { className: `${baseClasses} w-28 h-10 rounded-lg hover:bg-gray-600 text-sm`, style: pulseStyle };
      default:
        return { className: `${baseClasses} w-14 h-14 rounded-lg hover:bg-gray-600`, style: pulseStyle };
    }
  };

  const avgRating = feedbackMap[table.table_number];
  const feedbackStatus = getFeedbackStatus(avgRating);
  const tableShapeConfig = getTableShapeClasses(table.shape, feedbackStatus);

  const handleTableClick = () => {
    if (!editMode) onTableClick(table.table_number);
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveTable(table.id);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'happy': return 'Table Happy';
      case 'attention': return 'Table Needs Attention';
      case 'unhappy': return 'Table Unhappy';
      default: return 'No Feedback Submitted';
    }
  };

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div className="relative group">
        <div
          className={`${tableShapeConfig.className} ${!editMode ? 'cursor-pointer' : ''} ${editMode ? 'hover:scale-105' : ''}`}
          style={tableShapeConfig.style}
          onClick={handleTableClick}
          title={editMode ? `Table ${table.table_number}` : `${getStatusText(feedbackStatus.status)} - ${avgRating != null ? `Rating: ${avgRating.toFixed(1)}/5` : 'No recent feedback'}`}
        >
          {table.table_number}
        </div>
        {editMode && (
          <button
            onClick={handleRemoveClick}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold shadow-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
            title="Remove table"
          >
            ×
          </button>
        )}
        {editMode && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        )}
      </div>
    </>
  );
};

export default TableComponent;
