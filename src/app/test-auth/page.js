'use client';

import { useUser } from '@/contexts/UserContext';
import { useState } from 'react';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, login, logout } = useUser();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');

  const handleTestLogin = async () => {
    const result = await login(testEmail, testPassword);
    console.log('Login result:', result);
  };

  const handleTestLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-gray-900 mb-4">User Management Test Page</h1>
          <p className="text-lg text-gray-600">
            This page is for testing the user management UI components
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Authentication Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Authentication Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAuthenticated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              
              {isAuthenticated && user && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">User Information:</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Phone:</strong> {user.phone || 'Not provided'}</p>
                    <p><strong>Addresses:</strong> {user.addresses?.length || 0}</p>
                    <p><strong>Orders:</strong> {user.orders?.length || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-medium text-gray-900 mb-4">Test Controls</h2>
            <div className="space-y-4">
              {!isAuthenticated ? (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Test Login</h3>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder-gray-500"
                    />
                    <button
                      onClick={handleTestLogin}
                      className="w-full bg-gray-900 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors duration-200"
                    >
                      Test Login
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Test Logout</h3>
                  <button
                    onClick={handleTestLogout}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
                  >
                    Test Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="mt-12 bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">Navigation Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/account/profile"
              className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <h3 className="font-medium text-gray-900">Profile</h3>
              <p className="text-sm text-gray-500">Manage your personal information</p>
            </a>
            <a
              href="/account/orders"
              className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <h3 className="font-medium text-gray-900">Orders</h3>
              <p className="text-sm text-gray-500">View your order history</p>
            </a>
            <a
              href="/account/addresses"
              className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <h3 className="font-medium text-gray-900">Addresses</h3>
              <p className="text-sm text-gray-500">Manage shipping addresses</p>
            </a>
            <a
              href="/account/settings"
              className="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200"
            >
              <h3 className="font-medium text-gray-900">Settings</h3>
              <p className="text-sm text-gray-500">Account preferences and security</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
