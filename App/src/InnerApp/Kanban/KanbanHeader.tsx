import React, { useState } from "react";

interface KanbanHeaderProps {
  isDeleteMode: boolean;
  onAddColumn: () => void;
  onToggleDeleteMode: () => void;
  onOpenTemplateBuilder: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  isDeleteMode,
  onAddColumn,
  onToggleDeleteMode,
  onOpenTemplateBuilder,
  searchQuery,
  setSearchQuery,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAction = (cb: () => void) => {
    cb();
    setMenuOpen(false);
  };

  return (
    <div className="border-b py-3">
      {/* ── Top bar: always visible ── */}
      <div className="flex items-center gap-2">
        {/* Search — takes remaining space */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#65558F] dark:bg-[#1e1e1e] dark:text-white text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Desktop action buttons — hidden on mobile */}
        <div className="hidden sm:flex gap-2 shrink-0">
          <button
            onClick={onAddColumn}
            className="text-white px-4 py-2 rounded bg-[#65558F] hover:bg-blue-600 text-sm whitespace-nowrap"
          >
            Add Column
          </button>
          <button
            onClick={onOpenTemplateBuilder}
            className="text-white px-4 py-2 rounded bg-[#65558F] hover:bg-blue-600 text-sm whitespace-nowrap"
          >
            Templates
          </button>
          <button
            onClick={onToggleDeleteMode}
            className={`px-4 py-2 rounded text-sm whitespace-nowrap ${
              isDeleteMode
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            {isDeleteMode ? "Exit Delete Mode" : "Delete Column"}
          </button>
        </div>

        {/* Mobile menu toggle — hidden on desktop */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle actions menu"
          aria-expanded={menuOpen}
          className={`sm:hidden shrink-0 w-10 h-10 flex items-center justify-center rounded transition-colors text-lg ${
            menuOpen
              ? "bg-[#65558F] text-white"
              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white"
          }`}
        >
          {menuOpen ? "✕" : "⋮"}
        </button>
      </div>

      {/* ── Mobile action panel — animated slide-down ── */}
      <div
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-48 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleAction(onAddColumn)}
            className="flex flex-col items-center gap-1 px-2 py-3 rounded bg-[#65558F] text-white text-xs font-medium active:scale-95 transition-transform"
          >
            <span className="text-xl leading-none">＋</span>
            Add Column
          </button>
          <button
            onClick={() => handleAction(onOpenTemplateBuilder)}
            className="flex flex-col items-center gap-1 px-2 py-3 rounded bg-[#65558F] text-white text-xs font-medium active:scale-95 transition-transform"
          >
            <span className="text-xl leading-none">📋</span>
            Templates
          </button>
          <button
            onClick={() => handleAction(onToggleDeleteMode)}
            className={`flex flex-col items-center gap-1 px-2 py-3 rounded text-xs font-medium active:scale-95 transition-transform ${
              isDeleteMode
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            }`}
          >
            <span className="text-xl leading-none">{isDeleteMode ? "✕" : "🗑️"}</span>
            {isDeleteMode ? "Exit Delete" : "Delete Col"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanHeader;
