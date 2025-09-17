// EmployeeCard.js - Individual employee display card

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Trash2 } from 'lucide-react';
import { supabase } from '../../../../utils/supabase';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const [roleInfo, setRoleInfo] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);

  useEffect(() => {
    const fetchRoleAndLocationInfo = async () => {
      if (!employee.venue_id) return;

      // Fetch role info if employee has a role
      if (employee.role) {
        try {
          const { data: roleData } = await supabase
            .from('staff_roles')
            .select('name, color')
            .eq('venue_id', employee.venue_id)
            .eq('name', employee.role)
            .single();
          
          if (roleData) {
            setRoleInfo(roleData);
          }
        } catch (error) {
          // Role not found in custom roles, use default styling
        }
      }

      // Fetch location info if employee has a location
      if (employee.location) {
        try {
          const { data: locationData } = await supabase
            .from('staff_locations')
            .select('name, color')
            .eq('venue_id', employee.venue_id)
            .eq('name', employee.location)
            .single();
          
          if (locationData) {
            setLocationInfo(locationData);
          }
        } catch (error) {
          // Location not found in custom locations, use default styling
        }
      }
    };

    fetchRoleAndLocationInfo();
  }, [employee.role, employee.location, employee.venue_id]);
  
  const handleEdit = () => {
    onEdit(employee);
  };

  const handleDelete = () => {
    onDelete(employee);
  };

  const handleViewDetails = () => {
    navigate(`/staff-member/${employee.id}`);
  };

  return (
    <div className="p-3 bg-gray-50 rounded-md">
      {/* Mobile-first layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        {/* Employee info */}
        <div className="flex-1 min-w-0">
          {/* Name and role on first line */}
          <div className="flex items-center justify-between sm:justify-start">
            <button
              onClick={handleViewDetails}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline truncate mr-2 text-left"
            >
              {employee.first_name} {employee.last_name}
            </button>
            <div className="flex items-center space-x-2 flex-shrink-0 sm:ml-3">
              {employee.role && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ 
                    backgroundColor: roleInfo?.color || '#3B82F6',
                    color: '#ffffff'
                  }}
                >
                  {employee.role}
                </span>
              )}
              {employee.location && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{ 
                    backgroundColor: locationInfo?.color ? `${locationInfo.color}20` : '#f3f4f6',
                    color: locationInfo?.color || '#374151'
                  }}
                >
                  {employee.location}
                </span>
              )}
            </div>
          </div>
          
          {/* Contact info on second line */}
          <div className="mt-1 flex flex-col sm:flex-row sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0 sm:space-x-3">
            <span className="truncate">{employee.email}</span>
            {employee.phone && (
              <span className="sm:ml-0">{employee.phone}</span>
            )}
          </div>
        </div>
        
        {/* Actions - Mobile: Right aligned on first row, Desktop: Right column */}
        <div className="flex items-center justify-end space-x-2 mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-custom-green">
            Active
          </span>
          <button 
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-custom-blue hover:bg-blue-50 rounded-md transition-all duration-200"
            title="Edit employee"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
            title="Delete employee"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;