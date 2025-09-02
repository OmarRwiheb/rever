/**
 * Rate limiting utility functions
 */

export const checkRateLimit = async (identifier, action, options = {}) => {
  const { limit = 5, windowMs = 15 * 60 * 1000 } = options; // 15 minutes default

  try {
    const response = await fetch('/api/rate-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        action,
        limit,
        windowMs
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
      }
      throw new Error(result.error || 'Rate limit check failed');
    }

    return result;
  } catch (error) {
    console.error('Rate limit check error:', error);
    throw error;
  }
};

export const getClientIdentifier = (req) => {
  // Try to get IP from various headers (for production with proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
  return ip;
};

export const getRateLimitOptions = (action) => {
  const options = {
    contact: { limit: 3, windowMs: 15 * 60 * 1000 }, // 3 submissions per 15 minutes
    newsletter: { limit: 5, windowMs: 60 * 60 * 1000 }, // 5 submissions per hour
    login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    signup: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 signups per hour
    returns: { limit: 2, windowMs: 60 * 60 * 1000 }, // 2 returns per hour
  };

  return options[action] || { limit: 5, windowMs: 15 * 60 * 1000 };
};
