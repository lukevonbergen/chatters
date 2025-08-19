// EmployeesList.js - Handles displaying the list of employees

import React from 'react';
import { User, Plus } from 'lucide-react';
import EmployeeCard from './EmployeeCard';
import EmptyEmployeeState from './EmptyEmployeeState';

const EmployeesList = ({
  userRole,
  visibleEmployees,
  employeesByVenue,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee
}) => {
  if (userRole === 'master') {
    // Master view - grouped by venue
    return (
      <div className="space-y-4 lg:space-y-6 mb-6 lg:mb-8">
        {Object.values(employeesByVenue).map(({ venue, employees: venueEmployees }) => (
          <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
              <h3 className="text-base lg:text-lg font-medium text-gray-900">{venue.name}</h3>
              <span className="text-sm text-gray-500">
                {venueEmployees.length} employee{venueEmployees.length !== 1 ? 's' : ''}
              </span>
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