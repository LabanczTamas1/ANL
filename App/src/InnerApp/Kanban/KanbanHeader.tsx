import React from "react";

interface KanbanHeaderProps {
  isDeleteMode: boolean;
  onAddColumn: () => void;
  onToggleDeleteMode: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  isDeleteMode,
  onAddColumn,
  onToggleDeleteMode,
  searchQuery,
  setSearchQuery,
}) => (
  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2 gap-3">
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        onClick={onAddColumn}
        className="text-white px-4 py-2 rounded dark:text-white bg-[#65558F] hover:bg-blue-600 flex-grow sm:flex-grow-0"
      >
        Add Column
      </button>
      <button
        onClick={onToggleDeleteMode}
        className={`px-4 py-2 rounded ${
          isDeleteMode
            ? "bg-red-500 text-white"
            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
        } flex-grow sm:flex-grow-0`}
      >
        {isDeleteMode ? "Exit Delete Mode" : "Delete Column"}
      </button>
    </div>
    <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
      <input
        type="text"
        placeholder="Search cards..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65558F] dark:bg-[#1e1e1e] dark:text-white"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  </div>
);

export default KanbanHeader;
