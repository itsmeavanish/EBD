import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload, Calendar,CheckCircle, Circle as XCircle,  AlertCircle } from 'lucide-react';

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
  reviewScreenshot: File | null;
  sellerScreenshot: File | null;
}

interface RefundFormProps {
  onBack: () => void;
}

const RefundFormWithVerification: React.FC<RefundFormProps> = ({ onBack }) => {
  const { user, order } = useAuth();
  console.log('Current Order from AuthContext:', order);

  // ✅ Pre-fill known fields from your given order object
  const [formData, setFormData] = useState<RefundFormData>({
    orderId: order?.orderId || "",
    refundAmount: order?.price?.toString() || "",
    reason: '',
    screenshot: null,
    reviewScreenshot: null,
    sellerScreenshot: null,
    date: new Date().toISOString().split('T')[0],
    productName: order?.productName || "",
    originalOrderDate: order?.date ? new Date(order.date).toISOString().split('T')[0] : "",
    customerName: order?.reviewerName || "",
    mediatorName: order?.mediatorName || ""
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [verifiedData, setVerifiedData] = useState<any>(null);

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
    setVerificationStatus('idle');
  };

  const handleFileChange = (field: keyof RefundFormData) => 
  (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, [field]: file }));
    setVerificationStatus('idle');
  };
  const handleVerifyScreenshot = async () => {
    if (!formData.screenshot || !formData.orderId || !formData.refundAmount) {
      alert('Please fill in Order ID, Refund Amount, and upload a screenshot first');
      return;
    }
   setIsVerifying(true);
    setVerificationStatus('idle');

    try {

      const verifyData = new FormData();
      verifyData.append('screenshot', formData.screenshot);
      verifyData.append('orderId', formData.orderId); // ✅ backend now uses orderNumber
      verifyData.append('refundAmount', formData.refundAmount);
      
      const token = localStorage.getItem('token');
      const response = await fetch('https://ebd-mocha.vercel.app/api/refunds/verify-screenshot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: verifyData
      });
      const result = await response.json();
      console.log('Verification response:', result);
      if (result.success && result.verified) {
        setVerificationStatus('success');
        setVerificationMessage('Screenshot verified successfully!');
        setVerifiedData(result.extractedData);
      } else {
        setVerificationStatus('failed');
        setVerificationMessage(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Error verifying screenshot:', error);
      setVerificationStatus('failed');
      setVerificationMessage('Error verifying screenshot. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationStatus !== 'success') {
      alert('Please verify the screenshot first before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const submitData = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'screenshot' && value) {
          submitData.append(key, value.toString());
        }
      });

      if (user) {
        submitData.append('userId', user.id);
        submitData.append('userName', user.name);
        submitData.append('userEmail', user.email);
      }

      if (formData.screenshot) {
        submitData.append('screenshot', formData.screenshot);
      }
      if (formData.reviewScreenshot) {
        submitData.append('reviewScreenshot', formData.reviewScreenshot);
      }

      if (formData.sellerScreenshot) {
        submitData.append('sellerScreenshot', formData.sellerScreenshot);
      }

      submitData.append('verified', 'true');
      submitData.append('extractedOrderNumber', verifiedData?.orderNumber || '');
      submitData.append('extractedPrice', verifiedData?.price || '');

      const token = localStorage.getItem('token');
      const response = await fetch('https://ebd-mocha.vercel.app/api/refunds/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      if (response.ok) {
        setSubmitStatus('success');
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
            mediatorName: '',
            reviewScreenshot: null,
            sellerScreenshot: null
          });
          setVerificationStatus('idle');
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Please fill out this form to request a refund. Screenshot verification is required.
          </p>
          <p className="text-red-600 text-sm mt-2">* Indicates required question</p>
        </div>

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

  {/* Invoice Upload */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
    <label className="block text-lg font-medium text-gray-900 mb-4">
      Invoice Image <span className="text-red-500">*</span>
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">Upload your original Invoice Image</p>

      <input
        type="file"
        name="screenshot"
        accept="image/*"
        onChange={handleFileChange('screenshot')}
        className="hidden"
        id="refund-screenshot-upload"
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

  {/* Review Screenshot */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
    <label className="block text-lg font-medium text-gray-900 mb-4">
      Review Screenshot <span className="text-red-500">*</span>
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">Upload your original review screenshot</p>

      <input
        type="file"
        name="reviewScreenshot"
        accept="image/*"
        onChange={handleFileChange('reviewScreenshot')}
        className="hidden"
        id="review-screenshot-upload"
      />
      <label
        htmlFor="review-screenshot-upload"
        className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
      >
        Choose File
      </label>

      {formData.reviewScreenshot && (
        <p className="mt-2 text-sm text-green-600">
          Selected: {formData.reviewScreenshot.name}
        </p>
      )}
    </div>
  </div>

  {/* Seller Screenshot */}
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
    <label className="block text-lg font-medium text-gray-900 mb-4">
      Seller Feedback <span className="text-red-500">*</span>
    </label>
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">Upload your original order screenshot</p>

      <input
        type="file"
        name="sellerScreenshot"
        accept="image/*"
        onChange={handleFileChange('sellerScreenshot')}
        className="hidden"
        id="Seller-screenshot-upload"
      />
      <label
        htmlFor="Seller-screenshot-upload"
        className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer transition-colors"
      >
        Choose File
      </label>

      {formData.sellerScreenshot && (
        <p className="mt-2 text-sm text-green-600">
          Selected: {formData.sellerScreenshot.name}
        </p>
      )}
    </div>
  </div>

  {/* Verify Button */}
  {formData.screenshot && formData.orderId && formData.refundAmount && (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
      <button
        type="button"
        onClick={handleVerifyScreenshot}
        disabled={isVerifying}
        className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all ${
          isVerifying
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
        }`}
      >
        {isVerifying ? 'Verifying...' : 'Verify Screenshot'}
      </button>

      {verificationStatus === 'success' && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {verificationMessage}
        </div>
      )}
      {verificationStatus === 'failed' && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
          <XCircle className="w-5 h-5 mr-2" />
          {verificationMessage}
        </div>
      )}
    </div>
  )}

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

  {/* Customer & Mediator Names */}
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
    {verificationStatus !== 'success' && (
      <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        Please verify your screenshot before submitting the refund request
      </div>
    )}

    <button
      type="submit"
      disabled={isSubmitting || verificationStatus !== 'success'}
      className={`w-full py-4 px-6 rounded-lg font-medium text-white transition-all ${
        isSubmitting || verificationStatus !== 'success'
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:scale-105'
      }`}
    >
      {isSubmitting ? 'Submitting...' : 'Submit Refund Request'}
    </button>

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

export default RefundFormWithVerification;
