// EmployeesTab.js - Main component that orchestrates all the smaller components

import React, { useState, useMemo } from 'react';
import { Plus, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../../utils/supabase';
import { downloadEmployeesCSV, parseEmployeesCSV } from '../../../utils/csvUtils';
import EmployeesList from './employeetabcomponents/EmployeesList';
import AddEmployeeModal from './employeetabcomponents/AddEmployeeModal';
import EmployeeSummary from './employeetabcomponents/EmployeeSummary';
import EditEmployeeModal from './employeetabcomponents/EditEmployeeModal';
import DeleteEmployeeModal from './employeetabcomponents/DeleteEmployeeModal';
import ConfirmationModal from '../../ui/ConfirmationModal';

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
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [csvConfirmation, setCsvConfirmation] = useState(null);
  
  // Search and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // For managers (single venue)
  const [venuePages, setVenuePages] = useState({}); // For masters (per-venue pagination)
  const itemsPerPage = 10;

  // Filter employees based on user role
  const visibleEmployees = userRole === 'master' 
    ? employees 
    : employees.filter(emp => emp.venue_id === venueId);

  // Initialize venue pages for all venues
  const getVenuePage = (venueId) => venuePages[venueId] || 1;
  const setVenuePage = (venueId, page) => {
    setVenuePages(prev => ({ ...prev, [venueId]: page }));
  };

  // Filter and paginate for managers (single venue)
  const managerData = useMemo(() => {
    if (userRole !== 'manager') return null;
    
    // Filter employees
    const filtered = searchTerm.trim() 
      ? visibleEmployees.filter(employee => 
          employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.location?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : visibleEmployees;
    
    // Paginate
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    
    return {
      filtered,
      paginated,
      totalPages,
      currentPage,
      startItem: filtered.length > 0 ? startIndex + 1 : 0,
      endItem: Math.min(currentPage * itemsPerPage, filtered.length)
    };
  }, [userRole, visibleEmployees, searchTerm, currentPage, itemsPerPage]);

  // Filter and paginate for masters (per-venue)
  const masterData = useMemo(() => {
    if (userRole !== 'master') return {};
    
    const result = {};
    
    allVenues.forEach(venue => {
      // Get all employees for this venue
      const venueEmployees = visibleEmployees.filter(emp => emp.venue_id === venue.id);
      
      // Filter employees based on search
      const filtered = searchTerm.trim()
        ? venueEmployees.filter(employee => 
            employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            venue.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : venueEmployees;
      
      // Paginate this venue's employees
      const venuePage = getVenuePage(venue.id);
      const totalPages = Math.ceil(filtered.length / itemsPerPage);
      const startIndex = (venuePage - 1) * itemsPerPage;
      const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
      
      // Always show venue if no search, or if it has filtered results
      if (!searchTerm || filtered.length > 0) {
        result[venue.id] = {
          venue,
          employees: venueEmployees, // All employees for this venue (for stats)
          filtered, // Filtered employees
          paginated, // Current page of filtered employees
          totalPages,
          currentPage: venuePage,
          startItem: filtered.length > 0 ? startIndex + 1 : 0,
          endItem: Math.min(venuePage * itemsPerPage, filtered.length)
        };
      }
    });
    
    return result;
  }, [userRole, allVenues, visibleEmployees, searchTerm, venuePages, itemsPerPage, getVenuePage]);

  // Calculate total stats for search results
  const searchStats = useMemo(() => {
    if (userRole === 'manager') {
      return managerData ? {
        totalFiltered: managerData.filtered.length,
        totalVisible: managerData.paginated.length
      } : { totalFiltered: 0, totalVisible: 0 };
    } else {
      const totalFiltered = Object.values(masterData).reduce((sum, venue) => sum + venue.filtered.length, 0);
      const totalVisible = Object.values(masterData).reduce((sum, venue) => sum + venue.paginated.length, 0);
      return { totalFiltered, totalVisible };
    }
  }, [userRole, managerData, masterData]);

  // Reset pages when search changes
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset manager page
    setVenuePages({}); // Reset all venue pages
  };

  // Handle edit employee
  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEditForm(true);
  };

  // Handle delete employee - show modal
  const handleDeleteEmployee = (employee) => {
    setEmployeeToDelete(employee);
  };

  // Confirm delete employee - actual deletion
  const confirmDeleteEmployee = async (employeeId, employeeName) => {
    setDeleteLoading(true);
    
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      setMessage('Employee deleted successfully!');
      setEmployeeToDelete(null);
      
      // Refresh the staff data
      if (fetchStaffData) {
        await fetchStaffData();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      setMessage('Failed to delete employee. Please try again.');
    } finally {
      setDeleteLoading(false);
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
        // Show confirmation modal instead of window.confirm
        await new Promise((resolve) => {
          setCsvConfirmation({
            message: (
              <div>
                <p className="mb-4">
                  This will replace all <strong>{existingEmployeesCount}</strong> existing employees at <strong>{venueName}</strong> with <strong>{parsedEmployees.length}</strong> new employees from your CSV.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-custom-yellow">
                    <strong>Warning:</strong> This action cannot be undone. All existing employee data will be permanently deleted.
                  </p>
                </div>
              </div>
            ),
            onConfirm: () => {
              setCsvConfirmation(null);
              resolve(true);
            },
            onCancel: () => {
              setCsvConfirmation(null);
              setUploading(false);
              resolve(false);
            }
          });
        }).then(confirmed => {
          if (!confirmed) return;
        });
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
            <p className="text-gray-600 text-sm">
              {userRole === 'master' 
                ? 'View and manage employees across all venues.' 
                : 'View and manage employees at your venue.'}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Need a CSV template? <a 
                href="/employee-template.csv" 
                download="employee-template.csv"
                className="text-custom-blue hover:text-blue-700 underline"
              >
                Download sample file
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Search and Pagination Controls */}
      <div className="mb-6">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search employees by name, email, role, phone, location..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Results Summary */}
          <div className="text-sm text-gray-600">
            {searchStats.totalFiltered > 0 ? (
              <>
                {userRole === 'manager' 
                  ? `Showing ${managerData?.startItem}-${managerData?.endItem} of ${searchStats.totalFiltered} employee${searchStats.totalFiltered !== 1 ? 's' : ''}` 
                  : `Found ${searchStats.totalFiltered} employee${searchStats.totalFiltered !== 1 ? 's' : ''} across venues`
                }
                {searchTerm && (
                  <span className="ml-1">
                    for "{searchTerm}"
                  </span>
                )}
              </>
            ) : searchTerm ? (
              <>No employees found for "{searchTerm}"</>
            ) : (
              <>No employees found</>
            )}
          </div>
        </div>
        
        {/* Pagination Controls - Only for managers */}
        {userRole === 'manager' && managerData && managerData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {/* Show page numbers */}
                {Array.from({ length: managerData.totalPages }, (_, i) => i + 1).map(pageNum => {
                  // Show first, last, current, and adjacent pages
                  const showPage = pageNum === 1 || 
                                  pageNum === managerData.totalPages || 
                                  Math.abs(pageNum - currentPage) <= 1;
                  
                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (pageNum === 2 && currentPage > 4) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                    }
                    if (pageNum === managerData.totalPages - 1 && currentPage < managerData.totalPages - 3) {
                      return <span key={pageNum} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        currentPage === pageNum
                          ? 'bg-custom-blue text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(managerData.totalPages, prev + 1))}
                disabled={currentPage === managerData.totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-sm text-gray-600">
              Page {currentPage} of {managerData.totalPages}
            </div>
          </div>
        )}
      </div>

      {/* Employees List */}
      <EmployeesList
        userRole={userRole}
        visibleEmployees={userRole === 'manager' ? (managerData?.paginated || []) : []}
        masterData={masterData}
        onAddEmployee={() => setShowAddForm(true)}
        onEditEmployee={handleEditEmployee}
        onDeleteEmployee={handleDeleteEmployee}
        onDownloadCSV={handleDownloadCSV}
        onUploadCSV={handleFileInputChange}
        uploading={uploading}
        onVenuePageChange={setVenuePage}
      />

      {/* Summary */}
      <EmployeeSummary
        visibleEmployees={visibleEmployees}
        userRole={userRole}
        allVenues={allVenues}
        filteredCount={searchStats.totalFiltered}
        searchTerm={searchTerm}
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

      {/* Delete Employee Modal */}
      <DeleteEmployeeModal
        employee={employeeToDelete}
        onConfirm={confirmDeleteEmployee}
        onCancel={() => setEmployeeToDelete(null)}
        loading={deleteLoading}
      />

      {/* CSV Upload Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!csvConfirmation}
        onConfirm={csvConfirmation?.onConfirm}
        onCancel={csvConfirmation?.onCancel}
        title="Replace All Employees"
        message={csvConfirmation?.message}
        confirmText="Replace Employees"
        cancelText="Cancel Upload"
        confirmButtonStyle="warning"
        icon="warning"
        loading={uploading}
      />
    </div>
  );
};

export default EmployeesTab;