import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const DemoModal = ({ isDemoModalOpen, closeDemoModal }) => {
  useEffect(() => {
    if (!isDemoModalOpen) return;

    const script = document.createElement('script');
    script.src = 'https://js.hsforms.net/forms/embed/48822376.js';
    script.defer = true;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [isDemoModalOpen]);

  if (!isDemoModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl relative">
        <button
          onClick={closeDemoModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6">Chatters Enquiry</h2>
          <div
            className="hs-form-frame"
            data-region="na1"
            data-form-id="9025b757-387d-4e0d-8d77-8b10660a1767"
            data-portal-id="48822376"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;