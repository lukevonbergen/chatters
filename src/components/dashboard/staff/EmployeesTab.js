// EmployeesTab.js - Main component that orchestrates all the smaller components

import React, { useState } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { downloadEmployeesCSV, parseEmployeesCSV } from '../../../utils/csvUtils';
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
  const [uploading, setUploading] = useState(false);

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

  // Handle CSV download
  const handleDownloadCSV = (selectedVenueId = null) => {
    let employeesToDownload;
    let venueName = null;
    
    if (userRole === 'master') {
      if (selectedVenueId) {
        // Download for specific venue
        const venue = allVenues.find(v => v.id === selectedVenueId);
        employeesToDownload = employees.filter(emp => emp.venue_id === selectedVenueId);
        venueName = venue?.name;
      } else {
        // Download all employees
        employeesToDownload = employees;
        venueName = 'all_venues';
      }
    } else {
      // Manager - download only their venue employees
      employeesToDownload = visibleEmployees;
      venueName = allVenues.find(v => v.id === venueId)?.name;
    }
    
    downloadEmployeesCSV(employeesToDownload, venueName);
  };

  // Handle CSV upload
  const handleCSVUpload = async (file, targetVenueId = null) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { employees: parsedEmployees, errors } = await parseEmployeesCSV(file);
      
      if (errors.length > 0) {
        setMessage(`CSV parsing errors: ${errors.join('; ')}`);
        return;
      }
      
      if (parsedEmployees.length === 0) {
        setMessage('No valid employee data found in CSV file');
        return;
      }
      
      // Determine venue ID for replacement
      let targetVenueIdForReplace;
      if (userRole === 'master' && targetVenueId) {
        targetVenueIdForReplace = targetVenueId;
      } else if (userRole === 'manager') {
        targetVenueIdForReplace = venueId;
      } else {
        setMessage('Unable to determine venue for employee import');
        return;
      }
      
      // Confirm replacement action
      const venueName = allVenues.find(v => v.id === targetVenueIdForReplace)?.name || 'this venue';
      const existingEmployeesCount = employees.filter(emp => emp.venue_id === targetVenueIdForReplace).length;
      
      if (existingEmployeesCount > 0) {
        const confirmMessage = `This will replace all ${existingEmployeesCount} existing employees at ${venueName} with ${parsedEmployees.length} new employees from your CSV. Continue?`;
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
      
      // Delete all existing employees for this venue
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('venue_id', targetVenueIdForReplace);
      
      if (deleteError) {
        console.error('Error deleting existing employees:', deleteError);
        setMessage('Failed to remove existing employees');
        return;
      }
      
      // Add venue_id to each employee
      const employeesToInsert = parsedEmployees.map(emp => ({
        ...emp,
        venue_id: targetVenueIdForReplace
      }));
      
      // Insert all new employees
      const { data, error } = await supabase
        .from('employees')
        .insert(employeesToInsert)
        .select();
      
      if (error) {
        console.error('Error inserting employees:', error);
        
        // Handle specific error codes
        if (error.code === '23505') {
          setMessage('Import failed: Duplicate email addresses found within your CSV file.');
        } else {
          setMessage(`Failed to import employees: ${error.message}`);
        }
        return;
      }
      
      setMessage(`Successfully replaced all employees with ${data.length} new employee${data.length !== 1 ? 's' : ''} from CSV`);
      
      // Refresh the staff data
      if (fetchStaffData) {
        await fetchStaffData();
      }
      
    } catch (error) {
      console.error('Error processing CSV:', error);
      setMessage(`Failed to process CSV: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (event, targetVenueId = null) => {
    const file = event.target.files[0];
    if (file) {
      handleCSVUpload(file, targetVenueId);
    }
    // Reset the input
    event.target.value = '';
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
            <p className="text-gray-500 text-xs mt-1">
              Need a CSV template? <a 
                href="/employee-template.csv" 
                download="employee-template.csv"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Download sample file
              </a>
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
        onDownloadCSV={handleDownloadCSV}
        onUploadCSV={handleFileInputChange}
        uploading={uploading}
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