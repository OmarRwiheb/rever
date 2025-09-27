import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Rate limiting (simple in-memory store for development)
const rateLimitMap = new Map();

function rateLimit(ip, limit = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean old entries
  for (const [key, timestamp] of rateLimitMap.entries()) {
    if (timestamp < windowStart) {
      rateLimitMap.delete(key);
    }
  }
  
  // Check current IP
  const requests = Array.from(rateLimitMap.entries())
    .filter(([key, timestamp]) => key.startsWith(ip) && timestamp > windowStart)
    .length;
  
  if (requests >= limit) {
    return false;
  }
  
  // Add current request
  rateLimitMap.set(`${ip}-${now}`, now);
  return true;
}

// Email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

export async function POST(request) {
  console.log('Contact API called');
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
    console.log('Client IP:', ip);
    
    // Check rate limit
    if (!rateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);
    const { name, email, subject, message, website } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled.' },
        { status: 400 }
      );
    }

    // Check honeypot field
    if (website) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission detected.' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      subject: sanitizeInput(subject),
      message: sanitizeInput(message)
    };

    // Validate sanitized data length
    if (sanitizedData.name.length < 2 || sanitizedData.name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }

    if (sanitizedData.subject.length < 5 || sanitizedData.subject.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Subject must be between 5 and 200 characters.' },
        { status: 400 }
      );
    }

    if (sanitizedData.message.length < 10 || sanitizedData.message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'Message must be between 10 and 2000 characters.' },
        { status: 400 }
      );
    }

    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email configuration missing. Form data received:', sanitizedData);
      return NextResponse.json({
        success: true,
        message: 'Thank you for your message. We will get back to you within 24 hours.',
        debug: 'Email not configured - data logged to console'
      });
    }

    // Create email transporter
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      console.log('Email transporter created successfully');
    } catch (transporterError) {
      console.error('Failed to create email transporter:', transporterError);
      throw new Error(`Failed to create email transporter: ${transporterError.message}`);
    }

    // Email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${sanitizedData.name}</p>
          <p><strong>Email:</strong> ${sanitizedData.email}</p>
          <p><strong>Subject:</strong> ${sanitizedData.subject}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${sanitizedData.message}</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p>This message was sent from your website contact form.</p>
          <p>Submitted on: ${new Date().toLocaleString()}</p>
          <p>IP Address: ${ip}</p>
        </div>
      </div>
    `;

    const emailText = `
New Contact Form Submission

Contact Details:
- Name: ${sanitizedData.name}
- Email: ${sanitizedData.email}
- Subject: ${sanitizedData.subject}

Message:
${sanitizedData.message}

---
This message was sent from your website contact form.
Submitted on: ${new Date().toLocaleString()}
IP Address: ${ip}
    `;

    // Send email
    try {
      await transporter.sendMail({
        from: sanitizedData.email, // Use the user's email as the sender
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        replyTo: sanitizedData.email,
        subject: `Contact Form: ${sanitizedData.subject}`,
        text: emailText,
        html: emailHtml,
      });
      console.log('Email sent successfully to:', process.env.CONTACT_EMAIL || process.env.SMTP_USER);
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    // Skip confirmation email - only send notification to admin

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message. We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
