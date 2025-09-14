// DeleteEmployeeModal.js - Modal for confirming employee deletion

import React from 'react';

const DeleteEmployeeModal = ({
  employee,
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!employee) return null;

  const handleConfirm = () => {
    onConfirm(employee.id, `${employee.first_name} ${employee.last_name}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 lg:p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.95-.833-2.72 0L4.094 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Employee
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to permanently delete <strong>{employee.first_name} {employee.last_name}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. The employee record will be permanently deleted from the system.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base font-medium"
            >
              {loading ? 'Deleting...' : 'Delete Employee'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteEmployeeModal;