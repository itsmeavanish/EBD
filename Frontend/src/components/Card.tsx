import React from 'react';

interface CardProps {
  title: string;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'wide';
}

const Card: React.FC<CardProps> = ({ title, onClick, className = '', variant = 'default' }) => {
  return (
    <div
      className={`
        ${variant === 'wide' ? 'col-span-2' : ''} 
        bg-white/90 backdrop-blur-sm rounded-2xl p-8 
        border-2 border-purple-200 hover:border-purple-300
        shadow-lg hover:shadow-xl
        transform hover:scale-105 hover:-translate-y-1
        transition-all duration-300 ease-out
        cursor-pointer group
        ${className}
      `}
      onClick={onClick}
    >
      <h3 className="text-xl font-semibold text-gray-800 text-center group-hover:text-purple-700 transition-colors duration-200">
        {title}
      </h3>
    </div>
  );
};

export default Card;