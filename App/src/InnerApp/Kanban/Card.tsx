import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import CardMessageSection from "./CardMessageSection";
import axios from "axios";
import { FiMessageSquare } from "react-icons/fi";
import timeAgo from "./../../utils/calculateTimeAgo"

interface CardProps {
  card: {
    id: string;
    name: string;
    ContactName: string;
    BusinessName: string;
    phoneNumber: string;
    email: string;
    website: string;
    instagram: string;
    facebook: string;
    DateOfAdded: string;
    firstContact: string;
    isCommented: boolean;
  };
  columnId: string;
  index: number;
  onDeleteCard: (columnId: string, cardId: string) => void;
}

type CardKey = keyof CardProps["card"]; // Union type of all keys in card

const Card: React.FC<CardProps> = ({ card, columnId, index, onDeleteCard }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardData, setCardData] = useState(card); // Initialize with the full card object
  const [isEditing, setIsEditing] = useState<CardKey | null>(null); // Track which field is being edited
  const [value, setValue] = useState<string | boolean>(cardData.name); // Track the value of the input being edited
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  console.log("Thats my Card!!!-------------------", card);
  // console.log("Objecting", cardData, Object.keys(cardData));

  const keyOrder = [
    "id",
    "Facebook",
    "Email",
    "Instagram",
    "IsCommented",
    "Website",
    "ColumnId",
    "BusinessName",
    "ContactName",
    "FirstContact",
    "DateOfAdded",
    "PhoneNumber",
  ];

  console.log("Card data as reordered-:", cardData.DateOfAdded);
  const reorderedObject = keyOrder.reduce((acc, key) => {
    if (key in cardData) {
      acc[key] = cardData[key as keyof typeof cardData]; // Type assertion here
    }
    return acc;
  }, {} as Record<string, unknown>);

  // console.log("Reordered",reorderedObject, Object.keys(reorderedObject));
  // Open and Close Modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Handle delete confirmation modal
  const handleOpenDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the main modal from closing
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = () => {
    onDeleteCard(columnId, card.id); // Call delete function
    setIsDeleteModalOpen(false); // Close delete confirmation modal
    handleCloseModal(); // Close the main modal
  };

  // Handle click on the input field to start editing
  const handleClick = (key: CardKey) => {
    setIsEditing(key);
    setValue(cardData[key] as string); // Initialize the value of the input field
  };

  // Handle changes in input fields
  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]:
        name === "isCommented" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle saving updates for a field
  const handleSave = async (key: CardKey) => {
    const updatedValue = value;

    try {
      // Get the token for authentication
      const token = localStorage.getItem("authToken");

      // Send the updated value to the backend
      const response = await axios.put(
        `${API_BASE_URL}/api/cards/${card.id}`,
        { name: key, updatedValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Update success:", response.data);

      setCardData((prevData) => ({
        ...prevData,
        [key]: updatedValue,
      }));

      // Reset editing state
      setIsEditing(null);
    } catch (error) {
      console.error("Error updating field:", error);
    } finally {
      // You can also reset the value state here if necessary
      // setValue(cardData[key]);  // Reset to original value if needed
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    if (isEditing) {
      setValue(cardData[isEditing]);
    }
  };

  const extractBaseUrl = (url: string): string => {
    try {
      // Match the URL starting with http or https and stopping at the closing bracket ']'
      const urlMatch = url.match(/https?:\/\/[^\s\]]+/);
      if (urlMatch) {
        return urlMatch[0]; // Return the full matched URL, including path but excluding ']'
      }
      return "";
    } catch (error) {
      console.error("Invalid URL:", error);
      return "";
    }
  };

  const formatDate = (timestamp: string | null | boolean): string => {
    if (!timestamp) return "No date available";

    const date = new Date(Number(timestamp)); // Convert string to number
    const today = new Date();

    // Check if the date is today
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    if (isToday) {
      // Format as time for "delivered today"
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    // Format as "YYYY. MMM DD." for other dates
    return `${date.getFullYear()}. ${date.toLocaleString("en-US", {
      month: "short",
    })} ${date.getDate()}.`;
  };

  // Delete confirmation modal content
  const deleteModalContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-[60] overflow-auto"
      onClick={(e) => {
        e.stopPropagation(); // Prevent clicks from reaching the main modal
        handleCloseDeleteModal();
      }}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg p-6 w-[30vw] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Confirm Deletion</h2>
        <p className="text-center mb-6">
          Are you really want to delete this card?
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmDelete}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
          <button
            onClick={handleCloseDeleteModal}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Modal content
const modalContent = (
  <div
    className="fixed inset-0 bg-gray-800 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 overflow-auto p-4"
    onClick={handleCloseModal}
  >
    <div
      className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 pb-[80px] w-full sm:w-4/5 md:w-3/4 lg:w-[40vw] max-h-[90vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={handleCloseModal}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 text-2xl md:text-4xl"
      >
        &times;
      </button>
      <h2 className="text-lg md:text-xl font-bold mb-4 dark:text-white">
        {cardData.BusinessName}
      </h2>

      <div className="space-y-4 md:space-y-6">
        {Object.keys(reorderedObject)
          .slice(0, 10)
          .map((key) => {
            const cardKey = key as CardKey;

            return cardKey === "id" ? null : cardKey === "isCommented" ? (
              <div key={cardKey} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                </label>
                <input
                  type="checkbox"
                  name={cardKey}
                  checked={cardData[cardKey] as boolean}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            ) : cardKey.toLowerCase() === "instagram" ||
              cardKey.toLowerCase() === "facebook" ||
              cardKey.toLowerCase() === "website" ? (
              <div
                key={cardKey}
                className="flex flex-col sm:flex-row sm:items-center w-full mb-4"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                  {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                </label>
                <div className="flex items-center space-x-2 w-full sm:w-3/4">
                  <div className="relative w-full">
                    <input
                      type="text"
                      name={cardKey}
                      value={
                        isEditing === cardKey
                          ? (value as string)
                          : extractBaseUrl(cardData[cardKey] as string)
                      }
                      onChange={(e) => setValue(e.target.value)}
                      onClick={() => handleClick(cardKey)}
                      className="mt-1 p-2 block w-full pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white hover:border-gray-400 dark:hover:border-gray-500"
                    />
                    {!isEditing && (
                      <a
                        href={extractBaseUrl(cardData[cardKey] as string)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
                {isEditing === cardKey && (
                  <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-row space-x-2 sm:ml-1/4 sm:pl-1/4">
                    <button
                      onClick={() => handleSave(cardKey)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : cardKey.toLowerCase() === "dateofadded" ? (
              <div key={cardKey} className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                    {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={cardKey}
                    value={
                      isEditing === cardKey
                        ? (formatDate(value || null) as string)
                        : (formatDate(cardData[cardKey]) as string)
                    }
                    onChange={(e) => setValue(e.target.value)}
                    onClick={() => handleClick(cardKey)}
                    className="mt-1 p-2 block w-full sm:w-3/4 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {isEditing === cardKey && (
                  <div className="mt-4 sm:mt-2 flex flex-row space-x-2 sm:ml-1/4">
                    <button
                      onClick={() => handleSave(cardKey)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div key={cardKey} className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                    {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={cardKey}
                    value={
                      isEditing === cardKey
                        ? (value as string)
                        : (cardData[cardKey] as string)
                    }
                    onChange={(e) => setValue(e.target.value)}
                    onClick={() => handleClick(cardKey)}
                    className="mt-1 p-2 block w-full sm:w-3/4 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                {isEditing === cardKey && (
                  <div className="mt-4 sm:mt-2 flex flex-row space-x-2 sm:ml-1/4">
                    <button
                      onClick={() => handleSave(cardKey)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleOpenDeleteModal}
          className="bg-red-500 text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition"
        >
          Delete
        </button>
      </div>
      <CardMessageSection cardId={card.id} />
    </div>
  </div>
);

  return (
    <>
      <Draggable
        draggableId={card.id}
        index={index}
        isDragDisabled={isModalOpen}
      >
        {(provided, snapshot) => (
          <div
            className={`bg-white shadow-lg mb-0 w-full h-10 space-y-2 dark:bg-[#464646] dark:text-[white] hover:shadow-xl ${
              snapshot.isDragging ? "scale-105" : ""
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onClick={handleOpenModal} // Open modal on click
          >
            <div className="relative h-1 w-full bg-[#65558F] text-xs">
              <div className="absolute top-5 right-1">
                {cardData.DateOfAdded ? timeAgo(Number(cardData.DateOfAdded)) : "just now"}
              </div>
            </div>
            <p className="flex flex-row items-center text-base font-semibold text-gray-800 dark:text-[white] truncate px-4">
            
                {cardData.BusinessName}
              <div className="pl-2">
                {Object.keys(reorderedObject)
                  .slice(4, 5)
                  .map((key) => {
                    const cardKey = key as CardKey;

                    return cardData && cardData[cardKey] === "true" ? (
                      <FiMessageSquare />
                    ) : null;

                    //return cardData[cardKey] as string;
                  })}
              </div>
            </p>
          </div>
        )}
      </Draggable>

      {/* Render Main Modal Using React Portal */}
      {isModalOpen && ReactDOM.createPortal(modalContent, document.body)}

      {/* Render Delete Confirmation Modal Using React Portal */}
      {isDeleteModalOpen &&
        ReactDOM.createPortal(deleteModalContent, document.body)}
    </>
  );
};

export default Card;
