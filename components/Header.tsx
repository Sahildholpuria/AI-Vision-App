
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
            AI Vision
          </span>
        </h1>
        <p className="mt-2 text-lg text-gray-400">Your AI-Powered Image Playground</p>
      </div>
    </header>
  );
};

export default Header;