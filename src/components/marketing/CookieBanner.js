import React, { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true - required for site functionality
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('chatters_cookie_consent');
    const savedPreferences = localStorage.getItem('chatters_cookie_preferences');

    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    } else if (savedPreferences) {
      // Load saved preferences
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        initializeServices(parsed);
      } catch (e) {
        console.error('Error parsing cookie preferences:', e);
      }
    }
  }, []);

  const initializeServices = (prefs) => {
    // Initialize analytics if consented
    if (prefs.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }

    // Initialize marketing if consented
    if (prefs.marketing && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };

    localStorage.setItem('chatters_cookie_consent', 'accepted');
    localStorage.setItem('chatters_cookie_preferences', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    initializeServices(allAccepted);
    setShowBanner(false);
  };

  const handleDeclineAll = () => {
    const declined = {
      necessary: true, // Necessary cookies can't be declined
      analytics: false,
      marketing: false,
    };

    localStorage.setItem('chatters_cookie_consent', 'declined');
    localStorage.setItem('chatters_cookie_preferences', JSON.stringify(declined));
    setPreferences(declined);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('chatters_cookie_consent', 'custom');
    localStorage.setItem('chatters_cookie_preferences', JSON.stringify(preferences));
    initializeServices(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleOpenPreferences = () => {
    setShowPreferences(true);
  };

  const handleClosePreferences = () => {
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6">
            <div className="md:flex md:items-start md:justify-between gap-6">
              {/* Content */}
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Cookie className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic.
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <a href="/privacy" className="text-green-600 hover:text-green-700 underline font-medium">
                      Read our Privacy Policy
                    </a>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col sm:flex-row gap-3 md:flex-shrink-0">
                <button
                  onClick={handleOpenPreferences}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Customise
                </button>
                <button
                  onClick={handleDeclineAll}
                  className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Decline All
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Cookie Preferences</h2>
              </div>
              <button
                onClick={handleClosePreferences}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <p className="text-gray-600">
                We use different types of cookies to optimise your experience on our website.
                Click on the categories below to learn more and customise your preferences.
                Please note that blocking some types of cookies may impact your experience.
              </p>

              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">Necessary Cookies</h3>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      These cookies are essential for the website to function properly. They enable basic functions
                      like page navigation, access to secure areas, and remember your cookie preferences.
                      The website cannot function properly without these cookies.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 rounded border-gray-300 text-green-600 cursor-not-allowed opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      These cookies help us understand how visitors interact with our website by collecting
                      and reporting information anonymously. This helps us improve our website and services.
                    </p>
                    <p className="text-xs text-gray-500">
                      Used services: Google Analytics, Vercel Analytics
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4 hover:border-green-200 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">
                      These cookies are used to track visitors across websites and display ads that are relevant
                      and engaging for individual users. They may be set by us or by third-party advertising partners.
                    </p>
                    <p className="text-xs text-gray-500">
                      Used services: Google Ads, Facebook Pixel
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Your privacy matters:</strong> You can change your preferences at any time by clicking
                  on the cookie settings link in our footer. For more information about how we process your data,
                  please visit our <a href="/privacy" className="underline font-medium">Privacy Policy</a>.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeclineAll}
                className="flex-1 px-6 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieBanner;
