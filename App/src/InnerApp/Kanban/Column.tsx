import React, { useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import Card from "./Card";

interface ColumnProps {
  column: {
    id: string;
    name: string;
    tagColor: string;
    cardNumber: string;
    cards: {
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
    }[];
  };
  onAddCard: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  index: number;
}

const Column: React.FC<ColumnProps> = ({
  column,
  onAddCard,
  onDeleteColumn,
  onDeleteCard,
  index,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const cardsPerPage = 10; // Number of cards per page

  const totalPages = Math.ceil(column.cards.length / cardsPerPage);
  const currentCards = column.cards.slice(
    (currentPage - 1) * cardsPerPage,
    currentPage * cardsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    } else {
      alert("Invalid page number");
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (isNaN(page) || page < 1 || page > totalPages) {
      alert("Please enter a valid page number between 1 and " + totalPages);
    } else {
      setCurrentPage(page);
    }
    setInputPage("");
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
        className="kanban-column w-1/4 bg-gradient-to-b from-[#EFEFEF] via-[#CDCDCD] to-[#FCFCFD] dark:from-[#353535] dark:via-[#121212] dark:to-[#353535] rounded-lg shadow-lg mr-4"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div
            className="w-[100%] h-[17px] rounded-lg border-2 dark:border-[#1D2431]"
            style={{ backgroundColor: column.tagColor }}
          ></div>
          {/* Column Header */}
          <div className="flex flex-col justify-between mb-4 items-center">
            <h2 className="text-xl font-semibold">{column.name}</h2>
            <div className="">{column.cardNumber} cards</div>
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
                className="space-y-1 min-h-[1vh] max-h-[50vh] overflow-y-auto mx-2"
              >
                {currentCards.map((card, index) => (
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

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm text-white bg-gray-400 rounded disabled:opacity-50 hover:bg-gray-500"
            >
              Previous
            </button>
            <span className="mx-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm text-white bg-gray-400 rounded disabled:opacity-50 hover:bg-gray-500"
            >
              Next
            </button>
          </div>

          {/* Go to Page Input */}
          <div className="flex justify-center items-center mt-2">
            <input
              type="text"
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              placeholder="Go to page"
              className="w-20 px-2 py-1 text-sm border rounded"
            />
            <button
              onClick={handleGoToPage}
              className="ml-2 px-2 py-1 text-sm text-white bg-[#65558F] rounded hover:bg-blue-600"
            >
              Go
            </button>
          </div>

          {/* Add Card Button */}
          <button
            onClick={() => onAddCard(column.id)}
            className="bg-[#65558F] text-white px-4 py-2 rounded mt-4 w-full hover:bg-blue-600"
          >
            Add Card
          </button>
        </div>
      )}
    </Draggable>
  );
};

export default Column;
