'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { User, Mail, Phone, Save, Edit2, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, isUpdatingProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Sync form data with user data when user changes
  useEffect(() => {
    if (user && !isEditing) {
      // Only update form data when not in edit mode to avoid conflicts
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, isEditing]);

  // Monitor error state changes (disabled in strict mode to prevent double execution)
  // useEffect(() => {
  //   console.log('Error state changed to:', error);
  //   if (error === '') {
  //     console.log('Error was cleared - this might be the problem!');
  //     console.trace('Stack trace of where error was cleared:');
  //   }
  // }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Don't clear general error automatically - let user see it until they submit
  };

  const resetForm = () => {
    setError('');
    setSuccess('');
    setFieldErrors({});
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Only send fields that have actually changed
    const changes = {};
    if (formData.firstName !== user?.firstName) {
      changes.firstName = formData.firstName;
    }
    if (formData.lastName !== user?.lastName) {
      changes.lastName = formData.lastName;
    }
    if (formData.email !== user?.email) {
      changes.email = formData.email;
    }
    if (formData.phone !== user?.phone) {
      changes.phone = formData.phone;
    }

    // Check if there are any changes
    if (Object.keys(changes).length === 0) {
      setSuccess('No changes were made to your profile.');
      setIsEditing(false);
      // Reset form after showing no changes message
      setTimeout(() => {
        resetForm();
      }, 3000);
      return;
    }

    try {
      const result = await updateProfile(changes);
      
      if (result.success) {
        // Only exit edit mode on successful update
        if (result.message === 'No changes to update') {
          setSuccess('No changes were made to your profile.');
        } else {
          setSuccess('Profile updated successfully!');
        }
        setIsEditing(false);
        // Reset form after successful update
        setTimeout(() => {
          resetForm();
        }, 3000);
      } else {
        // Stay in edit mode when there are errors so user can fix them
        // Handle field-specific errors first
        if (result.errors && Array.isArray(result.errors)) {
          const errors = {};
          let hasFieldErrors = false;
          console.log('result.errors', result.errors);
          result.errors.forEach(err => {
            if (err.field) {
              errors[err.field] = err.message;
              hasFieldErrors = true;
            }
          });
          console.log(hasFieldErrors);          
          if (hasFieldErrors) {
            setFieldErrors(errors);
            // Show a specific error message for email conflicts
            if (errors.email) {
              setError('Email address is already in use. Please choose a different email address.');
            } else {
              setError(result.error || 'Please fix the errors below');
            }
            // Don't exit edit mode so user can fix the errors
            return;
          }
        }
        
        // If no field-specific errors, show general error
        const errorMessage = result.error || result.message || 'Failed to update profile';
        
        // Check for specific error messages that might indicate email conflicts
        if (errorMessage.toLowerCase().includes('email') && 
            (errorMessage.toLowerCase().includes('taken') || 
             errorMessage.toLowerCase().includes('already') ||
             errorMessage.toLowerCase().includes('exists'))) {
          setFieldErrors({ email: 'This email address is already in use. Please choose a different email.' });
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred: ' + err.message);
    }
  };

  const handleEdit = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    
  };

  const handleCancel = () => {
    setIsEditing(false);
    resetForm();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your account profile information and settings.
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </button>
          )}
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  disabled={!isEditing}
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-900 ${
                    fieldErrors.firstName 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {fieldErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  disabled={!isEditing}
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-900 ${
                    fieldErrors.lastName 
                      ? 'border-red-300 focus:ring-red-500' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
              {fieldErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                id="email"
                required
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-900 ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                name="phone"
                id="phone"
                disabled={!isEditing}
                value={formData.phone}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 placeholder-gray-500 text-gray-900 ${
                  fieldErrors.phone 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            {fieldErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
