import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'reCAPTCHA token is required' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error('reCAPTCHA secret key not configured');
      return NextResponse.json({ error: 'reCAPTCHA not configured' }, { status: 500 });
    }

    // Verify the token with Google
    const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const verificationResult = await verificationResponse.json();

    if (!verificationResult.success) {
      console.error('reCAPTCHA verification failed:', verificationResult['error-codes']);
      return NextResponse.json({ 
        error: 'reCAPTCHA verification failed',
        details: verificationResult['error-codes']
      }, { status: 400 });
    }

    // Check if the action matches (if provided)
    if (action && verificationResult.action !== action) {
      console.error('reCAPTCHA action mismatch:', { expected: action, received: verificationResult.action });
      return NextResponse.json({ 
        error: 'reCAPTCHA action mismatch' 
      }, { status: 400 });
    }

    // Check score threshold (reCAPTCHA v3 returns a score from 0.0 to 1.0)
    const score = verificationResult.score || 0;
    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || '0.5');

    if (score < minScore) {
      console.warn('reCAPTCHA score too low:', { score, minScore });
      return NextResponse.json({ 
        error: 'reCAPTCHA score too low',
        score,
        minScore
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      score,
      action: verificationResult.action,
      hostname: verificationResult.hostname
    });

  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
