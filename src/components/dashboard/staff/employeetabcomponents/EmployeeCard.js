// EmployeeCard.js - Individual employee display card

import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(employee);
  };

  const handleDelete = () => {
    onDelete(employee);
  };

  return (
    <div className="p-3 bg-gray-50 rounded-md">
      {/* Mobile-first layout */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        {/* Employee info */}
        <div className="flex-1 min-w-0">
          {/* Name and role on first line */}
          <div className="flex items-center justify-between sm:justify-start">
            <div className="text-sm font-medium text-gray-900 truncate mr-2">
              {employee.first_name} {employee.last_name}
            </div>
            {employee.role && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-custom-blue flex-shrink-0 sm:ml-3">
                {employee.role}
              </span>
            )}
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