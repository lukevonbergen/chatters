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
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Branding</h2>
        <p className="text-gray-600 text-sm">Customize your venue's appearance and branding.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
          <div className="flex items-center space-x-4">
            {logo && (
              <img src={logo} alt="Logo" className="w-16 h-16 object-cover rounded-md border" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-16 h-10 border border-gray-300 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
            />
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>

        {message && (
          <p className={`text-sm mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default BrandingTab;