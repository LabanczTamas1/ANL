import React from "react";
import { LinkData } from "../../Types/types";
import { useLanguage } from "../../hooks/useLanguage";
import { Button, Heading, Input, Label } from "@design-system/components";

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
      <div className="relative w-full max-w-md rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-elevated p-5 shadow-elevated">
        <Heading level={3} className="mb-4">{t("linkModal.insertLink")}</Heading>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="link-url">{t("linkModal.url")}</Label>
            <Input
              id="link-url"
              name="url"
              type="url"
              value={linkData.url}
              onChange={setLinkData}
              placeholder={t("linkModal.urlPlaceholder")}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link-text">{t("linkModal.displayText")}</Label>
            <Input
              id="link-text"
              name="text"
              type="text"
              value={linkData.text}
              onChange={setLinkData}
              placeholder={t("linkModal.displayTextPlaceholder")}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={onClose}>
              {t("linkModal.cancel")}
            </Button>
            <Button onClick={onInsert} disabled={!linkData.url}>
              {t("linkModal.insertLink")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkModal;