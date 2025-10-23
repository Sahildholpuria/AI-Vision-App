
import React from 'react';

interface SpinnerProps {
  text?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ text = "Thinking..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
       <div className="w-12 h-12 border-4 border-t-purple-500 border-gray-600 rounded-full animate-spin"></div>
       <p className="text-purple-400 font-semibold">{text}</p>
    </div>
  );
};

export default Spinner;
