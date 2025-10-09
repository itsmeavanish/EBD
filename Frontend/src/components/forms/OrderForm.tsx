import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload, Calendar } from 'lucide-react';

interface OrderFormData {
  orderId: string;
  price: string;
  screenshot: File | null;
  date: string;
  productName: string;
  address: string;
  otherAddress: string;
  reviewerName: string;
  mediatorName: string;
}

interface OrderFormProps {
  onBack: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onBack }) => {
  const { user, order } = useAuth();
  const [formData, setFormData] = useState<OrderFormData>({
    orderId: '',
    price: order ? order.price : '',
    screenshot: null,
    date: order ? order.date : '',
    productName: order ? order.productName : '',
    address: order ? order.address : '',
    otherAddress: '',
    reviewerName: '',
    mediatorName: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const productOptions = [
    'Alpha Mortal Sunscreen Aqua Gel SPF 50',
    'SEREKO Face Serum',
    'Beauty Product 1',
    'Beauty Product 2',
    'Skincare Item 1',
    'Skincare Item 2'
  ];

  const addressOptions = [
    'Ayush - Kanpur',
    'Vivek - Kanpur',
    'Anuj - Firozabad',
    'Anuj - Gorakhpur',
    'Rahul - Gurgaon',
    'Yash - Gurgaon',
    'Yash - Morena',
    'Shivam - Firozabad'
  ];

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
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
    let screenshotUrl = order?.screenshot || '';

    // Step 1: Upload screenshot if a new file is selected
    if (formData.screenshot) {
      const formDataImage = new FormData();
      formDataImage.append('screenshot', formData.screenshot);

      const uploadResponse = await fetch(
        'http://localhost:3001/api/auth/upload/screenshotupload',
        {
          method: 'POST',
          body: formDataImage,
        }
      );

      const uploadData = await uploadResponse.json();
      if (uploadData.success && uploadData.url) {
        screenshotUrl = uploadData.url; // get uploaded image URL
      } else {
        throw new Error('Screenshot upload failed');
      }
    }

    // Step 2: Update order via PUT
    const orderPayload = {
      orderId: formData.orderId,
      price: formData.price,
      date: formData.date,
      productName: formData.productName,
      address:
        formData.address === 'Other' ? formData.otherAddress : formData.address,
      reviewerName: formData.reviewerName,
      mediatorName: formData.mediatorName,
      screenshot: screenshotUrl,
      isPlaced: true,
      isAlloted: true,
    };

    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://localhost:3001/api/auth/orders/${order._id}`, // orderId as param
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (response.ok) {
      const data = await response.json();
      console.log('Updated order:', data.order);
      setSubmitStatus('success');
      // Reset form if needed
    } else {
      throw new Error('Failed to update order');
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cassidy 1.0 S8 Order Form</h1>
          <p className="text-gray-600">
            The name, email address and photo associated with your account will be recorded when you submit this form.
          </p>
          <p className="text-red-600 text-sm mt-2">* Indicates required question</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order ID */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Order ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.orderId}
              onChange={(e) => handleInputChange('orderId', e.target.value)}
              placeholder="Enter your order ID"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Price */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="Enter the price"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Ordered Screenshot <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Upload your order screenshot</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
                required
              />
              <label
                htmlFor="screenshot-upload"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
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

          {/* Date */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Product Name */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type='text'
              required
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />

            
          
          </div>

          {/* Address */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {addressOptions.map((address, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name="address"
                    value={address}
                    checked={formData.address === address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">{address}</span>
                </label>
              ))}
              <label className="flex items-center">
                <input
                  type="radio"
                  name="address"
                  value="Myself"
                  checked={formData.address === 'Myself'}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Myself</span>
              </label>
              <label className="flex items-start">
                <input
                  type="radio"
                  name="address"
                  value="Other"
                  checked={formData.address === 'Other'}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                />
                <div className="ml-3 flex-1">
                  <span className="text-gray-700">Other:</span>
                  {formData.address === 'Other' && (
                    <input
                      type="text"
                      value={formData.otherAddress}
                      onChange={(e) => handleInputChange('otherAddress', e.target.value)}
                      placeholder="Enter custom address"
                      className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Reviewer Name */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6">
            <label className="block text-lg font-medium text-gray-900 mb-4">
              Reviewer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.reviewerName}
              onChange={(e) => handleInputChange('reviewerName', e.target.value)}
              placeholder="Enter reviewer name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Order Form'}
            </button>

            {/* Status Messages */}
            {submitStatus === 'success' && (
              <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                Form submitted successfully! Your order has been recorded.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                Error submitting form. Please try again.
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;