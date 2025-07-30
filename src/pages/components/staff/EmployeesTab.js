import React, { useState } from 'react';

const EmployeesTab = ({ 
  employees, 
  allVenues,
  venueId,
  userRole,
  loading 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter employees based on user role
  const visibleEmployees = userRole === 'master' 
    ? employees // Masters see all employees
    : employees.filter(emp => emp.venue_id === venueId); // Managers see only their venue's employees

  // Group employees by venue (for masters)
  const employeesByVenue = {};
  if (userRole === 'master') {
    allVenues.forEach(venue => {
      employeesByVenue[venue.id] = {
        venue: venue,
        employees: employees.filter(employee => 
          employee.venue_id === venue.id
        )
      };
    });
  }

  return (
    <div className="max-w-none lg:max-w-6xl">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Employees</h2>
            <p className="text-gray-600 text-sm">
              {userRole === 'master' 
                ? 'View and manage employees across all venues.' 
                : 'View and manage employees at your venue.'}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-2 sm:space-y-0">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 text-lg lg:text-xl">🚧</span>
          </div>
          <div className="sm:ml-3 flex-1">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">
              Employee Management Coming Soon
            </h3>
            <div className="text-sm text-yellow-700">
              <p>
                Employee management features are currently in development. 
                You'll soon be able to add, manage, and assign employees to your venues.
              </p>
            </div>
          </div>
        </div>
      </div>

      {userRole === 'master' ? (
        /* Master view - grouped by venue */
        <div className="space-y-4 lg:space-y-6">
          {Object.values(employeesByVenue).map(({ venue, employees: venueEmployees }) => (
            <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <h3 className="text-base lg:text-lg font-medium text-gray-900">{venue.name}</h3>
                <span className="text-sm text-gray-500">
                  {venueEmployees.length} employee{venueEmployees.length !== 1 ? 's' : ''}
                </span>
              </div>

              {venueEmployees.length === 0 ? (
                <div className="text-center py-6 lg:py-8 text-gray-500">
                  <p className="mb-2">No employees at this venue</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="text-black hover:underline text-sm"
                  >
                    Add an employee
                  </button>
                </div>
              ) : (
                <div className="space-y-2 lg:space-y-3">
                  {venueEmployees.map(employee => (
                    <div 
                      key={employee.id} 
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gray-50 rounded-md space-y-3 sm:space-y-0"
                    >
                      <div className="flex items-center space-x-3 lg:space-x-4">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs lg:text-sm font-medium text-gray-700">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Employee
                        </span>
                        <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Manager view - single venue */
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
          <div className="mb-4">
            <h3 className="text-base lg:text-lg font-medium text-gray-900">Your Venue Employees</h3>
          </div>

          {visibleEmployees.length === 0 ? (
            <div className="text-center py-8 lg:py-12 text-gray-500">
              <p className="text-base lg:text-lg mb-2">No employees yet</p>
              <p className="text-sm mb-4">Add your first employee to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
              >
                Add Employee
              </button>
            </div>
          ) : (
            <div className="space-y-2 lg:space-y-3">
              {visibleEmployees.map(employee => (
                <div 
                  key={employee.id} 
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gray-50 rounded-md space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 lg:space-x-4">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs lg:text-sm font-medium text-gray-700">
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{employee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Employee
                    </span>
                    <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary card */}
      <div className="mt-6 lg:mt-8 bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-green-900 mb-2 lg:mb-3">Employee Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-sm">
          <div className="flex justify-between sm:block">
            <span className="text-green-700">Total Employees:</span>
            <span className="ml-2 font-medium">{visibleEmployees.length}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-green-700">
              {userRole === 'master' ? 'Across Venues:' : 'At Your Venue:'}
            </span>
            <span className="ml-2 font-medium">
              {userRole === 'master' ? allVenues.length : 1}
            </span>
          </div>
        </div>
      </div>

      {/* Add Employee Form Modal - Placeholder */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Employee management functionality will be implemented in a future update.
            </p>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesTab;