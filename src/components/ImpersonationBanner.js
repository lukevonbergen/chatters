import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useImpersonation } from '../context/ImpersonationContext';
import { X } from 'lucide-react';

const ImpersonationBanner = () => {
  const { impersonation, endImpersonation, isImpersonating } = useImpersonation();
  const navigate = useNavigate();

  if (!isImpersonating) return null;

  const handleExit = () => {
    endImpersonation();
    navigate('/admin');
  };

  return (
    <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md shadow-sm text-xs">
      <span className="font-semibold whitespace-nowrap">
        Viewing: {impersonation?.accountName}
      </span>
      <button
        onClick={handleExit}
        className="inline-flex items-center justify-center w-4 h-4 bg-blue-700 hover:bg-blue-800 rounded transition-colors"
        title="Exit Impersonation"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export default ImpersonationBanner;
