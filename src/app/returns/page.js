'use client';
import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { validateFormSubmission } from '@/lib/recaptcha';
import { ArrowRight, Plus, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReturnsPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    phoneNumber: '',
    items: [{ itemId: '', quantity: 1 }],
    reason: '',
    additionalInfo: '',
    instapay: '',
    // Honeypot field - should remain empty
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');



  const returnReasons = [
    { value: 'not_as_described', label: 'Item not as described', icon: '📝' },
    { value: 'wrong_size', label: 'Wrong size', icon: '📏' },
    { value: 'defective', label: 'Defective/Damaged item', icon: '⚠️' },
    { value: 'quality_issues', label: 'Quality issues', icon: '🔍' },
    { value: 'fit_issues', label: 'Not satisfied with fit', icon: '👕' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: field === 'itemId' ? parseInt(value) || '' : value 
        } : item
      )
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1 }]
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
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

      // Validate all required fields
      if (!formData.orderNumber || !formData.email || !formData.phoneNumber || !formData.instapay || !formData.reason || !formData.additionalInfo) {
        setSubmitMessage('Please fill in all required fields.');
        return;
      }

      // Validate items
      for (const item of formData.items) {
        if (!item.itemId || !item.quantity || item.quantity < 1) {
          setSubmitMessage('Please fill in all item details with valid values.');
          return;
        }
      }

      // Verify reCAPTCHA
      // const recaptchaToken = await executeRecaptcha('returns');

      // Prepare data for API
      const submitData = {
        orderNumber: formData.orderNumber,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        items: formData.items,
        reason: formData.reason,
        additionalInfo: formData.additionalInfo,
        instapay: formData.instapay,
        // recaptchaToken
      };

      // Submit to API
      console.log('Submitting to:', window.location.origin + '/api/returns');
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Include details in error message if available
        let errorMsg = result.error || 'Failed to submit return request';
        if (result.details) {
          errorMsg += `\n\nDetails: ${JSON.stringify(result.details, null, 2)}`;
        }
        throw new Error(errorMsg);
      }
      
      // Show success message with any warnings
      let successMessage = 'Your return request has been submitted successfully. We will review your request and contact you within 1-2 business days.';
      if (result.warning) {
        successMessage += ` (Note: ${result.warning})`;
      }
      setSubmitMessage(successMessage);
      
      // Reset form
      setFormData({
        orderNumber: '',
        email: '',
        phoneNumber: '',
        items: [{ itemId: '', quantity: 1 }],
        reason: '',
        additionalInfo: '',
        instapay: '',
        website: ''
      });
    } catch (error) {
      console.error('Returns form submission error:', error);
      
      // Show the actual error message to help with debugging
      let errorMessage = `Error: ${error.message}`;
      
      setSubmitMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-medium text-gray-900 mb-4">Return Request</h1>
          <p className="text-gray-600">
            We'll review your request and get back to you within 1-2 business days
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Order Number */}
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Order Number *
              </label>
              <input
                type="text"
                id="orderNumber"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                placeholder="e.g., #REV-12345"
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

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                placeholder="+201123456789"
              />
            </div>

            {/* Instapay Field */}
            <div>
              <label htmlFor="instapay" className="block text-sm font-medium text-gray-900 mb-2">
                Instapay Phone Number *
              </label>
              <input
                type="text"
                id="instapay"
                name="instapay"
                value={formData.instapay}
                onChange={handleInputChange}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                 placeholder="+201123456789"
              />
            </div>

            {/* Items to Return */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <label className="block text-sm font-medium text-gray-900">
                  Items to Return *
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-8">
                {formData.items.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-sm font-medium text-gray-900">
                        Item {index + 1}
                      </h4>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Item ID */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Item ID (from invoice) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.itemId}
                          onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                          required
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                          placeholder="Item ID from your invoice"
                        />
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          required
                          className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reason for Return */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-4">
                Reason for Return *
              </label>
              <div className="space-y-3">
                {returnReasons.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-start cursor-pointer transition-colors ${
                      formData.reason === reason.value 
                        ? 'text-gray-900' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={formData.reason === reason.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                      className="h-4 w-4 text-gray-900 focus:ring-0 border-gray-300 mt-0.5 mr-3 flex-shrink-0 accent-gray-900"
                    />
                    <span className="text-sm leading-5">
                      {reason.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-900 mb-2">
                Additional Information *
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleInputChange}
                rows={4}
                required
                className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent resize-none text-gray-900 placeholder-gray-500"
                placeholder="Please provide any additional details about your return request..."
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
                submitMessage.includes('successfully') 
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                <div className="text-sm whitespace-pre-wrap">{submitMessage}</div>
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
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </form>

          {/* Return Policy Information */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Return Policy</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Returns must be requested within 10 days of delivery</p>
              <p>• Items must be in original condition with tags attached</p>
              <p>• Refunds will be processed within 5-7 business days after approval</p>
              <p>• Return shipping costs may apply depending on the reason for return</p>
              <p>• Custom or personalized items cannot be returned</p>
              <p>• We'll contact you within 1-2 business days to confirm your request</p>
              <p>• Refunds will be processed through Instapay only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
