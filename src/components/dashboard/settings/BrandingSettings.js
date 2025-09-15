import React, { useState } from 'react';
import { ColorPicker, Tooltip } from 'antd';

const BrandingSettings = ({ logo, onLogoUpload, primaryColor, secondaryColor, onColorChange, colorsUpdated, onSaveColors, colorsMessage, loading }) => {
  const [locked, setLocked] = useState(true);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Branding Settings</h2>
        <button
          onClick={() => setLocked(!locked)}
          className="bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium"
        >
          {locked ? 'Unlock' : 'Lock'}
        </button>
      </div>
      <div className="flex items-center gap-6">
        {logo && (
          <img
            src={logo}
            alt="Venue Logo"
            className="max-w-[200px] max-h-[200px] object-contain"
          />
        )}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={onLogoUpload}
            className="hidden"
            id="logo-upload"
            disabled={locked}
          />
          <label
            htmlFor="logo-upload"
            className={`bg-custom-green text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium ${
              locked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Uploading...' : 'Upload Logo'}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Recommended size: 200x200 pixels
          </p>
        </div>
      </div>
      {colorsMessage && <p className="text-sm text-red-500 mt-2">{colorsMessage}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        {/* Primary Color */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <Tooltip title="Primary color is used for text on the feedback collection page.">
              <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
          </div>
          <ColorPicker
            value={primaryColor}
            onChange={(color) => onColorChange('primary', color.toHexString())}
            disabled={locked}
          />
        </div>

        {/* Secondary Color */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Secondary Color
            </label>
            <Tooltip title="Secondary color is used for the background on the feedback collection page.">
              <span className="text-gray-400 cursor-help">ⓘ</span>
            </Tooltip>
          </div>
          <ColorPicker
            value={secondaryColor}
            onChange={(color) => onColorChange('secondary', color.toHexString())}
            disabled={locked}
          />
        </div>
      </div>
      {colorsUpdated && (
        <button
          onClick={onSaveColors}
          className="mt-4 bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || locked}
        >
          {loading ? 'Saving...' : 'Save Colors'}
        </button>
      )}
      {colorsMessage && <p className="text-sm text-red-500 mt-2">{colorsMessage}</p>}
    </div>
  );
};

export default BrandingSettings;