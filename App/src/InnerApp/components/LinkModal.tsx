import React from "react";
import { LinkData } from "../../Types/types";
import { useLanguage } from "../../hooks/useLanguage";
import GradientButton from "./GradientButton";

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-modal p-4">
      <div className="relative bg-surface-light dark:bg-surface-elevated border border-line dark:border-line-glass p-5 rounded-2xl shadow-elevated w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4 text-content dark:text-content-inverse">{t("linkModal.insertLink")}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-content-subtle dark:text-content-subtle-inverse mb-1">{t("linkModal.url")}</label>
            <input
              type="url"
              value={linkData.url}
              onChange={setLinkData} // now type-safe
              className="w-full p-2 border border-line dark:border-line-dark rounded-xl bg-surface-light dark:bg-surface-dark text-content dark:text-content-inverse placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
              placeholder={t("linkModal.urlPlaceholder")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-subtle dark:text-content-subtle-inverse mb-1">{t("linkModal.displayText")}</label>
            <input
              type="text"
              value={linkData.text}
              onChange={setLinkData} // also type-safe
              className="w-full p-2 border border-line dark:border-line-dark rounded-xl bg-surface-light dark:bg-surface-dark text-content dark:text-content-inverse placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand transition-shadow"
              placeholder={t("linkModal.displayTextPlaceholder")}
            />
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border border-line dark:border-line-dark text-content-subtle dark:text-content-subtle-inverse hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors">
              {t("linkModal.cancel")}
            </button>
            <GradientButton onClick={onInsert} disabled={!linkData.url}>
              {t("linkModal.insertLink")}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;