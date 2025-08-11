import React, { forwardRef } from 'react';

const KioskFloorPlan = forwardRef(({ 
  tables, 
  selectedZoneId, 
  feedbackMap, 
  selectedFeedback,
  onTableClick 
}, ref) => {
  
  const filteredTables = tables.filter(t => t.zone_id === selectedZoneId);
  
  // Debug logging
  console.log('KioskFloorPlan Debug:', {
    totalTables: tables.length,
    filteredTables: filteredTables.length,
    selectedZoneId,
    firstTable: filteredTables[0],
    allZoneIds: [...new Set(tables.map(t => t.zone_id))]
  });

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  const getTableShapeClasses = (shape, isSelected, hasAlert) => {
    const baseClasses = 'text-white flex items-center justify-center font-bold border-4 shadow-lg transition-all duration-300 cursor-pointer';
    
    // Selection and alert styling
    const selectionClass = isSelected ? 'border-blue-500 scale-110 shadow-xl' : 'border-gray-800';
    const alertClass = hasAlert ? 'animate-pulse' : '';
    
    switch (shape) {
      case 'circle':
        return `${baseClasses} w-16 h-16 rounded-full bg-gray-700 hover:bg-gray-600 hover:scale-105 ${selectionClass} ${alertClass}`;
      case 'long':
        return `${baseClasses} w-32 h-12 rounded-lg bg-gray-700 hover:bg-gray-600 hover:scale-105 text-sm ${selectionClass} ${alertClass}`;
      default: // square
        return `${baseClasses} w-16 h-16 rounded-lg bg-gray-700 hover:bg-gray-600 hover:scale-105 ${selectionClass} ${alertClass}`;
    }
  };

  const isTableSelected = (tableNumber) => {
    return selectedFeedback?.table_number === tableNumber;
  };

  const hasTableAlert = (tableNumber) => {
    const rating = feedbackMap[tableNumber];
    return rating !== null && rating !== undefined && rating <= 3;
  };

  return (
    <div className="h-full">
      {/* Zone header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Zone Details
        </h2>
        <p className="text-gray-600">
          Click on a table to view its feedback details
        </p>
      </div>

      {/* Floor plan canvas */}
      <div 
        ref={ref} 
        className="relative w-full h-[calc(100vh-250px)] bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden shadow-inner"
      >
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              radial-gradient(circle, #94a3b8 2px, transparent 2px)
            `,
            backgroundSize: '30px 30px',
          }}
        />
        
        {/* Empty state */}
        {filteredTables.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-lg font-medium">No tables in this zone</p>
              <p className="text-sm text-gray-400">
                Contact your administrator to add tables to this zone
              </p>
            </div>
          </div>
        )}

        {/* Tables */}
        {filteredTables.map((table) => {
          const avgRating = feedbackMap[table.table_number];
          const feedbackColor = getFeedbackColor(avgRating);
          const isSelected = isTableSelected(table.table_number);
          const hasAlert = hasTableAlert(table.table_number);
          const tableShapeClasses = getTableShapeClasses(table.shape, isSelected, hasAlert);

          return (
            <div 
              key={table.id} 
              className="absolute group" 
              style={{ left: table.x_px, top: table.y_px }}
            >
              <div className="relative">
                <div
                  className={tableShapeClasses}
                  onClick={() => onTableClick(table.table_number)}
                  title={`Table ${table.table_number} - Click to view feedback`}
                >
                  {table.table_number}
                </div>
                
                {/* Feedback indicator - larger for kiosk */}
                <div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white ${feedbackColor} ${
                    feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''
                  } shadow-lg flex items-center justify-center`}
                  title={avgRating == null || avgRating === undefined ? 'No recent feedback' : `Average rating: ${avgRating.toFixed(1)}/5`}
                >
                  {/* Show rating number for urgent cases */}
                  {avgRating !== null && avgRating <= 2 && (
                    <span className="text-white text-xs font-bold">
                      {Math.round(avgRating)}
                    </span>
                  )}
                </div>

                {/* Selection highlight */}
                {isSelected && (
                  <div className="absolute -inset-4 border-4 border-blue-400 rounded-lg opacity-50 pointer-events-none animate-pulse" />
                )}

                {/* Hover tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Table {table.table_number}
                  {avgRating !== null && avgRating !== undefined && (
                    <span> - Rating: {avgRating.toFixed(1)}/5</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 border">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Status Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <span>Needs urgent attention (≤2★)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-400 rounded-full"></div>
              <span>Attention needed (2.5-3★)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Satisfied (4-5★)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>No recent feedback</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Click on any table to view detailed feedback. 
            Pulsing red indicators show urgent issues requiring immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
});

KioskFloorPlan.displayName = 'KioskFloorPlan';

export default KioskFloorPlan;