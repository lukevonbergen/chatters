import React, { useState } from 'react';
import { supabase } from '../../../utils/supabase';
import { HandHeart, Bell, UserCheck, Sparkles } from 'lucide-react';

const BrandingTab = ({
  logo, setLogo,
  primaryColor, setPrimaryColor,
  backgroundColor, setBackgroundColor,
  textColor, setTextColor,
  buttonTextColor, setButtonTextColor,
  assistanceTitle, setAssistanceTitle,
  assistanceMessage, setAssistanceMessage,
  assistanceIcon, setAssistanceIcon,
  venueId
}) => {
  // Separate loading and message states for each section
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoMessage, setLogoMessage] = useState('');
  const [colorsLoading, setColorsLoading] = useState(false);
  const [colorsMessage, setColorsMessage] = useState('');
  const [assistanceLoading, setAssistanceLoading] = useState(false);
  const [assistanceUpdateMessage, setAssistanceUpdateMessage] = useState('');

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !venueId) return;

    setLogoLoading(true);
    setLogoMessage('');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${venueId}-logo.${fileExt}`;
      const filePath = `${fileName}`;

      // Delete existing logo
      const { error: deleteError } = await supabase.storage
        .from('venue-logos')
        .remove([filePath]);

      if (deleteError && deleteError.message !== 'The resource was not found') {
        throw new Error('Failed to delete existing logo: ' + deleteError.message);
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('venue-logos')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error('Failed to upload logo: ' + uploadError.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('venue-logos')
        .getPublicUrl(filePath);

      // Update database
      const { error: updateError } = await supabase
        .from('venues')
        .update({ logo: publicUrl })
        .eq('id', venueId);

      if (updateError) {
        throw new Error('Failed to update logo: ' + updateError.message);
      }

      setLogo(publicUrl);
      setLogoMessage('Logo updated successfully!');
    } catch (error) {
      console.error('Error updating logo:', error);
      setLogoMessage('Failed to update logo: ' + error.message);
    } finally {
      setLogoLoading(false);
    }
  };

  const saveColors = async () => {
    if (!venueId) return;

    setColorsLoading(true);
    setColorsMessage('');

    try {
      const { error } = await supabase
        .from('venues')
        .update({
          primary_color: primaryColor,
          background_color: backgroundColor,
          text_color: textColor,
          button_text_color: buttonTextColor
        })
        .eq('id', venueId);

      if (error) {
        throw new Error('Failed to save colors: ' + error.message);
      }

      setColorsMessage('Colors saved successfully!');
    } catch (error) {
      console.error('Error saving colors:', error);
      setColorsMessage('Failed to save colors: ' + error.message);
    } finally {
      setColorsLoading(false);
    }
  };

  const saveAssistanceSettings = async () => {
    if (!venueId) return;

    setAssistanceLoading(true);
    setAssistanceUpdateMessage('');

    try {
      const { error } = await supabase
        .from('venues')
        .update({
          assistance_title: assistanceTitle,
          assistance_message: assistanceMessage,
          assistance_icon: assistanceIcon
        })
        .eq('id', venueId);

      if (error) {
        throw new Error('Failed to save assistance settings: ' + error.message);
      }

      setAssistanceUpdateMessage('Assistance message settings saved successfully!');
    } catch (error) {
      setAssistanceUpdateMessage('Failed to save assistance settings: ' + error.message);
    } finally {
      setAssistanceLoading(false);
    }
  };

  const iconOptions = [
    { value: 'hand-heart', label: 'Hand Heart', icon: HandHeart },
    { value: 'bell', label: 'Bell', icon: Bell },
    { value: 'user-check', label: 'User Check', icon: UserCheck },
    { value: 'sparkles', label: 'Sparkles', icon: Sparkles }
  ];

  const getIconComponent = (iconValue) => {
    const option = iconOptions.find(opt => opt.value === iconValue);
    return option ? option.icon : HandHeart;
  };

  return (
    <div className="w-full">
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Logo Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Logo</h3>
            <p className="text-gray-600 text-sm">Upload your venue's logo for branding consistency.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              {logo && (
                <div className="flex-shrink-0">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-lg border border-gray-200 shadow-sm" 
                  />
                </div>
              )}
              <div className="w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={logoLoading}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Recommended: Square image, minimum 100x100px
                </p>
              </div>
            </div>

            {/* Logo Message Display */}
            {logoMessage && (
              <div className={`text-sm p-3 rounded-md ${
                logoMessage.includes('success') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {logoMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Colors Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Brand Colors</h3>
            <p className="text-gray-600 text-sm">Customize your feedback page colors to match your brand.</p>
          </div>

          <div className="space-y-6">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 lg:w-16 lg:h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-24 lg:w-28 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-gray-500 sm:ml-2">
                  Used for buttons and key elements
                </p>
              </div>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background Color</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-10 lg:w-16 lg:h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-24 lg:w-28 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
                <p className="text-xs text-gray-500 sm:ml-2">
                  Feedback page background
                </p>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 lg:w-16 lg:h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-24 lg:w-28 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#111827"
                  />
                </div>
                <p className="text-xs text-gray-500 sm:ml-2">
                  Main text color on feedback page
                </p>
              </div>
            </div>

            {/* Button Text Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Text Color</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="w-12 h-10 lg:w-16 lg:h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={buttonTextColor}
                    onChange={(e) => setButtonTextColor(e.target.value)}
                    className="w-24 lg:w-28 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#ffffff"
                  />
                </div>
                <p className="text-xs text-gray-500 sm:ml-2">
                  Color of text on buttons
                </p>
              </div>
            </div>

            {/* Color Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Color Preview</h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: primaryColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Primary</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: backgroundColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Background</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: textColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Text</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: buttonTextColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Button Text</span>
                </div>
              </div>
              {/* Feedback Page Preview */}
              <div className="mt-4 p-4 rounded-lg border-2 border-gray-200" style={{ backgroundColor: backgroundColor }}>
                <p className="text-sm font-medium mb-2" style={{ color: textColor }}>
                  Feedback Page Preview
                </p>
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                >
                  Sample Button
                </button>
              </div>
            </div>

            {/* Save Colors Button */}
            <div className="pt-2">
              <button
                onClick={saveColors}
                disabled={colorsLoading}
                className="w-full sm:w-auto bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {colorsLoading ? 'Saving...' : 'Save Colors'}
              </button>
            </div>

            {/* Colors Message Display */}
            {colorsMessage && (
              <div className={`text-sm p-3 rounded-md ${
                colorsMessage.includes('success') 
                  ? 'text-green-700 bg-green-50 border border-green-200' 
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {colorsMessage}
              </div>
            )}
          </div>
        </div>
      
      </div>

      {/* Assistance Message Customization Section */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Assistance Request Message</h3>
            <p className="text-gray-600 text-sm">Customize the message customers see after requesting assistance</p>
          </div>

          <div className="space-y-6">
            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Icon</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {iconOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setAssistanceIcon(option.value)}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                        assistanceIcon === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="w-8 h-8 mb-2" style={{ color: assistanceIcon === option.value ? primaryColor : '#6b7280' }} />
                      <span className="text-xs font-medium text-gray-700">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={assistanceTitle}
                onChange={(e) => setAssistanceTitle(e.target.value)}
                placeholder="Help is on the way!"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={assistanceMessage}
                onChange={(e) => setAssistanceMessage(e.target.value)}
                placeholder="We've notified our team that you need assistance. Someone will be with you shortly."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use {'{table}'} as a placeholder for the table number (e.g., "Table {'{table}'} needs assistance")
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
              <div className="bg-white rounded-lg p-6 border border-gray-200" style={{ backgroundColor: backgroundColor }}>
                <div className="flex flex-col items-center text-center">
                  <div className="inline-block p-4 rounded-full mb-4" style={{ backgroundColor: `${primaryColor}20` }}>
                    {React.createElement(getIconComponent(assistanceIcon), {
                      className: "w-12 h-12",
                      style: { color: primaryColor }
                    })}
                  </div>
                  <h2 className="text-xl font-bold mb-2" style={{ color: textColor }}>
                    {(assistanceTitle || 'Help is on the way!')
                      .split(/(\{table\})/g)
                      .map((part, index) =>
                        part === '{table}' ? (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 rounded mx-1"
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              fontWeight: '600'
                            }}
                          >
                            14
                          </span>
                        ) : part
                      )
                    }
                  </h2>
                  <p className="text-sm" style={{ color: textColor, opacity: 0.8 }}>
                    {(assistanceMessage || 'We\'ve notified our team that you need assistance. Someone will be with you shortly.')
                      .split(/(\{table\})/g)
                      .map((part, index) =>
                        part === '{table}' ? (
                          <span
                            key={index}
                            className="inline-block px-2 py-0.5 rounded mx-1"
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              fontWeight: '600'
                            }}
                          >
                            14
                          </span>
                        ) : part
                      )
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={saveAssistanceSettings}
                disabled={assistanceLoading}
                className="w-full sm:w-auto bg-custom-green text-white px-6 py-2 rounded-lg hover:bg-custom-green-hover transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assistanceLoading ? 'Saving...' : 'Save Assistance Settings'}
              </button>
            </div>

            {/* Message Display */}
            {assistanceUpdateMessage && (
              <div className={`text-sm p-3 rounded-md ${
                assistanceUpdateMessage.includes('success')
                  ? 'text-green-700 bg-green-50 border border-green-200'
                  : 'text-red-700 bg-red-50 border border-red-200'
              }`}>
                {assistanceUpdateMessage}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingTab;