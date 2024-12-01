import React from 'react';
import { Draggable } from '@hello-pangea/dnd';

interface CardData {
  id: string;
  name: string;
  isCommented: boolean;
  description: string;
  status: string;
  contactName?: string;
  businessName?: string;
  firstContact?: string;
  phoneNumber?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

interface CardProps {
  card: CardData;
  index: number;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string) => Promise<void>; // Add this prop
  onDeleteCard: (cardId: string) => Promise<void>; // Add a new prop for the delete function
}

const Card: React.FC<CardProps> = ({ card, index, onMoveCard, onDeleteCard }) => {
  const handleMoveCard = async () => {
    // Example of how you would call onMoveCard when the card is moved
    await onMoveCard(card.id, card.status, "newColumnId"); // Replace "newColumnId" with actual target column id
  };

  const handleDeleteCard = async () => {
    if (confirm("Are you sure you want to delete this card?")) {
      try {
        console.log(card.id);
        await onDeleteCard(card.id);
        alert("Card deleted successfully.");
      } catch (error) {
        console.error("Error deleting card:", error);
        alert("Failed to delete the card. Please try again.");
      }
    }
  };

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div
          className="flex flex-col items-start p-4 bg-white rounded-lg shadow-md border mb-2 select-none cursor-pointer"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <p className="text-sm font-semibold mb-2">{card.name}</p>
          {card.description && <p className="text-xs text-gray-600 mb-2">{card.description}</p>}
          
          {/* Display Contact Information if available */}
          {card.contactName && <p className="text-xs text-gray-500">Contact: {card.contactName}</p>}
          {card.businessName && <p className="text-xs text-gray-500">Business: {card.businessName}</p>}

          {/* Show the 'Commented' badge if applicable */}
          {card.isCommented && (
            <span className="text-xs text-gray-500 flex items-center">
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1"
              >
                <path
                  d="M19.25 13.75C19.25 14.2362 19.0568 14.7025 18.713 15.0464C18.3692 15.3902 17.9029 15.5833 17.4167 15.5833H6.41667L2.75 19.25V4.58333C2.75 4.0971 2.94315 3.63079 3.28697 3.28697C3.63079 2.94315 4.0971 2.75 4.58333 2.75H17.4167C17.9029 2.75 18.3692 2.94315 18.713 3.28697C19.0568 3.63079 19.25 4.0971 19.25 4.58333V13.75Z"
                  stroke="#1E1E1E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Commented
            </span>
          )}

          {/* Example Button for moving the card */}
          <button onClick={handleMoveCard} className="text-xs text-blue-500 mt-2">
            Move Card
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDeleteCard}
            className="text-xs text-red-500 mt-2"
          >
            Delete Card
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Card;
