import React from 'react'

interface TooltipProps {
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => (
    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-sm rounded-md shadow-lg px-3 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
      {text}
    </div>
  );

export default Tooltip
