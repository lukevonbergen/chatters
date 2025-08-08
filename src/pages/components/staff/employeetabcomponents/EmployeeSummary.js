// AddEmployeeModal.js - Modal for adding new employees

import React, { useState, useCallback } from 'react';
import { supabase } from '../../../../utils/supabase';
import { Plus, X, AlertCircle, CheckCircle } from 'lucide-react';

const AddEmployeeModal = ({
  showAddForm,
  setShowAddForm,
  allVenues,
  venueId,
  userRole,
  employees,
  fetchStaffData,
  setMessage
}) => {
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

export default AddEmployeeModal;