import React from "react";
import ModalHeader from "./ModalHeader";
import { useLanguage } from "../../hooks/useLanguage";

interface AddCardModalProps {
  show: boolean;
  onClose: () => void;
  cardData: any;
  setCardData: (data: any) => void;
  onAddCard: () => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({
  show,
  onClose,
  cardData,
  setCardData,
  onAddCard,
}) => {
  const { t } = useLanguage();
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e1e] dark:text-white rounded-lg border-4 border-[#E5E6E7] shadow-lg w-full max-w-[723px] max-h-[90vh] flex flex-col overflow-hidden">
        <ModalHeader title={t("kanban.addCard")} onClose={onClose} />
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAddCard();
          }}
        >
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="card-name" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.cardName")}:</label>
            <input
              id="card-name"
              type="text"
              placeholder={t("kanban.cardName")}
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white hover:border-gray-300 dark:placeholder-gray-400 rounded-lg px-3 py-2"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="contact-name" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldContactName")}:</label>
            <input
              id="contact-name"
              type="text"
              placeholder={t("kanban.fieldContactName")}
              value={cardData.contactName}
              onChange={(e) => setCardData({ ...cardData, contactName: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="business-name" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldBusinessName")}:</label>
            <input
              id="business-name"
              type="text"
              placeholder={t("kanban.fieldBusinessName")}
              value={cardData.businessName}
              onChange={(e) => setCardData({ ...cardData, businessName: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="phone-number" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldPhone")}:</label>
            <input
              id="phone-number"
              type="text"
              placeholder={t("kanban.fieldPhone")}
              value={cardData.phoneNumber}
              onChange={(e) => setCardData({ ...cardData, phoneNumber: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="email" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldEmail")}:</label>
            <input
              id="email"
              type="text"
              placeholder={t("kanban.fieldEmail")}
              value={cardData.email}
              onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="website" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldWebsite")}:</label>
            <input
              id="website"
              type="text"
              placeholder={t("kanban.fieldWebsite")}
              value={cardData.website}
              onChange={(e) => setCardData({ ...cardData, website: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="instagram" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldInstagram")}:</label>
            <input
              id="instagram"
              type="text"
              placeholder={t("kanban.fieldInstagram")}
              value={cardData.instagram}
              onChange={(e) => setCardData({ ...cardData, instagram: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="facebook" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">{t("kanban.fieldFacebook")}:</label>
            <input
              id="facebook"
              type="text"
              placeholder={t("kanban.fieldFacebook")}
              value={cardData.facebook}
              onChange={(e) => setCardData({ ...cardData, facebook: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#2a2a2a] dark:text-white dark:placeholder-gray-400 hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          {/* Add more fields as needed */}
          <div className="flex flex-col sm:flex-row justify-between gap-3"></div>
          <div className="flex flex-row justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition"
            >
              {t("kanban.cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-[#65558F] text-white hover:bg-blue-600 transition"
            >
              {t("kanban.addCard")}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddCardModal;
