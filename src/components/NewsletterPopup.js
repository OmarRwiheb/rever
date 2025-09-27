'use client';

import { useState, useEffect } from 'react';
import { shopifyService } from '@/services/shopify/shopify';

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('newsletter-popup-seen');
    if (!hasSeenPopup) {
      // Show popup after 1 second
      const timer = setTimeout(() => {
        setIsOpen(true);
        setIsAnimating(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

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
        localStorage.setItem('newsletter-popup-seen', 'true');
        
        // Close popup after 3 seconds
        setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            setIsOpen(false);
            setIsSubmitted(false);
            setEmail('');
          }, 300);
        }, 3000);
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
      console.error('Newsletter popup signup error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
      localStorage.setItem('newsletter-popup-seen', 'true');
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with enhanced blur and animation */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Main popup container with enhanced animations */}
      <div 
        className={`relative transform transition-all duration-300 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
          {/* Enhanced close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {!isSubmitted ? (
            <>
              {/* Enhanced header with gradient text and better spacing */}
              <div className="text-center px-8 pt-10 pb-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                  Stay in the Loop
                </h2>
                <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Be the first to discover our latest collections, exclusive drops, and member-only offers.
                </p>
              </div>

              {/* Enhanced form with better styling */}
              <div className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/10 focus:border-black transition-all duration-200 text-gray-900 placeholder-gray-400 bg-white hover:border-gray-300"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced submit button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 px-6 rounded-xl hover:bg-gray-800 active:bg-gray-900 transition-all duration-200 font-semibold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                  </button>
                </form>

                {/* Error message */}
                {error && (
                  <div className="mt-4 text-center">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}

                {/* Enhanced footer with better typography */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By subscribing, you agree to our{' '}
                    <a href="#" className="text-black hover:underline font-medium">Privacy Policy</a>
                    {' '}and{' '}
                    <a href="#" className="text-black hover:underline font-medium">Terms of Service</a>
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Enhanced success message with better animations */
            <div className="text-center py-12 px-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Welcome to the Family!
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                Thank you for subscribing! You'll be the first to know about our latest collections, exclusive offers, and fashion insights.
              </p>
              <div className="mt-6">
                <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                  <span>Subscription confirmed</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
