'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Add classes to disable scrolling
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      
      // Fix body position and prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100%';
      
      // Prevent scroll events only on the body/document, not on modal content
      const preventScroll = (e) => {
        // Allow scrolling within modal content
        if (e.target.closest('.modal-content') || e.target.closest('.modal-scrollable')) {
          return true;
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      // Add event listeners with capture phase
      document.addEventListener('wheel', preventScroll, { passive: false, capture: true });
      document.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
      document.addEventListener('scroll', preventScroll, { passive: false, capture: true });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'PageUp' || e.key === 'PageDown' || e.key === ' ') {
          // Allow keyboard navigation within modal content
          if (e.target.closest('.modal-content') || e.target.closest('.modal-scrollable')) {
            return true;
          }
          e.preventDefault();
        }
      }, { passive: false, capture: true });
      
      return () => {
        document.removeEventListener('wheel', preventScroll, { capture: true });
        document.removeEventListener('touchmove', preventScroll, { capture: true });
        document.removeEventListener('scroll', preventScroll, { capture: true });
        document.removeEventListener('keydown', preventScroll, { capture: true });
      };
    } else {
      // Restore the scroll position
      const scrollY = document.body.style.top;
      
      // Remove all restrictions
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.documentElement.style.overflow = '';
      document.documentElement.style.height = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.height = '';
      
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onClose();
      setIsAnimating(false);
    }, 200);
  };

  const switchToSignup = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(false);
      setIsAnimating(false);
    }, 200);
  };

  const switchToLogin = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(true);
      setIsAnimating(false);
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-full items-start justify-center p-4 pt-8 pb-8">
        {/* Backdrop */}
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
            isAnimating ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={handleClose}
        />

        {/* Modal */}
        <div 
          className={`relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all duration-200 max-h-[90vh] ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div 
            className="modal-content modal-scrollable px-6 py-8 max-h-[calc(90vh-4rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {isLogin ? (
              <LoginForm 
                onSwitchToSignup={switchToSignup}
                onClose={handleClose}
              />
            ) : (
              <SignupForm 
                onSwitchToLogin={switchToLogin}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        html.modal-open {
          overflow: hidden !important;
          height: 100% !important;
        }
        
        body.modal-open {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        
        body.modal-open .modal-content {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        /* Allow scrolling only in modal content */
        body.modal-open .modal-scrollable {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
      `}</style>
    </div>
  );
}
