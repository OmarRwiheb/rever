'use client';

import { useState, useEffect } from 'react';

export const usePrivacySettings = () => {
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    personalization: false
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const loadSettings = () => {
      const savedSettings = {
        necessary: true, // Always true
        analytics: localStorage.getItem('privacy-analytics') === 'true',
        marketing: localStorage.getItem('privacy-marketing') === 'true',
        personalization: localStorage.getItem('privacy-personalization') === 'true'
      };
      
      setSettings(savedSettings);
      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    
    // Save to localStorage
    Object.keys(newSettings).forEach(key => {
      if (key !== 'necessary') {
        localStorage.setItem(`privacy-${key}`, newSettings[key].toString());
      }
    });

    // Update Shopify Privacy Banner API
    if (typeof window !== 'undefined' && typeof window.privacyBanner === 'function') {
      const hasAnyTracking = newSettings.analytics || newSettings.marketing || newSettings.personalization;
      window.privacyBanner({
        acceptAll: hasAnyTracking,
        rejectAll: !hasAnyTracking,
        customSettings: newSettings
      });
    }
  };

  const hasConsent = () => {
    return localStorage.getItem('privacy-consent') === 'accepted';
  };

  const canTrack = (type = 'analytics') => {
    if (!isLoaded) return false;
    
    switch (type) {
      case 'analytics':
        return settings.analytics;
      case 'marketing':
        return settings.marketing;
      case 'personalization':
        return settings.personalization;
      default:
        return settings.analytics || settings.marketing || settings.personalization;
    }
  };

  const resetConsent = () => {
    localStorage.removeItem('privacy-consent');
    localStorage.removeItem('privacy-analytics');
    localStorage.removeItem('privacy-marketing');
    localStorage.removeItem('privacy-personalization');
    
    setSettings({
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false
    });
  };

  return {
    settings,
    isLoaded,
    updateSettings,
    hasConsent,
    canTrack,
    resetConsent
  };
};
