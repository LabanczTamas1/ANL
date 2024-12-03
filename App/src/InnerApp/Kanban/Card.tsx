import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import axios from "axios";

interface CardProps {
  card: { id: string; name: string }; // Explicit type for card structure
  columnId: string; // ID of the column this card belongs to
  index: number; // Position of the card within the column
  cardIds?: string[]; // Optional: Array of card IDs in the column, if needed
}

const Card: React.FC<CardProps> = ({ card, columnId, index, cardIds }) => {
  // Function to handle card deletion
  const handleDeleteCard = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:3000/api/cards/${card.id}`,
        {
          data: { columnId }, // Include column ID in the request body
          headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
        }
      );
      console.log(`Deleted card ${card.id}:`, response.data);
      // Optionally, add a callback to update the UI after deletion
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
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
        >
          {/* Card Content */}
          <p className="text-lg font-semibold text-gray-800 truncate">
            {card.name}
          </p>
          <p className="text-sm text-gray-600">Card ID: {card.id}</p>
          <p className="text-sm text-gray-600">Column ID: {columnId}</p>

          {/* Delete Button */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleDeleteCard}
              className="bg-red-500 text-white text-sm px-2 py-1 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
