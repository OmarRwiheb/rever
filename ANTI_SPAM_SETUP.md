# Anti-Spam & Bot Protection Setup Guide

This guide will help you set up comprehensive anti-spam and bot protection for your website using Google reCAPTCHA v3 and additional security measures.

## 🛡️ Protection Features Implemented

### 1. Google reCAPTCHA v3
- **Invisible protection**: No user interaction required
- **Score-based**: Returns a score from 0.0 (bot) to 1.0 (human)
- **Action-specific**: Different actions for different forms
- **Server-side verification**: All tokens verified on the backend

### 2. Honeypot Fields
- **Hidden fields**: Invisible to users but filled by bots
- **Automatic detection**: Forms rejected if honeypot is filled
- **Zero user impact**: Completely transparent to legitimate users

### 3. Rate Limiting
- **Per-action limits**: Different limits for different form types
- **IP-based tracking**: Prevents abuse from single sources
- **Configurable windows**: Customizable time windows for limits

### 4. Form-Specific Protections
- Contact form: 3 submissions per 15 minutes
- Newsletter signup: 5 submissions per hour
- Login attempts: 5 attempts per 15 minutes
- User signup: 3 signups per hour
- Returns form: 2 submissions per hour

## 🚀 Setup Instructions

### Step 1: Get Google reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click "Create" to add a new site
3. Choose **reCAPTCHA v3**
4. Add your domain(s):
   - `localhost` (for development)
   - Your production domain
5. Accept the terms and create the site
6. Copy the **Site Key** and **Secret Key**

### Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Add your reCAPTCHA keys:
   ```env
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
   RECAPTCHA_SECRET_KEY=your_secret_key_here
   ```

3. Optionally adjust the score threshold:
   ```env
   RECAPTCHA_MIN_SCORE=0.5
   ```
   - `0.5` = Balanced (recommended)
   - `0.7` = More strict
   - `0.3` = More lenient

### Step 3: Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test each form:
   - Contact form (`/contact`)
   - Newsletter signup (footer and popup)
   - User login/signup
   - Returns form (`/returns`)

3. Check browser console for any errors
4. Verify reCAPTCHA is working by checking network requests

## 🔧 Configuration Options

### reCAPTCHA Score Threshold

The score threshold determines how strict the bot detection is:

- **0.9-1.0**: Very strict (may block some legitimate users)
- **0.7-0.8**: Strict (good for high-security applications)
- **0.5-0.6**: Balanced (recommended for most sites)
- **0.3-0.4**: Lenient (may allow some bots)
- **0.0-0.2**: Very lenient (not recommended)

### Rate Limiting

Default limits can be customized in `src/lib/rateLimit.js`:

```javascript
const options = {
  contact: { limit: 3, windowMs: 15 * 60 * 1000 },     // 3 per 15 min
  newsletter: { limit: 5, windowMs: 60 * 60 * 1000 },  // 5 per hour
  login: { limit: 5, windowMs: 15 * 60 * 1000 },       // 5 per 15 min
  signup: { limit: 3, windowMs: 60 * 60 * 1000 },      // 3 per hour
  returns: { limit: 2, windowMs: 60 * 60 * 1000 },     // 2 per hour
};
```

## 📊 Monitoring & Analytics

### reCAPTCHA Analytics

1. Visit your [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Select your site to view:
   - Request volume
   - Score distribution
   - Top actions
   - Error rates

### Server Logs

Monitor your server logs for:
- reCAPTCHA verification failures
- Rate limit violations
- Honeypot triggers

## 🚨 Troubleshooting

### Common Issues

1. **reCAPTCHA not loading**
   - Check if `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
   - Verify domain is added to reCAPTCHA console
   - Check browser console for errors

2. **Verification always failing**
   - Verify `RECAPTCHA_SECRET_KEY` is correct
   - Check server logs for verification errors
   - Ensure score threshold isn't too high

3. **Rate limiting too strict**
   - Adjust limits in `src/lib/rateLimit.js`
   - Consider different limits for different user types

4. **Forms not submitting**
   - Check browser console for JavaScript errors
   - Verify all required environment variables are set
   - Test with reCAPTCHA disabled temporarily

### Debug Mode

To debug reCAPTCHA issues, you can temporarily lower the score threshold:

```env
RECAPTCHA_MIN_SCORE=0.1
```

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Use HTTPS** in production for reCAPTCHA to work properly
3. **Monitor logs** regularly for suspicious activity
4. **Update score thresholds** based on your traffic patterns
5. **Consider additional measures** like IP blocking for persistent abusers

## 📈 Advanced Features

### Custom Actions

Each form uses a specific action for better analytics:

- `contact` - Contact form submissions
- `newsletter` - Newsletter signups
- `newsletter_popup` - Popup newsletter signups
- `login` - User login attempts
- `signup` - User registration
- `returns` - Return requests

### Honeypot Variations

The honeypot field is named `website` and is completely hidden. You can:
- Change the field name
- Add multiple honeypot fields
- Use different field types (email, phone, etc.)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for error messages
3. Test with a fresh browser session
4. Verify all environment variables are correctly set

For additional help, refer to:
- [Google reCAPTCHA Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
