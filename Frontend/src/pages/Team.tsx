import React from 'react';
import Card from '../components/Card';

const Team: React.FC = () => {
  const handleTeamClick = (teamName: string) => {
    console.log(`Accessing ${teamName}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Team Sheets</h1>
        <p className="text-lg text-gray-600">Access team-specific documentation and resources</p>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mt-4"></div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card 
          title="Team TANII" 
          onClick={() => handleTeamClick('Team TANII')}
        />
        <Card 
          title="Team TSGII" 
          onClick={() => handleTeamClick('Team TSGII')}
        />
        <Card 
          title="Team TASII" 
          onClick={() => handleTeamClick('Team TASII')}
        />
        <Card 
          title="Team TDBII" 
          onClick={() => handleTeamClick('Team TDBII')}
        />
        <Card 
          title="Team TSTII" 
          onClick={() => handleTeamClick('Team TSTII')}
        />
        <Card 
          title="Team TJGII" 
          onClick={() => handleTeamClick('Team TJGII')}
        />
        <Card 
          title="Team TSUII" 
          onClick={() => handleTeamClick('Team TSUII')}
        />
        <Card 
          title="Team TARII" 
          onClick={() => handleTeamClick('Team TARII')}
        />
      </div>
    </div>
  );
};

export default Team;