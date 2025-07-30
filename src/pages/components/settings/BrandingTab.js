import React from 'react';
import { supabase } from '../../../utils/supabase';

const BrandingTab = ({ 
  logo, setLogo,
  primaryColor, setPrimaryColor,
  secondaryColor, setSecondaryColor,
  saveSettings,
  loading,
  message,
  venueId 
}) => {

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !venueId) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${venueId}-logo.${fileExt}`;
    const filePath = `${fileName}`;

    // Delete existing logo
    const { error: deleteError } = await supabase.storage
      .from('venue-logos')
      .remove([filePath]);

    if (deleteError && deleteError.message !== 'The resource was not found') {
      console.error('Error deleting existing logo:', deleteError);
      return;
    }

    // Upload new logo
    const { error: uploadError } = await supabase.storage
      .from('venue-logos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      return;
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
      console.error('Error updating logo:', updateError);
    } else {
      setLogo(publicUrl);
    }
  };

  return (
    <div className="max-w-none lg:max-w-2xl">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Branding</h2>
        <p className="text-gray-600 text-sm">Customize your venue's appearance and branding.</p>
      </div>

      <div className="space-y-4 lg:space-y-6">
        {/* Logo Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
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
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: Square image, minimum 100x100px
              </p>
            </div>
          </div>
        </div>

        {/* Primary Color Section */}
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

        {/* Secondary Color Section */}
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

        {/* Color Preview Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Color Preview</h3>
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

        {/* Save Button */}
        <div className="pt-2">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="w-full sm:w-auto bg-black text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md hover:bg-gray-800 transition-colors duration-200 text-sm lg:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`text-sm p-3 rounded-md ${
            message.includes('success') 
              ? 'text-green-700 bg-green-50 border border-green-200' 
              : 'text-red-700 bg-red-50 border border-red-200'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandingTab;