'use client';

import { useState, useEffect } from 'react';

export default function PrivacySettingsModal({ isOpen, onClose, onSave }) {
  const [settings, setSettings] = useState({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    personalization: false
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load current settings from localStorage
      const currentSettings = {
        necessary: true,
        analytics: localStorage.getItem('privacy-analytics') === 'true',
        marketing: localStorage.getItem('privacy-marketing') === 'true',
        personalization: localStorage.getItem('privacy-personalization') === 'true'
      };
      setSettings(currentSettings);
    }
  }, [isOpen]);

  const handleToggle = (key) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    try {
      // Save settings to localStorage
      Object.keys(settings).forEach(key => {
        localStorage.setItem(`privacy-${key}`, settings[key].toString());
      });

      // Update Shopify Privacy Banner API
      if (typeof window.privacyBanner === 'function') {
        const hasAnyTracking = settings.analytics || settings.marketing || settings.personalization;
        window.privacyBanner({
          acceptAll: hasAnyTracking,
          rejectAll: !hasAnyTracking,
          customSettings: settings
        });
      }

      // Call parent save handler
      if (onSave) {
        onSave(settings);
      }

      onClose();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptAll = () => {
    setSettings({
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true
    });
  };

  const handleRejectAll = () => {
    setSettings({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative inline-block align-bottom bg-white border border-gray-200 text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-6 pt-8 pb-6 sm:p-8 sm:pb-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-2xl leading-6 font-medium text-gray-900 mb-4 uppercase tracking-wider">
                  Privacy Settings
                </h3>
                
                <p className="text-sm text-gray-600 mb-8">
                  We use cookies to enhance your experience. You can customize your preferences below.
                </p>

                {/* Cookie Categories */}
                <div className="space-y-6">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Necessary Cookies</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                    <div className="ml-6">
                      <div className="w-12 h-6 bg-gray-300 rounded-full flex items-center justify-end px-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Analytics Cookies</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Help us understand how visitors interact with our website.
                      </p>
                    </div>
                    <div className="ml-6">
                      <button
                        onClick={() => handleToggle('analytics')}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                          settings.analytics ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.analytics ? 'transform translate-x-6' : 'transform translate-x-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Marketing Cookies</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Used to track visitors across websites for advertising purposes.
                      </p>
                    </div>
                    <div className="ml-6">
                      <button
                        onClick={() => handleToggle('marketing')}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                          settings.marketing ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.marketing ? 'transform translate-x-6' : 'transform translate-x-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>

                  {/* Personalization Cookies */}
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wider">Personalization Cookies</h4>
                      <p className="text-xs text-gray-500 mt-2">
                        Remember your preferences and settings for a personalized experience.
                      </p>
                    </div>
                    <div className="ml-6">
                      <button
                        onClick={() => handleToggle('personalization')}
                        className={`w-12 h-6 rounded-full flex items-center transition-all duration-200 ${
                          settings.personalization ? 'bg-gray-900' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                          settings.personalization ? 'transform translate-x-6' : 'transform translate-x-1'
                        }`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-6 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleRejectAll}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 text-xs font-medium text-gray-700 bg-transparent border border-gray-300 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
              >
                Reject All
              </button>
              
              <button
                onClick={handleAcceptAll}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 text-xs font-medium text-white bg-gray-900 border border-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
              >
                Accept All
              </button>
              
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3 text-xs font-medium text-white bg-black border border-black hover:bg-gray-800 hover:border-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
              >
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
