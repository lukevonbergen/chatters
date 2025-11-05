import React from 'react';
import { useNavigate } from 'react-router-dom';

const ImpersonationBanner = () => {
  const navigate = useNavigate();

  // Read directly from localStorage to avoid timing issues
  const impersonationData = localStorage.getItem('impersonation');

  if (!impersonationData) {
    return null;
  }

  let accountName = '';
  try {
    const parsed = JSON.parse(impersonationData);
    accountName = parsed.accountName || '';
  } catch (e) {
    return null;
  }

  const handleExit = () => {
    localStorage.removeItem('impersonation');
    navigate('/admin');
    window.location.reload(); // Force full reload to clear state
  };

  return (
    <div className="text-xs text-gray-600">
      Viewing: <span className="font-medium text-blue-600">{accountName}</span>
      {' '}
      <button
        onClick={handleExit}
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Exit
      </button>
    </div>
  );
};

export default ImpersonationBanner;
