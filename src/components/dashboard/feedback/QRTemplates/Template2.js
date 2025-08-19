import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const Template2 = ({ logo, feedbackUrl, primaryColor, secondaryColor }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Logo and QR Code Side by Side */}
        <div className="flex-shrink-0">
          {logo && (
            <img
              src={logo}
              alt="Venue Logo"
              className="w-32 h-32 object-contain mb-4"
            />
          )}
          <div className="p-4 bg-gray-50 rounded-lg">
            <QRCodeSVG value={feedbackUrl} size={150} />
          </div>
        </div>

        {/* Custom Text */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Share Your Feedback
          </h3>
          <p className="text-gray-600">
            Scan the QR code or visit the link below to leave your feedback.
          </p>
          <div className="mt-4 bg-gray-50 p-3 rounded-lg">
            <a
              href={feedbackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all"
            >
              {feedbackUrl}
            </a>
          </div>
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

export default Template2;