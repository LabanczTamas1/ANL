import React from "react";

interface ModalHeaderProps {
  title: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose }) => (
  <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 mb-4">
    <h2 className="text-lg md:text-xl font-bold dark:text-white truncate pr-4">
      {title}
    </h2>
    <button
      onClick={onClose}
      className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xl leading-none"
    >
      &times;
    </button>
  </div>
);

export default ModalHeader;
