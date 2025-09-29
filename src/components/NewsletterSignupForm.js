'use client';

import { useState } from 'react';
import { shopifyService } from '@/services/shopify/shopify';

export default function NewsletterSignupForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Call Shopify API directly
      const result = await shopifyService.subscribeToNewsletter(email.trim());
      
      if (result.success) {
        setIsSubmitted(true);
        setEmail('');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      } else {
        // Handle different error cases
        if (result.alreadyExists) {
          setError(
            <div className="text-sm">
              <p className="mb-2">{result.message}</p>
              <p className="text-gray-600">
                You can update your newsletter preferences in your{' '}
                <a
                  href="/account/profile"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  account settings
                </a>
                .
              </p>
            </div>
          );
        } else if (result.rateLimited) {
          setError(
            <div className="text-sm text-orange-600">
              <p className="mb-2">{result.message}</p>
              <p className="text-gray-600">Please wait a moment and try again.</p>
            </div>
          );
        } else {
          setError(result.message || 'Failed to subscribe to newsletter');
        }
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="w-full px-4 py-3 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 placeholder-gray-500 select-auto"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-white text-black font-medium rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap select-auto"
          >
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      ) : (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-green-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Thank you for subscribing!</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mt-3 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <p className="text-xs text-gray-400 mt-3 text-center">
        By subscribing, you agree to our Privacy Policy and Terms of Service.
      </p>
    </div>
  );
}
