import React from 'react';
import Card from '../components/Card';
import { useNavigate } from 'react-router-dom';

const Forms: React.FC = () => {
  const navigate = useNavigate();
  const handleFormClick = (form:string) => {
    navigate(`/forms/${form}`);
  };

  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Forms Management</h1>
        <p className="text-lg text-gray-600">Access and manage all your business forms</p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card 
          title="Order Form" 
          onClick={() => handleFormClick('orderforms')}
        />
        <Card 
          title="Refund Form" 
          onClick={() => handleFormClick('refundforms')}
        />
       
        <Card 
          title="Technical Issues" 
          onClick={() => handleFormClick('Technical Issues')}
        />
      </div>
    </div>
  );
};

export default Forms;