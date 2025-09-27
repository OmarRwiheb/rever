# Email Configuration Setup

This guide will help you set up email functionality for the contact form.

## Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com
CONTACT_EMAIL=contact@yourdomain.com
```

## Gmail Setup (Recommended)

### 1. Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

### 2. Generate App Password
1. Go to Google Account settings
2. Navigate to Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this password as `SMTP_PASS`

### 3. Update Environment Variables
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=your-gmail@gmail.com
CONTACT_EMAIL=contact@yourdomain.com
```

## Other Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Testing the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the contact page**:
   - Navigate to `http://localhost:3000/contact`

3. **Fill out and submit the form**:
   - Enter test data
   - Submit the form

4. **Check your email**:
   - You should receive two emails:
     - One notification email (to CONTACT_EMAIL)
     - One confirmation email (to the user's email)

## Features

### Security
- ✅ Rate limiting (5 requests per 15 minutes per IP)
- ✅ Honeypot field to catch bots
- ✅ Input sanitization and validation
- ✅ reCAPTCHA integration
- ✅ Email format validation

### Email Features
- ✅ HTML and text email formats
- ✅ Automatic confirmation email to user
- ✅ Professional email templates
- ✅ Reply-to functionality
- ✅ IP address logging for security

### Error Handling
- ✅ Comprehensive validation
- ✅ User-friendly error messages
- ✅ Server-side error logging
- ✅ Graceful fallbacks

## Troubleshooting

### Common Issues

1. **"Authentication failed" error**
   - Check your SMTP credentials
   - Ensure 2FA is enabled for Gmail
   - Use app password instead of regular password

2. **"Connection timeout" error**
   - Check SMTP_HOST and SMTP_PORT
   - Verify firewall settings
   - Try different port (465 for SSL)

3. **Emails not received**
   - Check spam folder
   - Verify CONTACT_EMAIL is correct
   - Check SMTP_FROM is valid

4. **Rate limiting issues**
   - Wait 15 minutes before trying again
   - Check if multiple requests were made

### Debug Mode

To see detailed error information:
1. Check your terminal where Next.js is running
2. Look for error messages in the console
3. Check browser developer tools for network errors

## Production Considerations

### Security
- Use environment variables for all sensitive data
- Consider using a dedicated email service (SendGrid, Mailgun, etc.)
- Implement proper rate limiting
- Add email validation and sanitization

### Performance
- Consider using a queue system for high-volume sites
- Implement email templates caching
- Add monitoring and logging

### Compliance
- Ensure GDPR compliance for email collection
- Add unsubscribe functionality if needed
- Implement proper data retention policies
