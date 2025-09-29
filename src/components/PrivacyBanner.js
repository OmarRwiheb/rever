'use client';

import { useState, useEffect } from 'react';
import PrivacySettingsModal from './PrivacySettingsModal';

export default function PrivacyBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const hasConsent = localStorage.getItem('privacy-consent');
    if (!hasConsent) {
      setIsVisible(true);
    }

    // Load Shopify Customer Privacy API
    loadShopifyPrivacyAPI();
  }, []);

  const loadShopifyPrivacyAPI = () => {
    // Wait for the Shopify Privacy Banner script to load
    if (typeof window !== 'undefined') {
      const checkForPrivacyBanner = () => {
        if (window.privacyBanner) {
          // Listen for consent changes
          document.addEventListener('trackingConsentAccepted', () => {
            // Handle consent accepted
          });
          
          document.addEventListener('trackingConsentDeclined', () => {
            // Handle consent declined
          });
        } else {
          // Retry after a short delay
          setTimeout(checkForPrivacyBanner, 100);
        }
      };
      
      checkForPrivacyBanner();
    }
  };

  const handleAcceptAll = async () => {
    setIsLoading(true);
    
    try {
      // Check if privacyBanner is available and is a function
      if (typeof window.privacyBanner === 'function') {
        window.privacyBanner({
          acceptAll: true
        });
      }
      
      // Store consent in localStorage
      localStorage.setItem('privacy-consent', 'accepted');
      localStorage.setItem('privacy-tracking', 'true');
      localStorage.setItem('privacy-analytics', 'true');
      localStorage.setItem('privacy-marketing', 'true');
      localStorage.setItem('privacy-personalization', 'true');
      
      setIsVisible(false);
    } catch (error) {
      // Still hide the banner even if there's an error
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectAll = async () => {
    setIsLoading(true);
    
    try {
      // Check if privacyBanner is available and is a function
      if (typeof window.privacyBanner === 'function') {
        window.privacyBanner({
          rejectAll: true
        });
      }
      
      // Store consent in localStorage
      localStorage.setItem('privacy-consent', 'rejected');
      localStorage.setItem('privacy-tracking', 'false');
      localStorage.setItem('privacy-analytics', 'false');
      localStorage.setItem('privacy-marketing', 'false');
      localStorage.setItem('privacy-personalization', 'false');
      
      setIsVisible(false);
    } catch (error) {
      // Still hide the banner even if there's an error
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomize = () => {
    setIsModalOpen(true);
  };

  const handleModalSave = (settings) => {
    // Update consent status based on settings
    const hasAnyTracking = settings.analytics || settings.marketing || settings.personalization;
    localStorage.setItem('privacy-consent', hasAnyTracking ? 'accepted' : 'rejected');
    setIsVisible(false);
  };

  return (
    <>
      {/* Privacy Banner */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* Privacy Notice Text */}
              <div className="flex-1">
                <h3 className="text-xl font-medium text-gray-900 mb-3 uppercase tracking-wider">
                  We value your privacy
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                  We use cookies and similar technologies to provide, protect, and improve our services. 
                  By clicking "Accept All", you consent to our use of cookies for analytics, personalization, 
                  and marketing purposes. You can customize your preferences or learn more in our{' '}
                  <a 
                    href="/privacy-policy" 
                    className="text-gray-900 hover:text-gray-700 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a 
                    href="/terms-of-service" 
                    className="text-gray-900 hover:text-gray-700 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  onClick={handleRejectAll}
                  disabled={isLoading}
                  className="px-8 py-3 text-xs font-medium text-gray-700 bg-transparent border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
                >
                  {isLoading ? 'Processing...' : 'Reject All'}
                </button>
                
                <button
                  onClick={handleCustomize}
                  disabled={isLoading}
                  className="px-8 py-3 text-xs font-medium text-white bg-gray-900 border border-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
                >
                  Customize
                </button>
                
                <button
                  onClick={handleAcceptAll}
                  disabled={isLoading}
                  className="px-8 py-3 text-xs font-medium text-white bg-black border border-black hover:bg-gray-800 hover:border-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 uppercase tracking-wider"
                >
                  {isLoading ? 'Processing...' : 'Accept All'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Settings Modal */}
      <PrivacySettingsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
}
