import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

const QRCodeSection = ({ feedbackUrl }) => {
  const qrCodeRef = useRef(null);

  const downloadQRCode = () => {
    const qrCodeElement = qrCodeRef.current;
    if (!qrCodeElement) return;

    const canvas = document.createElement('canvas');
    canvas.width = qrCodeElement.clientWidth;
    canvas.height = qrCodeElement.clientHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svg = qrCodeElement.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'feedback-qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(feedbackUrl);
      // You might want to add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="max-w-none lg:max-w-6xl mb-6 lg:mb-8">
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Feedback QR Code</h2>
            <p className="text-gray-600 text-sm">
              Share this QR code or link with customers to collect feedback.
            </p>
          </div>
          <button
            onClick={downloadQRCode}
            className="w-full sm:w-auto bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download QR Code
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
          {/* QR Code Container */}
          <div className="flex-shrink-0 p-4 lg:p-6 bg-gray-50 rounded-lg border border-gray-200 mx-auto lg:mx-0" ref={qrCodeRef}>
            <QRCodeSVG value={feedbackUrl} size={160} />
          </div>

          {/* Text and Link Container */}
          <div className="flex-1 w-full lg:w-auto">
            <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-3">Share Feedback Link</h3>
            <p className="text-gray-600 mb-4 text-sm">
              Customers can scan the QR code or visit the link below to leave feedback about their experience.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md p-3">
                    <a
                      href={feedbackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-900 hover:text-black break-all"
                    >
                      {feedbackUrl}
                    </a>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="w-full sm:w-auto text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Tips */}
      <div className="mt-4 lg:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-base lg:text-lg font-medium text-blue-900 mb-2 lg:mb-3">Usage Tips</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Print the QR code and place it on tables, receipts, or near your entrance</p>
          <p>• Share the link via email, social media, or your website</p>
          <p>• The QR code works on all smartphones with camera apps</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeSection;