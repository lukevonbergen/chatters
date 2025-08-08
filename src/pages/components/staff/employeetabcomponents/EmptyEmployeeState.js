// EmptyEmployeeState.js - Empty state when no employees exist

import React from 'react';
import { User, Plus } from 'lucide-react';

const EmptyEmployeeState = ({ 
  onAddEmployee, 
  message = "No employees yet", 
  description,
  buttonText = "Add Employee",
  showLargeButton = false 
}) => {
  if (showLargeButton) {
    return (
      <div className="text-center py-8 lg:py-12 text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-base lg:text-lg mb-2">{message}</p>
        {description && <p className="text-sm mb-4">{description}</p>}
        <button
          onClick={onAddEmployee}
          className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-6 lg:py-8 text-gray-500">
      <p className="mb-2">{message}</p>
      {description && <p className="text-sm mb-2">{description}</p>}
      <button
        onClick={onAddEmployee}
        className="text-blue-600 hover:underline text-sm"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyEmployeeState;