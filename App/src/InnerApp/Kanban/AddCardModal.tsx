import React from "react";

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
  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-[#1e1e1e] dark:text-white p-4 sm:p-6 rounded-lg border-4 border-[#E5E6E7] shadow-lg w-full max-w-[723px] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">Add Card</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAddCard();
          }}
        >
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="card-name" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Card Name:</label>
            <input
              id="card-name"
              type="text"
              placeholder="Card Name"
              value={cardData.name}
              onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="contact-name" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Contact Name:</label>
            <input
              id="contact-name"
              type="text"
              placeholder="Contact Name"
              value={cardData.contactName}
              onChange={(e) => setCardData({ ...cardData, contactName: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="business-name" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Business Name:</label>
            <input
              id="business-name"
              type="text"
              placeholder="Business Name"
              value={cardData.businessName}
              onChange={(e) => setCardData({ ...cardData, businessName: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="phone-number" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Phone number:</label>
            <input
              id="phone-number"
              type="text"
              placeholder="Phone number"
              value={cardData.phoneNumber}
              onChange={(e) => setCardData({ ...cardData, phoneNumber: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="email" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Email:</label>
            <input
              id="email"
              type="text"
              placeholder="Email"
              value={cardData.email}
              onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="website" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Website:</label>
            <input
              id="website"
              type="text"
              placeholder="Website"
              value={cardData.website}
              onChange={(e) => setCardData({ ...cardData, website: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="instagram" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Instagram:</label>
            <input
              id="instagram"
              type="text"
              placeholder="Instagram"
              value={cardData.instagram}
              onChange={(e) => setCardData({ ...cardData, instagram: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
            />
          </div>
          <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
            <label htmlFor="facebook" className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0">Facebook:</label>
            <input
              id="facebook"
              type="text"
              placeholder="Facebook"
              value={cardData.facebook}
              onChange={(e) => setCardData({ ...cardData, facebook: e.target.value })}
              className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
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
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-[#65558F] text-white hover:bg-blue-600 transition"
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;
