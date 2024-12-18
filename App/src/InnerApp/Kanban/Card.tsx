import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import CardMessageSection from "./CardMessageSection";

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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]:
        name === "isCommented" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Modal Content
  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50 overflow-auto"
      onClick={handleCloseModal} // Close modal on clicking the overlay
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-[40vw] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-xl font-bold mb-4">Edit Card Details</h2>
        <div className="space-y-4">
          {Object.keys(cardData)
            .slice(10, 11)
            .map((key) => {
              const cardKey = key as CardKey; // Safely type cast
              console.log("Key2", key, cardData[cardKey]);
              return null;
            })}
          ;
          {Object.keys(cardData)
            .slice(0, 10)
            .map((key) => {
              const cardKey = key as CardKey; // Safely type cast
              //console.log("Key", key);

              return key === "id" ? null : key === "isCommented" ? (
                <div key={cardKey}>
                  <label className="block text-sm font-medium text-gray-700">
                    {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                    {cardKey}
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
                    {cardKey}
                  </label>
                  <input
                    type="text"
                    name={cardKey}
                    value={cardData[cardKey] as string} // Explicitly cast the value
                    onChange={handleInputChange}
                    className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
                  />
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

  console.log("Ez a mostani kartya adat", card);
  console.log(card.isCommented);

  return (
    <>
      <Draggable
        draggableId={card.id}
        index={index}
        isDragDisabled={isModalOpen}
      >
        {(provided, snapshot) => (
          <div
            className={`bg-white shadow-lg rounded-lg p-4 mb-4 w-full space-y-2 hover:shadow-xl ${
              snapshot.isDragging ? "scale-15" : ""
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
            <p className="text-lg font-semibold text-gray-800 truncate">
              Contact Name: {card.ContactName}
              
              <p> {Object.keys(cardData)
                .slice(10, 11) // Slicing to get the 11th key only
                .map((key) => {
                  const cardKey = key as CardKey; // Safely type cast to CardKey
                  console.log("wow",cardData[cardKey]);
                  return cardData[cardKey]==="false" ? "no" : "message"; // Ternary operator inside map
                })}</p>
             
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
