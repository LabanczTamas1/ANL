import React from "react";

interface AddColumnModalProps {
  show: boolean;
  onClose: () => void;
  newColumnName: string;
  setNewColumnName: (name: string) => void;
  tagColor: string;
  setTagColor: (color: string) => void;
  onAddColumn: () => void;
}

const AddColumnModal: React.FC<AddColumnModalProps> = ({
  show,
  onClose,
  newColumnName,
  setNewColumnName,
  tagColor,
  setTagColor,
  onAddColumn,
}) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[400px] relative">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">Add column</h2>
        <button
          onClick={onClose}
          className="text-black px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-[red] transition absolute top-2 right-2"
        >
          X
        </button>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Column name</label>
          <input
            type="text"
            placeholder="Enter board name"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Tag color</label>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="color"
                id="colorPicker"
                value={tagColor || "#cc458f"}
                onChange={(e) => setTagColor(e.target.value)}
                className="w-10 h-10 border-none p-0 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            onClick={onAddColumn}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
          >
            + Add Board
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddColumnModal;
