// AlertModal.js - Reusable alert modal component for validation messages

import React from 'react';

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error', // 'error', 'warning', 'info', 'success'
  buttonText = 'OK'
}) => {
  if (!isOpen) return null;

  const getIconComponent = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.95-.833-2.72 0L4.094 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default: // 'error'
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
    }
  };

  const getIconBgClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100';
      case 'info':
        return 'bg-blue-100';
      case 'warning':
        return 'bg-orange-100';
      default: // 'error'
        return 'bg-red-100';
    }
  };

  const getButtonClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700';
      default: // 'error'
        return 'bg-red-600 hover:bg-red-700';
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
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {title}
                </h3>
              )}
              <div className="text-sm text-gray-600">
                {typeof message === 'string' ? (
                  <p>{message}</p>
                ) : (
                  message
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 lg:px-6 py-2 lg:py-3 text-white rounded-md text-sm lg:text-base font-medium ${getButtonClasses()}`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;