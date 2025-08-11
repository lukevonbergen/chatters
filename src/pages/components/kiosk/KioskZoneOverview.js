import React from 'react';

const KioskZoneOverview = ({ zones, tables, feedbackMap, feedbackList, onZoneSelect }) => {
  // Debug logging
  console.log('KioskZoneOverview Debug:', {
    zones: zones.length,
    tables: tables.length,
    feedbackList: feedbackList.length,
    firstZone: zones[0],
    firstTable: tables[0],
    zoneIds: zones.map(z => z.id),
    tableZoneIds: [...new Set(tables.map(t => t.zone_id))]
  });

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  const getTableShapeClasses = (shape, avgRating) => {
    const feedbackColor = getFeedbackColor(avgRating);
    const baseClasses = 'text-white flex items-center justify-center font-bold border-2 border-gray-800 shadow-lg transition-all duration-200 cursor-pointer hover:scale-105';
    
    switch (shape) {
      case 'circle':
        return `${baseClasses} w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600`;
      case 'long':
        return `${baseClasses} w-20 h-8 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm`;
      default: // square
        return `${baseClasses} w-12 h-12 rounded-lg bg-gray-700 hover:bg-gray-600`;
    }
  };

  const renderTable = (table) => {
    const avgRating = feedbackMap[table.table_number];
    const feedbackColor = getFeedbackColor(avgRating);
    const tableShapeClasses = getTableShapeClasses(table.shape, avgRating);
    
    return (
      <div 
        key={table.id} 
        className="relative"
        onClick={() => onZoneSelect(table.zone_id)}
        title={`Table ${table.table_number} - Click to view zone`}
      >
        <div className={tableShapeClasses}>
          {table.table_number}
        </div>
        <div
          className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${feedbackColor} ${
            feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''
          } shadow-sm`}
        />
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Zones Overview</h2>
        <p className="text-gray-600">Complete view of all tables across zones - click any table to focus on its zone</p>
      </div>

      {zones.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No zones configured</p>
          <p className="text-gray-400 text-sm">Contact your administrator to set up floor plan zones</p>
        </div>
      ) : (
        <div className="space-y-8">
          {zones.map(zone => {
            const zoneTables = tables.filter(t => t.zone_id === zone.id);
            const zoneAlerts = feedbackList.filter(f => 
              zoneTables.some(t => t.table_number === f.table_number)
            );
            const urgentAlerts = zoneAlerts.filter(f => f.rating <= 2).length;
            const totalAlerts = zoneAlerts.length;

            return (
              <div key={zone.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                {/* Zone Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{zone.name}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {zoneTables.length} table{zoneTables.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Alert indicators */}
                  <div className="flex items-center gap-2">
                    {urgentAlerts > 0 && (
                      <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                        {urgentAlerts} URGENT
                      </span>
                    )}
                    {totalAlerts > 0 && urgentAlerts === 0 && (
                      <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {totalAlerts} ALERT{totalAlerts > 1 ? 'S' : ''}
                      </span>
                    )}
                    {totalAlerts === 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ALL GOOD
                      </span>
                    )}
                  </div>
                </div>

                {/* Tables Grid */}
                {zoneTables.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No tables in this zone</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-4">
                    {zoneTables.map(table => renderTable(table))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 border">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Status Legend</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
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
    </div>
  );
};

export default KioskZoneOverview;