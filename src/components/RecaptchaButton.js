'use client';

import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useState } from 'react';

export default function RecaptchaButton({ 
  children, 
  onClick, 
  action = 'submit',
  className = '',
  disabled = false,
  ...props 
}) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleClick = async (e) => {
    if (disabled || isVerifying) return;

    setIsVerifying(true);
    
    try {
      if (!executeRecaptcha) {
        console.warn('reCAPTCHA not available');
        onClick?.(e, null);
        return;
      }

      const token = await executeRecaptcha(action);
      onClick?.(e, token);
    } catch (error) {
      console.error('reCAPTCHA execution failed:', error);
      onClick?.(e, null);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={disabled || isVerifying}
      className={`${className} ${(disabled || isVerifying) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isVerifying ? 'Verifying...' : children}
    </button>
  );
}
