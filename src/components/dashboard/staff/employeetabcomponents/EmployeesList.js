// EmployeesList.js - Handles displaying the list of employees

import React from 'react';
import { Download, Upload, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import EmployeeCard from './EmployeeCard';
import EmptyEmployeeState from './EmptyEmployeeState';

const EmployeesList = ({
  userRole,
  visibleEmployees,
  masterData,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onDownloadCSV,
  onUploadCSV,
  uploading,
  onVenuePageChange
}) => {
  // Pagination component for venue
  const VenuePagination = ({ venueData, venueId }) => {
    if (venueData.totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onVenuePageChange(venueId, Math.max(1, venueData.currentPage - 1))}
            disabled={venueData.currentPage === 1}
            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: venueData.totalPages }, (_, i) => i + 1).map(pageNum => {
              const showPage = pageNum === 1 || 
                              pageNum === venueData.totalPages || 
                              Math.abs(pageNum - venueData.currentPage) <= 1;
              
              if (!showPage) {
                if (pageNum === 2 && venueData.currentPage > 4) {
                  return <span key={pageNum} className="px-1 text-gray-400 text-xs">...</span>;
                }
                if (pageNum === venueData.totalPages - 1 && venueData.currentPage < venueData.totalPages - 3) {
                  return <span key={pageNum} className="px-1 text-gray-400 text-xs">...</span>;
                }
                return null;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onVenuePageChange(venueId, pageNum)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    venueData.currentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onVenuePageChange(venueId, Math.min(venueData.totalPages, venueData.currentPage + 1))}
            disabled={venueData.currentPage === venueData.totalPages}
            className="p-1 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="text-xs text-gray-600">
          Page {venueData.currentPage} of {venueData.totalPages}
        </div>
      </div>
    );
  };

  if (userRole === 'master') {
    // Master view - grouped by venue with per-venue pagination
    return (
      <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
        {Object.values(masterData).map((venueData) => (
          <div key={venueData.venue.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <h3 className="text-base lg:text-lg font-medium text-gray-900">{venueData.venue.name}</h3>
                <span className="text-sm text-gray-500">
                  {venueData.filtered.length > 0 
                    ? `Showing ${venueData.startItem}-${venueData.endItem} of ${venueData.filtered.length} employee${venueData.filtered.length !== 1 ? 's' : ''}`
                    : `${venueData.employees.length} employee${venueData.employees.length !== 1 ? 's' : ''}`
                  }
                </span>
              </div>
              
              {/* Venue-specific actions */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => onAddEmployee && onAddEmployee()}
                  className="text-sm sm:text-xs bg-blue-100 text-blue-700 px-4 py-2 sm:px-3 sm:py-1 rounded-md hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center font-medium"
                >
                  <Plus className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
                  Add Employee
                </button>
                
                <button
                  onClick={() => onDownloadCSV && onDownloadCSV(venueData.venue.id)}
                  className="text-sm sm:text-xs bg-green-100 text-green-700 px-4 py-2 sm:px-3 sm:py-1 rounded-md hover:bg-green-200 transition-colors duration-200 flex items-center justify-center font-medium"
                >
                  <Download className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
                  Download
                </button>
                
                <label className="text-sm sm:text-xs bg-orange-100 text-orange-700 px-4 py-2 sm:px-3 sm:py-1 rounded-md hover:bg-orange-200 transition-colors duration-200 flex items-center justify-center cursor-pointer font-medium">
                  <Upload className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
                  {uploading ? 'Uploading...' : 'Replace'}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => onUploadCSV && onUploadCSV(e, venueData.venue.id)}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {venueData.paginated.length === 0 ? (
              <EmptyEmployeeState 
                onAddEmployee={onAddEmployee}
                message={venueData.filtered.length === 0 && venueData.employees.length === 0 
                  ? "No employees at this venue" 
                  : "No employees match your search"}
                buttonText="Add an employee"
              />
            ) : (
              <>
                <div className="space-y-1">
                  {venueData.paginated.map(employee => (
                    <EmployeeCard 
                      key={employee.id} 
                      employee={employee}
                      onEdit={onEditEmployee}
                      onDelete={onDeleteEmployee}
                    />
                  ))}
                </div>
                
                {/* Per-venue pagination */}
                <VenuePagination venueData={venueData} venueId={venueData.venue.id} />
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Manager view - single venue
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-base lg:text-lg font-medium text-gray-900">Your Venue Employees</h3>
        
        {/* Manager-specific actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => onAddEmployee && onAddEmployee()}
            className="text-sm sm:text-xs bg-blue-100 text-blue-700 px-4 py-2 sm:px-3 sm:py-1 rounded-md hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center font-medium"
          >
            <Plus className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Add Employee
          </button>
          
          <button
            onClick={() => onDownloadCSV && onDownloadCSV()}
            className="text-sm sm:text-xs bg-green-100 text-green-700 px-4 py-2 sm:px-3 sm:py-1 rounded-md hover:bg-green-200 transition-colors duration-200 flex items-center justify-center font-medium"
          >
            <Download className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            Download
          </button>
          
          <label className="text-sm sm:text-xs bg-orange-100 text-orange-700 px-4 py-2 sm:px-3 sm:py-1 rounded-md hover:bg-orange-200 transition-colors duration-200 flex items-center justify-center cursor-pointer font-medium">
            <Upload className="w-4 h-4 sm:w-3 sm:h-3 mr-2 sm:mr-1" />
            {uploading ? 'Uploading...' : 'Replace'}
            <input
              type="file"
              accept=".csv"
              onChange={(e) => onUploadCSV && onUploadCSV(e)}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {visibleEmployees.length === 0 ? (
        <EmptyEmployeeState 
          onAddEmployee={onAddEmployee}
          message="No employees yet"
          description="Add your first employee to get started"
          buttonText="Add Employee"
          showLargeButton={true}
        />
      ) : (
        <div className="space-y-1">
          {visibleEmployees.map(employee => (
            <EmployeeCard 
              key={employee.id} 
              employee={employee}
              onEdit={onEditEmployee}
              onDelete={onDeleteEmployee}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesList;