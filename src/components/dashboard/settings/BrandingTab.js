import React, { useState } from 'react';
import { supabase } from '../../../utils/supabase';

const BrandingTab = ({ 
  logo, setLogo,
  primaryColor, setPrimaryColor,
  secondaryColor, setSecondaryColor,
  venueId 
}) => {
  // Separate loading and message states for each section
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoMessage, setLogoMessage] = useState('');
  const [colorsLoading, setColorsLoading] = useState(false);
  const [colorsMessage, setColorsMessage] = useState('');

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
          secondary_color: secondaryColor 
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

  return (
    <div className="max-w-none lg:max-w-2xl">

      <div className="space-y-8">
        {/* Logo Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Logo</h3>
            <p className="text-gray-600 text-sm">Upload your venue's logo for branding consistency.</p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {logo && (
                <div className="flex-shrink-0">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded-md border border-gray-200" 
                  />
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={logoLoading}
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
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

        {/* Colors Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Brand Colors</h3>
            <p className="text-gray-600 text-sm">Set your primary and secondary brand colors.</p>
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

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 lg:w-16 lg:h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-24 lg:w-28 px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-gray-500 sm:ml-2">
                  Used for accents and highlights
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
                    style={{ backgroundColor: secondaryColor }}
                  ></div>
                  <span className="text-xs text-gray-600">Secondary</span>
                </div>
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
    </div>
  );
};

export default BrandingTab;