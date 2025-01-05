import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import CardMessageSection from "./CardMessageSection";
import axios from "axios";
import { FiMessageSquare } from "react-icons/fi";

interface CardProps {
  card: {
    id: string;
    name: string;
    ContactName: string;
    businessName: string;
    phoneNumber: string;
    email: string;
    website: string;
    instagram: string;
    facebook: string;
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
  const [cardData, setCardData] = useState(card); // Initialize with the full card object
  const [isEditing, setIsEditing] = useState<CardKey | null>(null); // Track which field is being edited
  const [value, setValue] = useState<string | boolean>(cardData.name); // Track the value of the input being edited


  console.log("Objecting", cardData, Object.keys(cardData));

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


const reorderedObject = keyOrder.reduce((acc, key) => {
  if (key in cardData) {
      acc[key] = cardData[key as keyof typeof cardData];  // Type assertion here
  }
  return acc;
}, {} as Record<string, unknown>);

console.log("Reordered",reorderedObject, Object.keys(reorderedObject));
  // Open and Close Modal
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

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
        `http://localhost:3000/api/cards/${card.id}`,
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
        return urlMatch[0];  // Return the full matched URL, including path but excluding ']'
      }
      return '';
    } catch (error) {
      console.error('Invalid URL:', error);
      return '';
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
  

  // Modal content
  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
      onClick={handleCloseModal}
    >
      <div
        className="relative bg-white rounded-lg shadow-lg p-6 w-[40vw] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCloseModal}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-4xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">
          {Object.keys(reorderedObject)
            .slice(7, 8)
            .map((key) => {
              const cardKey = key as CardKey;

              return cardData[cardKey] as string;
            })}
        </h2>
        <div className="space-y-4">
          {Object.keys(reorderedObject)
            .slice(0, 10)
            .map((key) => {
              const cardKey = key as CardKey;

              return cardKey === "id" ? null : cardKey === "isCommented" ? (
                <div key={cardKey}>
                  <label className="block text-sm font-medium text-gray-700">
                    {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                  </label>
                  <input
                    type="checkbox"
                    name={cardKey}
                    checked={cardData[cardKey] as boolean}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                </div>
              ) : cardKey.toLowerCase() === "instagram" || 
              cardKey.toLowerCase() === "facebook" || 
              cardKey.toLowerCase() === "website"
               ? (
                <div key={cardKey} className="flex flex-row items-center w-full">
                  <label className="block text-sm font-medium text-gray-700">
                  {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                  </label>
                  <div className="flex items-center space-x-2 w-full">
                    <a
                      href={extractBaseUrl(cardData[cardKey] as string)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline hover:text-blue-700 w-full"
                    >
                    
                    <input
                      type="text"
                      name={cardKey}
                      value={
                        isEditing === cardKey
                          ? (value as string)
                          : (extractBaseUrl(cardData[cardKey] as string))
                      }
                      onChange={(e) => setValue(e.target.value)} // Update local value
                      onClick={() => handleClick(cardKey)} // Start editing
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring focus:ring-blue-200 border-none"
                    />
                    </a>
                  </div>
                  {isEditing === cardKey && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleSave(cardKey)} // Save edited link
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : cardKey.toLowerCase() === "dateofadded" ? (
                <div key={cardKey}>
                  <div className="flex flex-row items-center justify-center">
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md hover:border-gray-400 focus:ring focus:ring-blue-200 border-none"
                    />
                  </div>
                  {isEditing === cardKey && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleSave(cardKey)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div key={cardKey}>
                  <div className="flex flex-row items-center justify-center">
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 p-2 block w-full border border-gray-300 rounded-md hover:border-gray-400 focus:ring focus:ring-blue-200 border-none"
                    />
                  </div>
                  {isEditing === cardKey && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => handleSave(cardKey)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => {
              onDeleteCard(columnId, card.id); // Call delete function
              handleCloseModal(); // Close modal after deletion
            }}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
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
            className={`bg-white shadow-lg mb-0 w-full space-y-2 dark:bg-[#464646] dark:text-[white] hover:shadow-xl ${
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
           <div className="h-1 w-full bg-[#65558F] text-xs"></div>
            <p className="flex flex-row items-center text-base font-semibold text-gray-800 dark:text-[white] truncate px-4">
            {Object.keys(reorderedObject)
              .slice(7, 8)
              .map((key) => {
                const cardKey = key as CardKey;

                return cardData[cardKey] as string;
              })}
              <div className="pl-2">
            {Object.keys(reorderedObject)
              .slice(4, 5)
              .map((key) => {
                const cardKey = key as CardKey;


                return cardData && cardData[cardKey] === "true" ? <FiMessageSquare /> : null;


                //return cardData[cardKey] as string;
              })}
              </div>
            </p>
            
              
          </div>
        )}
      </Draggable>

      {/* Render Modal Using React Portal */}
      {isModalOpen && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
};

export default Card;
