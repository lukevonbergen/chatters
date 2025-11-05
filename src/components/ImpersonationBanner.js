import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useImpersonation } from '../context/ImpersonationContext';
import { X, AlertCircle } from 'lucide-react';

const ImpersonationBanner = () => {
  const { impersonation, endImpersonation, isImpersonating } = useImpersonation();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const handleExit = () => {
    endImpersonation();
    navigate('/admin');
  };

  return (
    <div
      className="bg-blue-600 text-white py-3 px-4 shadow-md border-b-2 border-blue-700"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999
      }}
    >
      <div className="max-w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold text-sm sm:text-base">
              Impersonation Mode Active
            </span>
            <span className="text-xs sm:text-sm text-blue-100">
              Viewing as: {impersonation?.accountName}
            </span>
          </div>
        </div>
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex-shrink-0"
        >
          <X className="w-4 h-4" />
          Exit
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
