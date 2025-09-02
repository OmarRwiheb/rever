/**
 * Utility functions for reCAPTCHA integration
 */

export const verifyRecaptcha = async (token, action = null) => {
  try {
    const response = await fetch('/api/recaptcha/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, action }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'reCAPTCHA verification failed');
    }

    return result;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    throw error;
  }
};

export const validateFormSubmission = async (executeRecaptcha, action = 'submit') => {
  if (!executeRecaptcha) {
    throw new Error('reCAPTCHA not available');
  }

  const token = await executeRecaptcha(action);
  return await verifyRecaptcha(token, action);
};
