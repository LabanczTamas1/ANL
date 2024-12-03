import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import axios from "axios";

interface CardProps {
    card: { id: string; name: string };
    columnId: string;
    index: number;
    onDeleteCard: (columnId: string, cardId: string) => void; // Callback to update the parent state
  }
  
  const Card: React.FC<CardProps> = ({ card, columnId, index, onDeleteCard }) => {
  
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
            <p className="text-lg font-semibold text-gray-800 truncate">
              {card.name}
            </p>
            <p className="text-sm text-gray-600">Card ID: {card.id}</p>
            <p className="text-sm text-gray-600">Column ID: {columnId}</p>
  
            <div className="flex justify-between items-center">
              <button
                onClick={() =>onDeleteCard(columnId, card.id)}
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
  
