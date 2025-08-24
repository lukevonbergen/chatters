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
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
      {/* Employee info in one line */}
      <div className="flex items-center space-x-4 min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 truncate">
          {employee.first_name} {employee.last_name}
        </div>
        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span className="truncate">{employee.email}</span>
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
      
      {/* Actions */}
      <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
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
  );
};

export default EmployeeCard;