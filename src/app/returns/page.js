'use client';
import { useState } from 'react';
import { ArrowRight, Plus, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ReturnsPage() {
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    phoneNumber: '',
    items: [{ itemId: '', quantity: 1, reason: '' }],
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const returnReasons = [
    { value: 'not_as_described', label: 'Item not as described', icon: '📝' },
    { value: 'wrong_size', label: 'Wrong size', icon: '📏' },
    { value: 'defective', label: 'Defective/Damaged item', icon: '⚠️' },
    { value: 'changed_mind', label: 'Changed mind', icon: '💭' },
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
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { itemId: '', quantity: 1, reason: '' }]
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitMessage('Your return request has been submitted successfully. We will review your request and contact you within 1-2 business days.');
      
      // Reset form
      setFormData({
        orderNumber: '',
        email: '',
        phoneNumber: '',
        items: [{ itemId: '', quantity: 1, reason: '' }],
        additionalInfo: ''
      });
    } catch (error) {
      setSubmitMessage('There was an error submitting your request. Please try again or contact customer service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/10 rounded-lg">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Return Request</h1>
            </div>
            <p className="text-gray-300">
              We'll review your request and get back to you within 1-2 business days
            </p>
          </div>

          <div className="px-6 py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Order Number */}
                <div>
                  <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    name="orderNumber"
                    value={formData.orderNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    placeholder="e.g., #REV-12345"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* Items to Return */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Items to Return *
                    </label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-900">
                            Item {index + 1}
                          </h4>
                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Item ID */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Item ID (from invoice) *
                            </label>
                            <input
                              type="text"
                              value={item.itemId}
                              onChange={(e) => handleItemChange(index, 'itemId', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                              placeholder="Item ID from your invoice"
                            />
                          </div>

                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity *
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                              required
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Reason for Return */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Reason for Return *
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {returnReasons.map((reason) => (
                              <label
                                key={reason.value}
                                className={`flex items-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                                  item.reason === reason.value 
                                    ? 'border-gray-900 bg-white' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`reason-${index}`}
                                  value={reason.value}
                                  checked={item.reason === reason.value}
                                  onChange={(e) => handleItemChange(index, 'reason', e.target.value)}
                                  className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                  {reason.icon} {reason.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-colors"
                    placeholder="Please provide any additional details about your return request..."
                  />
                </div>
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div className={`max-w-2xl mx-auto p-6 rounded-xl ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {submitMessage.includes('successfully') ? (
                      <CheckCircle className="w-6 h-6 mr-3" />
                    ) : (
                      <AlertCircle className="w-6 h-6 mr-3" />
                    )}
                    <p className="font-medium">{submitMessage}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center px-8 py-3 font-medium rounded-lg transition-colors ${
                    isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Return Request
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Return Policy Information */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className="flex items-center mb-4">
                <AlertCircle className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Return Policy</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <p>• Returns must be requested within 30 days of delivery</p>
                  <p>• Items must be in original condition with tags attached</p>
                  <p>• Refunds will be processed within 5-7 business days after approval</p>
                </div>
                <div className="space-y-2">
                  <p>• Return shipping costs may apply depending on the reason for return</p>
                  <p>• Custom or personalized items cannot be returned</p>
                  <p>• We'll contact you within 1-2 business days to confirm your request</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
