import React from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import Card from "./Card";

interface ColumnProps {
  column: {
    id: string;
    name: string;
    cards: { id: string; name: string }[]; // Define card structure explicitly
    cardIds: string[]; // Optional if required for additional functionality
  };
  onAddCard: (columnId: string) => void; // Updated to accept `columnId`
  onDeleteColumn: (columnId: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  index: number; // Keeps track of the column's position
}

const Column: React.FC<ColumnProps> = ({
  column,
  onAddCard,
  onDeleteColumn,
  onDeleteCard,
  index,
}) => {
  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          className="kanban-column w-64 bg-gray-100 rounded-lg shadow-lg mr-4"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {/* Column Header */}
          <div className="flex justify-between mb-4 items-center">
            <h2 className="text-xl font-semibold">{column.name}</h2>
            <button
              onClick={() => onDeleteColumn(column.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>

          {/* Cards Droppable Area */}
          <Droppable droppableId={column.id} type="card">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4 min-h-[1vh] max-h-[50vh] overflow-y-auto"
              >
                {column.cards.map((card, index) => (
                  <Card
                    key={card.id}
                    card={card}
                    columnId={column.id}
                    index={index}
                    onDeleteCard={onDeleteCard}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card Button */}
          <button
            onClick={() => onAddCard(column.id)} // Pass column ID to the callback
            className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full hover:bg-blue-600"
          >
            Add Card
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Column;
