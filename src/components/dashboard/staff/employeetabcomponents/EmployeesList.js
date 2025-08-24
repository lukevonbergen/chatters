// EmployeesList.js - Handles displaying the list of employees

import React from 'react';
import { Download, Upload } from 'lucide-react';
import EmployeeCard from './EmployeeCard';
import EmptyEmployeeState from './EmptyEmployeeState';

const EmployeesList = ({
  userRole,
  visibleEmployees,
  employeesByVenue,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onDownloadCSV,
  onUploadCSV,
  uploading
}) => {
  if (userRole === 'master') {
    // Master view - grouped by venue
    return (
      <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
        {Object.values(employeesByVenue).map(({ venue, employees: venueEmployees }) => (
          <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <h3 className="text-base lg:text-lg font-medium text-gray-900">{venue.name}</h3>
                <span className="text-sm text-gray-500">
                  {venueEmployees.length} employee{venueEmployees.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              {/* Venue-specific CSV actions */}
              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                <button
                  onClick={() => onDownloadCSV && onDownloadCSV(venue.id)}
                  className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors duration-200 flex items-center justify-center"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </button>
                
                <label className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-md hover:bg-orange-200 transition-colors duration-200 flex items-center justify-center cursor-pointer">
                  <Upload className="w-3 h-3 mr-1" />
                  {uploading ? 'Uploading...' : 'Replace'}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => onUploadCSV && onUploadCSV(e, venue.id)}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            {venueEmployees.length === 0 ? (
              <EmptyEmployeeState 
                onAddEmployee={onAddEmployee}
                message="No employees at this venue"
                buttonText="Add an employee"
              />
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {venueEmployees.map(employee => (
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
        ))}
      </div>
    );
  }

  // Manager view - single venue
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-6 lg:mb-8">
      <div className="mb-4">
        <h3 className="text-base lg:text-lg font-medium text-gray-900">Your Venue Employees</h3>
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
        <div className="space-y-2 lg:space-y-3">
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