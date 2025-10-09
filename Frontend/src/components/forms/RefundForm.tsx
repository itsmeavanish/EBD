import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload, Calendar } from 'lucide-react';

interface RefundFormData {
  orderId: string;
  refundAmount: string;
  reason: string;
  screenshot: File | null;
  date: string;
  productName: string;
  originalOrderDate: string;
  customerName: string;
  mediatorName: string;
}

interface RefundFormProps {
  onBack: () => void;
}

const RefundForm: React.FC<RefundFormProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<RefundFormData>({
    orderId: '',
    refundAmount: '',
    reason: '',
    screenshot: null,
    date: '',
    productName: '',
    originalOrderDate: '',
    customerName: '',
    mediatorName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const refundReasons = [
    'Product not as described',
    'Damaged during shipping',
    'Wrong item received',
    'Quality issues',
    'Changed mind',
    'Duplicate order',
    'Other'
  ];

  const productOptions = [
    'Alpha Mortal Sunscreen Aqua Gel SPF 50',
    'SEREKO Face Serum',
    'Beauty Product 1',
    'Beauty Product 2',
    'Skincare Item 1',
    'Skincare Item 2'
  ];

  const handleInputChange = (field: keyof RefundFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      screenshot: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'screenshot' && value) {
          submitData.append(key, value.toString());
        }
      });
      
      // Add user information
      if (user) {
        submitData.append('userId', user.id);
        submitData.append('userName', user.name);
        submitData.append('userEmail', user.email);
      }
      
      // Append file if exists
      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }

      // Submit to backend API
      const token = localStorage.getItem('token');
      const refundData=new FormData();
      refundData.append('orderId',formData.orderId);
      refundData.append('refundAmount',formData.refundAmount);
      refundData.append('screenshot',formData.screenshot as Blob);
      const response1 = await fetch('https://ebd-mocha.vercel.app/api/refunds/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: refundData
      });
      if(response1.ok){
        console.log("Refund data submitted successfully");
      }else{
        throw new Error('Failed to submit refund data');
      }
      const response = await fetch('https://ebd-mocha.vercel.app/api/verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      if (response.ok) {
        setSubmitStatus('success');
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            orderId: '',
            refundAmount: '',
            reason: '',
            screenshot: null,
            date: '',
            productName: '',
            originalOrderDate: '',
            customerName: '',
            mediatorName: ''
          });
          setSubmitStatus('idle');
        }, 3000);
      } else {
        throw new Error('Failed to submit refund form');
      }
    } catch (error) {
      console.error('Error submitting refund form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Forms
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Request Form</h1>
          <p className="text-gray-600">
            Please fill out this form to request a refund for your order.
          </p>
          <p className="text-red-600 text-sm mt-2">* Indicates required question</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order ID */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Original Order ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.orderId}
              onChange={(e) => handleInputChange('orderId', e.target.value)}
              placeholder="Enter the original order ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Refund Amount */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Refund Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.refundAmount}
              onChange={(e) => handleInputChange('refundAmount', e.target.value)}
              placeholder="Enter the refund amount"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Refund Reason */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Reason for Refund <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="">Select a reason</option>
              {refundReasons.map((reason, index) => (
                <option key={index} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Product Name */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Product Name <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            >
              <option value="">Choose the product</option>
              {productOptions.map((product, index) => (
                <option key={index} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          {/* Original Order Date */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Original Order Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.originalOrderDate}
                onChange={(e) => handleInputChange('originalOrderDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Screenshot Upload */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Order Screenshot <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload your original order screenshot</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="refund-screenshot-upload"
                required
              />
              <label
                htmlFor="refund-screenshot-upload"
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
              {formData.screenshot && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {formData.screenshot.name}
                </p>
              )}
            </div>
          </div>

          {/* Customer Name */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="Enter customer name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Mediator Name */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Mediator Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.mediatorName}
              onChange={(e) => handleInputChange('mediatorName', e.target.value)}
              placeholder="Enter mediator name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
            </button>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Refund request submitted successfully! We will process your request shortly.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Error submitting refund request. Please try again.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RefundForm;