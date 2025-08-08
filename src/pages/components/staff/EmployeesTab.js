// EmployeesTab.js - Main component that orchestrates all the smaller components

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import EmployeesList from './employeetabcomponents/EmployeesList';
import AddEmployeeModal from './employeetabcomponents/AddEmployeeModal';
import EmployeeSummary from './employeetabcomponents/EmployeeSummary';
import EditEmployeeModal from './employeetabcomponents/EditEmployeeModal';

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
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

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

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEditForm(true);
  };

  // Handle delete employee
  const handleDeleteEmployee = async (employeeId, employeeName) => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      setMessage('Employee deleted successfully!');
      
      // Refresh the staff data
      if (fetchStaffData) {
        await fetchStaffData();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setMessage('Failed to delete employee. Please try again.');
    }
  };

  return (
    <div className="max-w-none lg:max-w-6xl">
      {/* Header */}
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

      {/* Employees List */}
      <EmployeesList
        userRole={userRole}
        visibleEmployees={visibleEmployees}
        employeesByVenue={employeesByVenue}
        onAddEmployee={() => setShowAddForm(true)}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
      />

      {/* Summary */}
      <EmployeeSummary
        visibleEmployees={visibleEmployees}
        userRole={userRole}
        allVenues={allVenues}
      />

      {/* Add Employee Modal */}
      <AddEmployeeModal
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        allVenues={allVenues}
        venueId={venueId}
        userRole={userRole}
        employees={employees}
        fetchStaffData={fetchStaffData}
        setMessage={setMessage}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        showEditForm={showEditForm}
        setShowEditForm={setShowEditForm}
        editingEmployee={editingEmployee}
        setEditingEmployee={setEditingEmployee}
        allVenues={allVenues}
        userRole={userRole}
        employees={employees}
        fetchStaffData={fetchStaffData}
        setMessage={setMessage}
      />
    </div>
  );
};

export default EmployeesTab;