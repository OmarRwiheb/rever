'use client';

import { useState } from 'react';
import PasswordResetRequestForm from '@/components/auth/PasswordResetRequestForm';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

export default function ForgotPasswordPage() {
  const [currentView, setCurrentView] = useState('forgot-password');

  const handleBackToLogin = () => {
    setCurrentView('login');
  };

  const handleSwitchToSignup = () => {
    setCurrentView('signup');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  const handleClose = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {currentView === 'forgot-password' && (
            <PasswordResetRequestForm 
              onBackToLogin={handleBackToLogin}
              onClose={handleClose}
            />
          )}
          {currentView === 'login' && (
            <LoginForm 
              onSwitchToSignup={handleSwitchToSignup}
              onClose={handleClose}
            />
          )}
          {currentView === 'signup' && (
            <SignupForm 
              onSwitchToLogin={handleSwitchToLogin}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
