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
    <div className="bg-purple-600 text-white py-3 px-4 shadow-lg" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">
            Viewing as: {impersonation?.accountName}
          </span>
          <span className="text-purple-200 text-sm">
            (Impersonation Mode)
          </span>
        </div>
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors"
        >
          <X className="w-4 h-4" />
          Exit Impersonation
        </button>
      </div>
    </div>
  );
};

export default ImpersonationBanner;
