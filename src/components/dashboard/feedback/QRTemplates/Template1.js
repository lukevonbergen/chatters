import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const Template1 = ({ logo, feedbackUrl, primaryColor, secondaryColor }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        {logo && (
          <img
            src={logo}
            alt="Venue Logo"
            className="w-32 h-32 object-contain"
          />
        )}

        {/* QR Code */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <QRCodeSVG value={feedbackUrl} size={200} />
        </div>

        {/* Custom Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scan to Leave Feedback
          </h3>
          <p className="text-gray-600">
            We value your feedback! Scan the QR code to share your thoughts.
          </p>
        </div>
      </div>

      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        Print Flyer
      </button>
    </div>
  );
};

export default Template1;