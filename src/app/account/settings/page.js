'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Shield, Bell, Globe, Key, Save, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateProfile } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: user?.acceptMarketing || false,
    orderUpdates: true,
    newProducts: false,
    language: 'en',
    currency: 'USD'
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '24h'
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSecurityChange = (key, value) => {
    setSecurity(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const result = await updateProfile({ 
        acceptMarketing: preferences.marketingEmails,
        preferences 
      });
      if (result.success) {
        setSuccess('Preferences updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update preferences');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Mock security update - will be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Security settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Preferences Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Bell className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Preferences</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account preferences and communication settings.
              </p>
            </div>
          </div>

          <form onSubmit={handlePreferencesSubmit} className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Order updates and shipping</p>
                    <p className="text-sm text-gray-500">Receive notifications about your orders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={(e) => handlePreferenceChange('orderUpdates', e.target.checked)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">New products and collections</p>
                    <p className="text-sm text-gray-500">Be the first to know about new arrivals</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.newProducts}
                    onChange={(e) => handlePreferenceChange('newProducts', e.target.checked)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Marketing communications</p>
                    <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.marketingEmails}
                    onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                    className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Language and Currency */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Security</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account security settings and authentication preferences.
              </p>
            </div>
          </div>

          <form onSubmit={handleSecuritySubmit} className="space-y-6">
            {/* Two-Factor Authentication */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Enable 2FA</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <input
                  type="checkbox"
                  checked={security.twoFactorAuth}
                  onChange={(e) => handleSecurityChange('twoFactorAuth', e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Login Alerts */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Login Alerts</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email notifications for new logins</p>
                  <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
                </div>
                <input
                  type="checkbox"
                  checked={security.loginAlerts}
                  onChange={(e) => handleSecurityChange('loginAlerts', e.target.checked)}
                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Session Timeout */}
            <div>
              <label htmlFor="sessionTimeout" className="block text-sm font-medium text-gray-700 mb-2">
                Session Timeout
              </label>
              <select
                id="sessionTimeout"
                value={security.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="1h">1 hour</option>
                <option value="4h">4 hours</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                How long to keep you logged in before requiring re-authentication
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Key className="h-6 w-6 text-gray-400" />
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Account Actions</h3>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account and data.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Change Password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Download Data</p>
                <p className="text-sm text-gray-500">Export your account data</p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200">
                Download
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and data</p>
              </div>
              <button className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-900 transition-colors duration-200">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
