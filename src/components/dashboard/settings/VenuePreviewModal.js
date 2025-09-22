import React, { useState } from 'react';

const VenuePreviewModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  venueData, 
  currentVenueData,
  isLoading 
}) => {
  const [autoPopulate, setAutoPopulate] = useState(true);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  if (!isOpen || !venueData) return null;

  const handleConfirm = () => {
    onConfirm(autoPopulate);
  };

  const getFieldComparison = (googleValue, currentValue, fieldName) => {
    if (!googleValue && !currentValue) return null;
    
    const hasConflict = currentValue && googleValue && currentValue !== googleValue;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current {fieldName}
          </label>
          <div className="p-3 bg-gray-50 rounded-md text-sm">
            {currentValue || <span className="text-gray-400 italic">Not set</span>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Google {fieldName}
            {hasConflict && <span className="text-amber-600 ml-1">(Different)</span>}
          </label>
          <div className={`p-3 rounded-md text-sm ${
            hasConflict 
              ? 'bg-amber-50 border border-amber-200' 
              : googleValue 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50'
          }`}>
            {googleValue || <span className="text-gray-400 italic">Not available</span>}
          </div>
        </div>
      </div>
    );
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    return [addr.line1, addr.line2, addr.city, addr.county, addr.postalCode]
      .filter(Boolean)
      .join(', ');
  };

  // Generate Google review link from place_id
  const generateGoogleReviewLink = (placeId) => {
    if (!placeId) return '';
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm Google Venue Selection
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Warning Notice */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Important: One-time Selection
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  Once you confirm this Google venue selection, it cannot be changed. This ensures data integrity and rating progression tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Venue Info */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Selected Google Venue</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-blue-500 mr-3 mt-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{venueData.name}</h4>
                  <p className="text-sm text-gray-600">{venueData.formatted_address}</p>
                  {venueData.rating && (
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-sm font-medium">{venueData.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({venueData.ratings_count} reviews)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Auto-populate Option */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="auto-populate"
                type="checkbox"
                checked={autoPopulate}
                onChange={(e) => setAutoPopulate(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="auto-populate" className="ml-2 text-sm font-medium text-gray-700">
                Auto-populate venue information from Google
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This will update your venue's basic information with data from Google Places
            </p>
          </div>

          {/* Data Comparison */}
          {autoPopulate && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Comparison</h3>
              <div className="space-y-4">
                {getFieldComparison(venueData.name, currentVenueData?.name, 'Name')}
                {getFieldComparison(
                  venueData.formatted_address, 
                  formatAddress(currentVenueData?.address), 
                  'Address'
                )}
                {getFieldComparison(venueData.phone, currentVenueData?.phone, 'Phone')}
                {getFieldComparison(venueData.website, currentVenueData?.website, 'Website')}
                
                {/* Google Review Link - Always show when auto-populate is enabled */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Google Review Link
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md text-sm">
                      {currentVenueData?.google_review_link ? (
                        <a 
                          href={currentVenueData.google_review_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {currentVenueData.google_review_link}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Generated Google Review Link
                      <span className="text-green-600 ml-1">(New)</span>
                    </label>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                      <a 
                        href={generateGoogleReviewLink(venueData.place_id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {generateGoogleReviewLink(venueData.place_id)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Note about conflicts */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Note:</span> After auto-population, you can still edit any fields in the venue settings if needed.
                </p>
              </div>
            </div>
          )}

          {/* Google Review Link - Always show regardless of auto-populate */}
          {!autoPopulate && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Google Review Link</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    This Google review link will be automatically added to your venue settings:
                  </span>
                </div>
                <div className="p-3 bg-white border border-blue-300 rounded-md">
                  <a 
                    href={generateGoogleReviewLink(venueData.place_id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 break-all text-sm"
                  >
                    {generateGoogleReviewLink(venueData.place_id)}
                  </a>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Customers can use this link to leave reviews directly on your Google Business listing.
                </p>
              </div>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <div className="mb-6">
            <div className="flex items-start">
              <input
                id="confirm-understanding"
                type="checkbox"
                checked={hasConfirmed}
                onChange={(e) => setHasConfirmed(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
              />
              <label htmlFor="confirm-understanding" className="ml-2 text-sm text-gray-700">
                <span className="font-medium">I understand that this selection is permanent</span>
                <br />
                <span className="text-gray-500">
                  Once confirmed, I will not be able to change the linked Google venue for this location.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasConfirmed || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Confirming...
              </span>
            ) : (
              'Confirm Selection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenuePreviewModal;