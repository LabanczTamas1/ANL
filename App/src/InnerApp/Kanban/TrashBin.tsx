import React from "react";

interface TrashBinProps {
  provided: any;
  snapshot: any;
}

const TrashBin: React.FC<TrashBinProps> = ({ provided, snapshot }) => (
  <div
    ref={provided.innerRef}
    {...provided.droppableProps}
    className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center h-20 w-64 border-2 border-dashed rounded-lg z-40 ${
      snapshot.isDraggingOver
        ? "bg-red-200 border-red-500"
        : "bg-red-100 border-red-300"
    } transition-all duration-300`}
    style={{
      boxShadow: snapshot.isDraggingOver
        ? `\n                  0 0 200px 40px rgba(239, 68, 68, 0.4),\n                  0 0 600px 80px rgba(239, 68, 68, 0.3),\n                  0 0 1200px 120px rgba(239, 68, 68, 0.2),\n                  0 0 1800px 160px rgba(239, 68, 68, 0.1)\n                `
        : "0 -6px 16px rgba(252, 165, 165, 0.4)",
    }}
  >
    <div className="flex items-center justify-center pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 text-red-500 mr-2"
      >
        <path d="M3 6h18"></path>
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
      </svg>
      <p className="text-sm text-red-700">Drop column here to delete</p>
    </div>
    <div className="absolute inset-0">{provided.placeholder}</div>
  </div>
);

export default TrashBin;
