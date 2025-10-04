'use client';
import { useState } from 'react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { validateFormSubmission } from '@/lib/recaptcha';
import { ArrowRight, Plus, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReturnsPage() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [requestType, setRequestType] = useState(''); // 'return' or 'exchange'
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    phoneNumber: '',
    items: [{ productName: '', size: '', color: '', quantity: 1 }],
    reason: '',
    customReason: '',
    additionalInfo: '',
    instapay: '',
    // Honeypot field - should remain empty
    website: ''
  });
  const [exchangeFormData, setExchangeFormData] = useState({
    orderNumber: '',
    email: '',
    phoneNumber: '',
    items: [{ productName: '', size: '', color: '', quantity: 1 }],
    reason: '',
    customReason: '',
    additionalInfo: '',
    exchangeTo: [{ productName: '', size: '', color: '', quantity: 1 }]
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

  const exchangeReasons = [
    { value: 'wrong_size', label: 'Wrong size', icon: '📏' },
    { value: 'different_color', label: 'Different color', icon: '🎨' },
    { value: 'style_preference', label: 'Style preference', icon: '👔' },
    { value: 'fit_issues', label: 'Fit issues', icon: '👕' },
    { value: 'other', label: 'Other', icon: '❓' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExchangeInputChange = (e) => {
    const { name, value } = e.target;
    setExchangeFormData(prev => ({
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
          [field]: field === 'quantity' ? parseInt(value) || 1 : value 
        } : item
      )
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', size: '', color: '', quantity: 1 }]
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

  const handleExchangeItemChange = (index, field, value) => {
    setExchangeFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: field === 'quantity' ? parseInt(value) || 1 : value 
        } : item
      )
    }));
  };

  const handleAddExchangeItem = () => {
    setExchangeFormData(prev => ({
      ...prev,
      items: [...prev.items, { productName: '', size: '', color: '', quantity: 1 }]
    }));
  };

  const handleRemoveExchangeItem = (index) => {
    if (exchangeFormData.items.length > 1) {
      setExchangeFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const handleExchangeToItemChange = (index, field, value) => {
    setExchangeFormData(prev => ({
      ...prev,
      exchangeTo: prev.exchangeTo.map((item, i) => 
        i === index ? { 
          ...item, 
          [field]: field === 'quantity' ? parseInt(value) || 1 : value 
        } : item
      )
    }));
  };

  const handleAddExchangeToItem = () => {
    setExchangeFormData(prev => ({
      ...prev,
      exchangeTo: [...prev.exchangeTo, { productName: '', size: '', color: '', quantity: 1 }]
    }));
  };

  const handleRemoveExchangeToItem = (index) => {
    if (exchangeFormData.exchangeTo.length > 1) {
      setExchangeFormData(prev => ({
        ...prev,
        exchangeTo: prev.exchangeTo.filter((_, i) => i !== index)
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

      // Validate custom reason if "other" is selected
      if (formData.reason === 'other' && !formData.customReason.trim()) {
        setSubmitMessage('Please provide a custom reason.');
        return;
      }

      // Validate items
      for (const item of formData.items) {
        if (!item.productName || !item.size || !item.color || !item.quantity || item.quantity < 1) {
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
        reason: formData.reason === 'other' ? formData.customReason : formData.reason,
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
        items: [{ productName: '', size: '', color: '', quantity: 1 }],
        reason: '',
        customReason: '',
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

  const handleExchangeSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Validate all required fields
      if (!exchangeFormData.orderNumber || !exchangeFormData.email || !exchangeFormData.phoneNumber || !exchangeFormData.reason || !exchangeFormData.additionalInfo) {
        setSubmitMessage('Please fill in all required fields.');
        return;
      }

      // Validate custom reason if "other" is selected
      if (exchangeFormData.reason === 'other' && !exchangeFormData.customReason.trim()) {
        setSubmitMessage('Please provide a custom reason.');
        return;
      }

      // Validate items
      for (const item of exchangeFormData.items) {
        if (!item.productName || !item.size || !item.color || !item.quantity || item.quantity < 1) {
          setSubmitMessage('Please fill in all item details with valid values.');
          return;
        }
      }

      // Validate exchangeTo items
      for (const item of exchangeFormData.exchangeTo) {
        if (!item.productName || !item.size || !item.color || !item.quantity || item.quantity < 1) {
          setSubmitMessage('Please fill in all exchange-to item details with valid values.');
          return;
        }
      }

      // Prepare data for API
      const submitData = {
        orderNumber: exchangeFormData.orderNumber,
        email: exchangeFormData.email,
        phoneNumber: exchangeFormData.phoneNumber,
        items: exchangeFormData.items,
        reason: exchangeFormData.reason === 'other' ? exchangeFormData.customReason : exchangeFormData.reason,
        additionalInfo: exchangeFormData.additionalInfo,
        exchangeTo: exchangeFormData.exchangeTo
      };

      // Submit to API
      console.log('Submitting exchange to:', window.location.origin + '/api/exchange');
      const response = await fetch('/api/exchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Include details in error message if available
        let errorMsg = result.error || 'Failed to submit exchange request';
        if (result.details) {
          errorMsg += `\n\nDetails: ${JSON.stringify(result.details, null, 2)}`;
        }
        throw new Error(errorMsg);
      }
      
      // Show success message with any warnings
      let successMessage = 'Your exchange request has been submitted successfully. We will review your request and contact you within 1-2 business days.';
      if (result.warning) {
        successMessage += ` (Note: ${result.warning})`;
      }
      setSubmitMessage(successMessage);
      
      // Reset form
      setExchangeFormData({
        orderNumber: '',
        email: '',
        phoneNumber: '',
        items: [{ productName: '', size: '', color: '', quantity: 1 }],
        reason: '',
        customReason: '',
        additionalInfo: '',
        exchangeTo: [{ productName: '', size: '', color: '', quantity: 1 }]
      });
    } catch (error) {
      console.error('Exchange form submission error:', error);
      
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
          <h1 className="text-3xl font-medium text-gray-900 mb-4">
            {requestType === 'return' ? 'Return Request' : requestType === 'exchange' ? 'Exchange Request' : 'Return or Exchange Request'}
          </h1>
          <p className="text-gray-600">
            We'll review your request and get back to you within 1-2 business days
          </p>
        </div>

        {/* Request Type Selection */}
        {!requestType && (
          <div className="mb-12">
            <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">What would you like to do?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setRequestType('return')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-colors text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                    <RefreshCw className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Return Items</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Return items for a full refund. Items must be in original condition with tags attached.
                </p>
              </button>

              <button
                onClick={() => setRequestType('exchange')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 transition-colors text-left group"
              >
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                    <ArrowRight className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Exchange Items</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Exchange items for different size, color, or style. We'll help you find the perfect fit.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Back Button */}
        {requestType && (
          <div className="mb-8">
            <button
              onClick={() => setRequestType('')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to selection
            </button>
          </div>
        )}

        <div>
          {/* Return Form */}
          {requestType === 'return' && (
            <>
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
                    Instapay Number / Username *
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
                          {/* Product Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Cotton T-Shirt"
                            />
                          </div>

                          {/* Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Size *
                            </label>
                            <input
                              type="text"
                              value={item.size}
                              onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., M, L, XL"
                            />
                          </div>

                          {/* Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Color *
                            </label>
                            <input
                              type="text"
                              value={item.color}
                              onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Black, White, Blue"
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
                          onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value, customReason: '' }))}
                          className="h-4 w-4 text-gray-900 focus:ring-0 border-gray-300 mt-0.5 mr-3 flex-shrink-0 accent-gray-900"
                        />
                        <span className="text-sm leading-5">
                          {reason.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Custom Reason Input */}
                  {formData.reason === 'other' && (
                    <div className="mt-4">
                      <label htmlFor="customReason" className="block text-sm font-medium text-gray-900 mb-2">
                        Please specify your reason *
                      </label>
                      <input
                        type="text"
                        id="customReason"
                        name="customReason"
                        value={formData.customReason}
                        onChange={handleInputChange}
                        required
                        className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Please describe your reason for return..."
                      />
                    </div>
                  )}
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
                  <p>• Returns must be requested within 7 days of delivery</p>
                  <p>• Items must be in original condition with tags attached</p>
                  <p>• Refunds will be processed within 5-7 business days after approval</p>
                  <p>• Return shipping costs may apply depending on the reason for return</p>
                  <p>• We'll contact you within 1-2 business days to confirm your request</p>
                  <p>• Refunds will be processed through Instapay only</p>
                </div>
              </div>
            </>
          )}

          {/* Exchange Form */}
          {requestType === 'exchange' && (
            <>
              <form onSubmit={handleExchangeSubmit} className="space-y-8">
                {/* Order Number */}
                <div>
                  <label htmlFor="exchangeOrderNumber" className="block text-sm font-medium text-gray-900 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    id="exchangeOrderNumber"
                    name="orderNumber"
                    value={exchangeFormData.orderNumber}
                    onChange={handleExchangeInputChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                    placeholder="e.g., #REV-12345"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="exchangeEmail" className="block text-sm font-medium text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="exchangeEmail"
                    name="email"
                    value={exchangeFormData.email}
                    onChange={handleExchangeInputChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="exchangePhoneNumber" className="block text-sm font-medium text-gray-900 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="exchangePhoneNumber"
                    name="phoneNumber"
                    value={exchangeFormData.phoneNumber}
                    onChange={handleExchangeInputChange}
                    required
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                    placeholder="+201123456789"
                  />
                </div>

                {/* Items to Exchange */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <label className="block text-sm font-medium text-gray-900">
                      Items You're Returning *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddExchangeItem}
                      className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-8">
                    {exchangeFormData.items.map((item, index) => (
                      <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-sm font-medium text-gray-900">
                            Item {index + 1}
                          </h4>
                          {exchangeFormData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExchangeItem(index)}
                              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Product Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleExchangeItemChange(index, 'productName', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Cotton T-Shirt"
                            />
                          </div>

                          {/* Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Size *
                            </label>
                            <input
                              type="text"
                              value={item.size}
                              onChange={(e) => handleExchangeItemChange(index, 'size', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., M, L, XL"
                            />
                          </div>

                          {/* Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Color *
                            </label>
                            <input
                              type="text"
                              value={item.color}
                              onChange={(e) => handleExchangeItemChange(index, 'color', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Black, White, Blue"
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
                              onChange={(e) => handleExchangeItemChange(index, 'quantity', parseInt(e.target.value))}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Exchange To Items */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <label className="block text-sm font-medium text-gray-900">
                      Items You Want Instead *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddExchangeToItem}
                      className="text-sm text-gray-600 hover:text-gray-900 underline transition-colors"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-8">
                    {exchangeFormData.exchangeTo.map((item, index) => (
                      <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-sm font-medium text-gray-900">
                            Item {index + 1}
                          </h4>
                          {exchangeFormData.exchangeTo.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveExchangeToItem(index)}
                              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Product Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Product Name *
                            </label>
                            <input
                              type="text"
                              value={item.productName}
                              onChange={(e) => handleExchangeToItemChange(index, 'productName', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Cotton T-Shirt"
                            />
                          </div>

                          {/* Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Size *
                            </label>
                            <input
                              type="text"
                              value={item.size}
                              onChange={(e) => handleExchangeToItemChange(index, 'size', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., M, L, XL"
                            />
                          </div>

                          {/* Color */}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Color *
                            </label>
                            <input
                              type="text"
                              value={item.color}
                              onChange={(e) => handleExchangeToItemChange(index, 'color', e.target.value)}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                              placeholder="e.g., Black, White, Blue"
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
                              onChange={(e) => handleExchangeToItemChange(index, 'quantity', parseInt(e.target.value))}
                              required
                              className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reason for Exchange */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">
                    Reason for Exchange *
                  </label>
                  <div className="space-y-3">
                    {exchangeReasons.map((reason) => (
                      <label
                        key={reason.value}
                        className={`flex items-start cursor-pointer transition-colors ${
                          exchangeFormData.reason === reason.value 
                            ? 'text-gray-900' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason.value}
                          checked={exchangeFormData.reason === reason.value}
                          onChange={(e) => setExchangeFormData(prev => ({ ...prev, reason: e.target.value, customReason: '' }))}
                          className="h-4 w-4 text-gray-900 focus:ring-0 border-gray-300 mt-0.5 mr-3 flex-shrink-0 accent-gray-900"
                        />
                        <span className="text-sm leading-5">
                          {reason.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  
                  {/* Custom Reason Input */}
                  {exchangeFormData.reason === 'other' && (
                    <div className="mt-4">
                      <label htmlFor="exchangeCustomReason" className="block text-sm font-medium text-gray-900 mb-2">
                        Please specify your reason *
                      </label>
                      <input
                        type="text"
                        id="exchangeCustomReason"
                        name="customReason"
                        value={exchangeFormData.customReason}
                        onChange={handleExchangeInputChange}
                        required
                        className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Please describe your reason for exchange..."
                      />
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="exchangeAdditionalInfo" className="block text-sm font-medium text-gray-900 mb-2">
                    Additional Information *
                  </label>
                  <textarea
                    id="exchangeAdditionalInfo"
                    name="additionalInfo"
                    value={exchangeFormData.additionalInfo}
                    onChange={handleExchangeInputChange}
                    rows={4}
                    required
                    className="w-full px-0 py-2 border-0 border-b border-gray-300 focus:outline-none focus:border-gray-900 transition-colors bg-transparent resize-none text-gray-900 placeholder-gray-500"
                    placeholder="Please provide any additional details about your exchange request..."
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
                    {isSubmitting ? 'Submitting...' : 'Submit Exchange Request'}
                  </button>
                </div>
              </form>

              {/* Exchange Policy Information */}
              <div className="mt-16 pt-8 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Exchange Policy</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Items must be in original condition with tags attached</p>
                  <p>• We'll contact you within 1-2 business days to confirm your exchange</p>
                  <p>• Exchanges will be processed within 5-7 business days after approval</p>
                  <p>• Exchange shipping costs may apply based on the reason</p>
                  <p>• Price differences will be handled separately</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}