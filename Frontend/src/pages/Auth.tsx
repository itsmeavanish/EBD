import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import Card from '../components/Card';

const Auth: React.FC = () => {
  const [activeForm, setActiveForm] = useState<string | null>(null);

  const handleFormClick = (formName: string) => {
    setActiveForm(formName);
  };

  const handleBackToAuth = () => {
    setActiveForm(null);
  };

  const handleSwitchToLogin = () => {
    setActiveForm('Login');
  };

  const handleSwitchToSignup = () => {
    setActiveForm('Signup');
  };

  // Render specific form based on selection
  if (activeForm === 'Login') {
    return <LoginForm onBack={handleBackToAuth} onSwitchToSignup={handleSwitchToSignup} />;
  }

  if (activeForm === 'Signup') {
    return <SignupForm onBack={handleBackToAuth} onSwitchToLogin={handleSwitchToLogin} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Authentication</h1>
        <p className="text-lg text-gray-600">Sign in to your account or create a new one</p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Auth Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
        <Card 
          title="Sign In" 
          onClick={() => handleFormClick('Login')}
          className="bg-gradient-to-br from-blue-50 to-indigo-100"
        />
        <Card 
          title="Sign Up" 
          onClick={() => handleFormClick('Signup')}
          className="bg-gradient-to-br from-green-50 to-blue-100"
        />
      </div>
    </div>
  );
};

export default Auth;