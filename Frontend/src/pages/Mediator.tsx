import React from 'react';
import Card from '../components/Card';

const Mediator: React.FC = () => {
  const handleMediatorClick = (itemName: string) => {
    console.log(`Accessing ${itemName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Mediator Portal</h1>
        <p className="text-lg text-gray-600">Conflict resolution and mediation tools</p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Mediator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card 
          title="Active Cases" 
          onClick={() => handleMediatorClick('Active Cases')}
        />
        <Card 
          title="Resolved Cases" 
          onClick={() => handleMediatorClick('Resolved Cases')}
        />
        <Card 
          title="Mediation Forms" 
          onClick={() => handleMediatorClick('Mediation Forms')}
        />
        <Card 
          title="Case Reports" 
          onClick={() => handleMediatorClick('Case Reports')}
        />
        <Card 
          title="Schedule Management" 
          onClick={() => handleMediatorClick('Schedule Management')}
        />
        <Card 
          title="Client Communications" 
          onClick={() => handleMediatorClick('Client Communications')}
        />
        <Card 
          title="Documentation Center" 
          onClick={() => handleMediatorClick('Documentation Center')}
        />
        <Card 
          title="Resource Library" 
          onClick={() => handleMediatorClick('Resource Library')}
        />
      </div>
    </div>
  );
};

export default Mediator;