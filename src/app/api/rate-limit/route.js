import { NextResponse } from 'next/server';

// Simple in-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map();

export async function POST(request) {
  try {
    const { identifier, action, limit = 5, windowMs = 15 * 60 * 1000 } = await request.json(); // 15 minutes default

    if (!identifier || !action) {
      return NextResponse.json({ error: 'Identifier and action are required' }, { status: 400 });
    }

    const key = `${identifier}:${action}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing entries for this key
    const entries = rateLimitMap.get(key) || [];
    
    // Filter out old entries
    const recentEntries = entries.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentEntries.length >= limit) {
      const oldestEntry = Math.min(...recentEntries);
      const resetTime = oldestEntry + windowMs;
      
      return NextResponse.json({
        success: false,
        limit,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000)
      }, { status: 429 });
    }

    // Add current timestamp
    recentEntries.push(now);
    rateLimitMap.set(key, recentEntries);

    // Clean up old entries periodically (simple cleanup)
    if (Math.random() < 0.01) { // 1% chance
      for (const [mapKey, timestamps] of rateLimitMap.entries()) {
        const filtered = timestamps.filter(timestamp => timestamp > windowStart);
        if (filtered.length === 0) {
          rateLimitMap.delete(mapKey);
        } else {
          rateLimitMap.set(mapKey, filtered);
        }
      }
    }

    return NextResponse.json({
      success: true,
      limit,
      remaining: limit - recentEntries.length,
      resetTime: now + windowMs
    });

  } catch (error) {
    console.error('Rate limit check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
