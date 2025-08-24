import React from 'react';

const HBMLogo = ({ className = "h-10", textSize = "text-2xl", showTagline = false }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Logo Icon */}
      <div className={`${className} aspect-square bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-lg`}>
        <svg 
          className="w-3/4 h-3/4 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-baseline space-x-1">
          <span className={`${textSize} font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent`}>
            HBM
          </span>
          <span className={`${textSize} font-light text-gray-700`}>
            Inspection
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-gray-500 mt-1">
            Professional Vehicle Inspection Services
          </span>
        )}
      </div>
    </div>
  );
};

export default HBMLogo;