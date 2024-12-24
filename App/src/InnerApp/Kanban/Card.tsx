import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import CardMessageSection from "./CardMessageSection";
import axios from "axios";

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
      [name]: name === "isCommented" ? (e.target as HTMLInputElement).checked : value,
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

  // Modal content
  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
      onClick={handleCloseModal}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-[40vw] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Edit Card Details</h2>
        <div className="space-y-4">
          {Object.keys(cardData)
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
              ) : (
                <div key={cardKey}>
                  <label className="block text-sm font-medium text-gray-700">
                    {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                  </label>
                  <input
                    type="text"
                    name={cardKey}
                    value={isEditing === cardKey ? (value as string) : (cardData[cardKey] as string)} // Ensure value is string
                    onChange={(e) => setValue(e.target.value)} // Update local value while editing
                    onClick={() => handleClick(cardKey)} // Start editing the field
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
                  {isEditing === cardKey && ( // Only show buttons for the selected field
                    <div style={{ marginTop: "10px" }}>
                      <button
                        onClick={() => handleSave(cardKey)} // Call save for the specific field
                        className="mr-2 bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
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
          <button
            onClick={handleCloseModal}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Close
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
            className={`bg-white shadow-lg rounded-lg p-4 mb-4 w-full space-y-2 hover:shadow-xl ${snapshot.isDragging ? "scale-105" : ""}`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onClick={handleOpenModal} // Open modal on click
          >
            <p className="text-lg font-semibold text-gray-800 truncate">
              Contact Name: {card.ContactName}
              <p>
                {card.isCommented ? "Message" : "No comment yet"}
              </p>
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
