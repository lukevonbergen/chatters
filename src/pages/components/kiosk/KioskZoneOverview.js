import React from 'react';

const KioskZoneOverview = ({ zones, tables, feedbackMap, feedbackList, onZoneSelect }) => {
  // Calculate stats for each zone
  const getZoneStats = (zoneId) => {
    const zoneTables = tables.filter(t => t.zone_id === zoneId);
    const zoneAlerts = feedbackList.filter(f => 
      zoneTables.some(t => t.table_number === f.table_number)
    );
    
    const urgentAlerts = zoneAlerts.filter(f => f.rating <= 2).length;
    const totalAlerts = zoneAlerts.length;
    
    return {
      tableCount: zoneTables.length,
      totalAlerts,
      urgentAlerts,
      tables: zoneTables
    };
  };

  const getFeedbackColor = (avg) => {
    if (avg === null || avg === undefined) return 'bg-blue-500';
    if (avg > 4) return 'bg-green-500';
    if (avg >= 2.5) return 'bg-amber-400';
    return 'bg-red-600';
  };

  const renderMiniTable = (table) => {
    const avgRating = feedbackMap[table.table_number];
    const feedbackColor = getFeedbackColor(avgRating);
    
    return (
      <div key={table.id} className="relative">
        <div className="w-8 h-8 bg-gray-600 rounded text-white text-xs flex items-center justify-center font-bold">
          {table.table_number}
        </div>
        <div
          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${feedbackColor} ${
            feedbackColor === 'bg-red-600' ? 'animate-pulse' : ''
          }`}
        />
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Floor Plan Overview</h2>
        <p className="text-gray-600">Click on a zone to view detailed layout and manage alerts</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
          {zones.map(zone => {
            const stats = getZoneStats(zone.id);
            
            return (
              <div
                key={zone.id}
                onClick={() => onZoneSelect(zone.id)}
                className={`relative bg-white rounded-xl border-2 p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  stats.urgentAlerts > 0 
                    ? 'border-red-300 bg-red-50 hover:border-red-400' 
                    : stats.totalAlerts > 0
                    ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {/* Alert badge */}
                {stats.urgentAlerts > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                    {stats.urgentAlerts} URGENT
                  </div>
                )}
                {stats.totalAlerts > 0 && stats.urgentAlerts === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {stats.totalAlerts} ALERT{stats.totalAlerts > 1 ? 'S' : ''}
                  </div>
                )}

                {/* Zone header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{zone.name}</h3>
                  <p className="text-sm text-gray-600">
                    {stats.tableCount} table{stats.tableCount !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Mini floor plan */}
                <div className="mb-4 bg-gray-50 rounded-lg p-4 min-h-[120px] relative">
                  {stats.tables.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      No tables
                    </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {stats.tables.slice(0, 18).map(table => renderMiniTable(table))}
                      {stats.tables.length > 18 && (
                        <div className="w-8 h-8 bg-gray-300 rounded text-gray-600 text-xs flex items-center justify-center">
                          +{stats.tables.length - 18}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Status summary */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      stats.urgentAlerts > 0 ? 'text-red-600' :
                      stats.totalAlerts > 0 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {stats.urgentAlerts > 0 ? 'Needs Attention' :
                       stats.totalAlerts > 0 ? 'Active Alerts' : 'All Good'}
                    </span>
                  </div>
                  
                  {stats.totalAlerts > 0 && (
                    <div className="text-xs text-gray-500">
                      Click to view and resolve alerts
                    </div>
                  )}
                </div>

                {/* Click indicator */}
                <div className="absolute bottom-4 right-4 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KioskZoneOverview;