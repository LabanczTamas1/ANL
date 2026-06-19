import React from "react";
import { LinkData } from "../../Types/types";
import { useLanguage } from "../../hooks/useLanguage";

interface Props {
  show: boolean;
  linkData: LinkData;
  setLinkData: (e: React.ChangeEvent<HTMLInputElement>) => void; // <-- place it here
  onInsert: () => void;
  onClose: () => void;
}

const LinkModal: React.FC<Props> = ({ show, linkData, setLinkData, onInsert, onClose }) => {
  const { t } = useLanguage();
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white dark:bg-[#1e1e1e] p-4 rounded-md shadow-lg w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t("linkModal.insertLink")}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("linkModal.url")}</label>
            <input
              type="url"
              value={linkData.url}
              onChange={setLinkData} // now type-safe
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("linkModal.urlPlaceholder")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t("linkModal.displayText")}</label>
            <input
              type="text"
              value={linkData.text}
              onChange={setLinkData} // also type-safe
              className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("linkModal.displayTextPlaceholder")}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-[#2a2a2a] hover:bg-gray-300 dark:hover:bg-[#333] rounded-md text-gray-800 dark:text-gray-200">
              {t("linkModal.cancel")}
            </button>
            <button onClick={onInsert} className="px-4 py-2 bg-[#65558F] hover:bg-opacity-90 rounded-md text-white transition-colors" disabled={!linkData.url}>
              {t("linkModal.insertLink")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;