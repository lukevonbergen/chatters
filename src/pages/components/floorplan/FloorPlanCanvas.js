import React, { forwardRef } from 'react';
import Draggable from 'react-draggable';
import TableComponent from './TableComponent';

const GRID_SIZE = 20;

const FloorPlanCanvas = forwardRef(({ 
  tables, 
  selectedZoneId, 
  editMode, 
  feedbackMap, 
  onTableDrag, 
  onTableClick, 
  onRemoveTable 
}, ref) => {
  
  const filteredTables = tables.filter(t => t.zone_id === selectedZoneId);

  return (
    <div 
      ref={ref} 
      className="relative w-full h-[600px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden"
    >
      {/* Grid pattern for better visual alignment */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        }}
      />
      
      {/* Empty state */}
      {filteredTables.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p className="text-sm font-medium">No tables in this zone</p>
            <p className="text-xs text-gray-400">
              {editMode ? 'Add a table to get started' : 'Switch to edit mode to add tables'}
            </p>
          </div>
        </div>
      )}

      {/* Tables */}
      {filteredTables.map((table) => {
        const tableComponent = (
          <TableComponent
            key={table.id}
            table={table}
            editMode={editMode}
            feedbackMap={feedbackMap}
            onTableClick={onTableClick}
            onRemoveTable={onRemoveTable}
          />
        );

        return editMode ? (
          <Draggable
            key={table.id}
            position={{ x: table.x_px, y: table.y_px }}
            bounds="parent"
            grid={[GRID_SIZE, GRID_SIZE]}
            onStop={(e, data) => {
              onTableDrag(table.id, data.x, data.y);
            }}
          >
            <div className="absolute cursor-move">
              {tableComponent}
            </div>
          </Draggable>
        ) : (
          <div 
            key={table.id} 
            className="absolute" 
            style={{ left: table.x_px, top: table.y_px }}
          >
            {tableComponent}
          </div>
        );
      })}
    </div>
  );
});

FloorPlanCanvas.displayName = 'FloorPlanCanvas';

export default FloorPlanCanvas;