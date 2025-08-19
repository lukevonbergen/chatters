// EmployeeCard.js - Individual employee display card

import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

const EmployeeCard = ({ employee, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(employee);
  };

  const handleDelete = () => {
    onDelete(employee.id, `${employee.first_name} ${employee.last_name}`);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 lg:p-4 bg-gray-50 rounded-md space-y-3 sm:space-y-0">
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
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200"
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