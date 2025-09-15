// ConfirmationModal.js - Reusable confirmation modal component

import React from 'react';

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle = 'danger', // 'danger', 'primary', 'warning'
  loading = false,
  icon = 'warning' // 'warning', 'danger', 'info'
}) => {
  if (!isOpen) return null;

  const getIconComponent = () => {
    switch (icon) {
      case 'danger':
        return (
          <svg className="w-6 h-6 text-custom-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-custom-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: // 'warning'
        return (
          <svg className="w-6 h-6 text-custom-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.95-.833-2.72 0L4.094 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    const baseClasses = "w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 rounded-md text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (confirmButtonStyle) {
      case 'primary':
        return `${baseClasses} bg-custom-blue text-white hover:bg-custom-blue-hover`;
      case 'warning':
        return `${baseClasses} bg-custom-yellow text-white hover:bg-custom-yellow-hover`;
      default: // 'danger'
        return `${baseClasses} bg-custom-red text-white hover:bg-custom-red-hover`;
    }
  };

  const getIconBgClasses = () => {
    switch (icon) {
      case 'danger':
        return 'bg-red-100';
      case 'info':
        return 'bg-blue-100';
      default: // 'warning'
        return 'bg-yellow-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-4 lg:p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-12 h-12 ${getIconBgClasses()} rounded-full flex items-center justify-center flex-shrink-0`}>
              {getIconComponent()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
              <div className="text-sm text-gray-600">
                {typeof message === 'string' ? (
                  <p>{message}</p>
                ) : (
                  message
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-4 lg:px-6 py-2 lg:py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={getConfirmButtonClasses()}
            >
              {loading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;