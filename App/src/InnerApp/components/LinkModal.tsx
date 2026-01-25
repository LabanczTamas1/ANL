import React from "react";
import { LinkData } from "../../Types/types";

interface Props {
  show: boolean;
  linkData: LinkData;
  setLinkData: (e: React.ChangeEvent<HTMLInputElement>) => void; // <-- place it here
  onInsert: () => void;
  onClose: () => void;
}

const LinkModal: React.FC<Props> = ({ show, linkData, setLinkData, onInsert, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-md shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
            <input
              type="url"
              value={linkData.url}
              onChange={setLinkData} // now type-safe
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Text (optional)</label>
            <input
              type="text"
              value={linkData.text}
              onChange={setLinkData} // also type-safe
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Click here"
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800">
              Cancel
            </button>
            <button onClick={onInsert} className="px-4 py-2 bg-[#65558F] hover:bg-blue-600 rounded-md text-white" disabled={!linkData.url}>
              Insert Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;