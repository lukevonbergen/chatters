import React, { useState, useCallback } from 'react';
import { supabase } from '../../../utils/supabase';
import { Plus, X, User, Mail, Phone, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';

// Move AddEmployeeModal outside the main component to prevent re-renders
const AddEmployeeModal = ({ 
  showAddForm, 
  setShowAddForm, 
  formData, 
  formErrors, 
  submitting, 
  allVenues, 
  userRole, 
  commonRoles, 
  handleInputChange, 
  handleSubmit, 
  resetForm 
}) => {
  if (!showAddForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Add New Employee
            </h3>
            <button
              onClick={() => {
                setShowAddForm(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {formErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {formErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="employee@example.com"
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+44 7XXX XXXXXX"
              />
            </div>

            {/* Venue (for masters only) */}
            {userRole === 'master' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue *
                </label>
                <select
                  value={formData.venue_id}
                  onChange={(e) => handleInputChange('venue_id', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.venue_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a venue</option>
                  {allVenues.map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
                {formErrors.venue_id && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.venue_id}</p>
                )}
              </div>
            )}

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors.role ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a role</option>
                {commonRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="w-full sm:w-auto px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Employee
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const EmployeesTab = ({ 
  employees, 
  allVenues,
  venueId,
  userRole,
  loading,
  fetchStaffData,
  setMessage 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    venue_id: venueId || ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Common employee roles
  const commonRoles = [
    'Server',
    'Bartender',
    'Host/Hostess',
    'Cook',
    'Chef',
    'Kitchen Assistant',
    'Busser',
    'Manager',
    'Assistant Manager',
    'Cashier'
  ];

  // Reset form when venueId changes
  React.useEffect(() => {
    if (venueId) {
      setFormData(prev => ({ ...prev, venue_id: venueId }));
    }
  }, [venueId]);

  // Filter employees based on user role
  const visibleEmployees = userRole === 'master' 
    ? employees 
    : employees.filter(emp => emp.venue_id === venueId);

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.first_name.trim()) errors.first_name = 'First name is required';
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.venue_id) errors.venue_id = 'Please select a venue';
    if (!formData.role.trim()) errors.role = 'Role is required';
    
    // Check for duplicate email
    const emailExists = employees.some(emp => 
      emp.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (emailExists) {
      errors.email = 'An employee with this email already exists';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Prepare employee data
      const employeeData = {
        ...formData,
        email: formData.email.toLowerCase(),
      };

      // Remove empty strings
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] === '') {
          employeeData[key] = null;
        }
      });

      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
        .select();

      if (error) throw error;

      // Success
      setMessage('Employee added successfully!');
      setShowAddForm(false);
      resetForm();
      
      // Refresh the staff data
      if (fetchStaffData) {
        await fetchStaffData();
      }

    } catch (error) {
      console.error('Error adding employee:', error);
      if (error.code === '23505') {
        setFormErrors({ email: 'An employee with this email already exists' });
      } else {
        setMessage('Failed to add employee. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      role: '',
      venue_id: venueId || ''
    });
    setFormErrors({});
  }, [venueId]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific field error when user starts typing
    setFormErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Remove the old AddEmployeeModal function that was inside the component

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
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </button>
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
                    className="text-blue-600 hover:underline text-sm"
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
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs lg:text-sm font-medium text-blue-700">
                            {employee.first_name?.[0]}{employee.last_name?.[0]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{employee.email}</span>
                            {employee.role && (
                              <>
                                <span>•</span>
                                <span>{employee.role}</span>
                              </>
                            )}
                            {employee.phone && (
                              <>
                                <span>•</span>
                                <span>{employee.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
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
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-base lg:text-lg mb-2">No employees yet</p>
              <p className="text-sm mb-4">Add your first employee to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
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
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs lg:text-sm font-medium text-blue-700">
                        {employee.first_name?.[0]}{employee.last_name?.[0]}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{employee.email}</span>
                        {employee.role && (
                          <>
                            <span>•</span>
                            <span>{employee.role}</span>
                          </>
                        )}
                        {employee.phone && (
                          <>
                            <span>•</span>
                            <span>{employee.phone}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
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
      <div className="mt-6 lg:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-2 lg:mb-3">Employee Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-sm">
          <div className="flex justify-between sm:block">
            <span className="text-blue-700">Total Employees:</span>
            <span className="ml-2 font-semibold text-blue-900">{visibleEmployees.length}</span>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-blue-700">
              {userRole === 'master' ? 'Across Venues:' : 'At Your Venue:'}
            </span>
            <span className="ml-2 font-semibold text-blue-900">
              {userRole === 'master' ? allVenues.length : 1}
            </span>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        formData={formData}
        formErrors={formErrors}
        submitting={submitting}
        allVenues={allVenues}
        userRole={userRole}
        commonRoles={commonRoles}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        resetForm={resetForm}
      />
    </div>
  );
};

export default EmployeesTab;