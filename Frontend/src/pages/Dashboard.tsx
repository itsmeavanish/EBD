import React from 'react';
import Card from '../components/Card';

const Dashboard: React.FC = () => {
  const handleDashboardClick = (itemName: string) => {
    console.log(`Accessing ${itemName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-xl font-medium text-purple-700 mb-4">Only for Heads</p>
        <p className="text-lg text-gray-600">Administrative dashboard with comprehensive controls</p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Current Status - Full Width */}
        <Card 
          title="Current Status" 
          onClick={() => handleDashboardClick('Current Status')}
          variant="wide"
          className="bg-gradient-to-r from-blue-50 to-purple-50"
        />
        
        <Card 
          title="Current Orders Form Status" 
          onClick={() => handleDashboardClick('Current Orders Form Status')}
        />
        <Card 
          title="Current Refunds Forms Status" 
          onClick={() => handleDashboardClick('Current Refunds Forms Status')}
        />
        <Card 
          title="MasterSheet" 
          onClick={() => handleDashboardClick('MasterSheet')}
        />
        <Card 
          title="Master Code Sheets" 
          onClick={() => handleDashboardClick('Master Code Sheets')}
        />
        <Card 
          title="Order forms" 
          onClick={() => handleDashboardClick('Order forms')}
        />
        <Card 
          title="Refund forms" 
          onClick={() => handleDashboardClick('Refund forms')}
        />
        <Card 
          title="Cancelled Orders" 
          onClick={() => handleDashboardClick('Cancelled Orders')}
        />
        <Card 
          title="Transactions" 
          onClick={() => handleDashboardClick('Transactions')}
        />
        <Card 
          title="All Sheets" 
          onClick={() => handleDashboardClick('All Sheets')}
        />
        <Card 
          title="Payments Store Details" 
          onClick={() => handleDashboardClick('Payments Store Details')}
        />
      </div>
    </div>
  );
};

export default Dashboard;