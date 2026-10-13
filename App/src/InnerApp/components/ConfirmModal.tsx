import React from "react";
import { useLanguage } from "../../hooks/useLanguage";
import { Button, Text } from "@design-system/components";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  question: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  question,
  confirmText,
  cancelText,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-modal p-4">
      <div className="w-full max-w-sm rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-elevated shadow-elevated p-6">
        <Text className="font-medium mb-5">{question}</Text>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            {cancelText ?? t("confirmModal.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText ?? t("confirmModal.yes")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
