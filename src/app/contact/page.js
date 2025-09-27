'use client';
import { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { validateFormSubmission } from '@/lib/recaptcha';

export default function ContactPage() {
  const { user } = useUser();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    subject: '',
    message: '',
    // Honeypot field - should remain empty
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Check honeypot field
      if (formData.website) {
        console.log('Bot detected - honeypot field filled');
        setSubmitMessage('Invalid submission detected.');
        return;
      }

      // Verify reCAPTCHA
      // await validateFormSubmission(executeRecaptcha, 'contact');

      // Submit to API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(result.message);
        // Reset form
        setFormData({
          name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
          email: user?.email || '',
          subject: '',
          message: '',
          website: ''
        });
      } else {
        setSubmitMessage(result.error || 'There was an error sending your message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      setSubmitMessage('There was an error sending your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">Contact Us</h1>
          <p className="text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900 mb-2">
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                placeholder="What is this about?"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                required
                rows={6}
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent resize-none text-gray-900 placeholder-gray-500"
                placeholder="Tell us more about your inquiry..."
              />
            </div>

            {/* Honeypot field - hidden from users */}
            <div style={{ display: 'none' }}>
              <label htmlFor="website">Website (leave blank)</label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                tabIndex="-1"
                autoComplete="off"
              />
            </div>

            {/* Submit Message */}
            {submitMessage && (
              <div className={`text-center py-4 ${
                submitMessage.includes('Thank you')
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                <p className="text-sm">{submitMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full max-w-xs py-3 font-medium transition-colors ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>

          {/* Contact Information */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Other Ways to Reach Us</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Email: support@tag.com</p>
              <p>• Phone: +1 (555) 123-4567</p>
              <p>• Business Hours: Monday - Friday, 9AM - 6PM EST</p>
              <p>• Response Time: We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
