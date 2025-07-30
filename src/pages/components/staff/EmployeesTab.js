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
    <div className="max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Employees</h2>
            <p className="text-gray-600 text-sm">
              {userRole === 'master' 
                ? 'View and manage employees across all venues.' 
                : 'View and manage employees at your venue.'}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 text-lg">🚧</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Employee Management Coming Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
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
        <div className="space-y-6">
          {Object.values(employeesByVenue).map(({ venue, employees: venueEmployees }) => (
            <div key={venue.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{venue.name}</h3>
                <span className="text-sm text-gray-500">
                  {venueEmployees.length} employee{venueEmployees.length !== 1 ? 's' : ''}
                </span>
              </div>

              {venueEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No employees at this venue</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-2 text-black hover:underline text-sm"
                  >
                    Add an employee
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {venueEmployees.map(employee => (
                    <div 
                      key={employee.id} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{employee.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Employee
                        </span>
                        <button className="text-sm text-gray-600 hover:text-gray-900">
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Your Venue Employees</h3>
          </div>

          {visibleEmployees.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">No employees yet</p>
              <p className="text-sm mb-4">Add your first employee to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
              >
                Add Employee
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleEmployees.map(employee => (
                <div 
                  key={employee.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{employee.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Employee
                    </span>
                    <button className="text-sm text-gray-600 hover:text-gray-900">
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
      <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-900 mb-2">Employee Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-green-700">Total Employees:</span>
            <span className="ml-2 font-medium">{visibleEmployees.length}</span>
          </div>
          <div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Employee</h3>
            <p className="text-gray-600 mb-4">Employee management functionality will be implemented in a future update.</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
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