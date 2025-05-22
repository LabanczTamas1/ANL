import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import Column from "./Column";

const Kanban: React.FC = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [filteredColumns, setFilteredColumns] = useState<any[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [tagColor, setTagColor] = useState("#cc458f");
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [cardData, setCardData] = useState({
    name: "",
    contactName: "",
    businessName: "",
    phoneNumber: "",
    email: "",
    website: "",
    instagram: "",
    facebook: "",
    firstContact: "",
    dateOfAdded: "",
    isCommented: false,
  });

  useEffect(() => {
    console.log(`${API_BASE_URL}`);
    const fetchColumns = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/columns`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const updatedColumns = await Promise.all(
          response.data.columns.map(async (column: any) => {
            const cardResponse = await axios.get(
              `${API_BASE_URL}/api/cards/${column.id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );
            console.log("Response Column: ", response.data.columns);
            console.log(`Column Data: ${column.id}`, cardResponse);

            const cardsWithIds = cardResponse.data.cardDetails.map(
              (card: any, index: number) => {
                return {
                  ...card,
                  id: cardResponse.data.cardIds[index] || card.id,
                };
              }
            );

            return {
              ...column,
              cards: cardsWithIds,
              cardIds: cardResponse.data.cardIds || [],
            };
          })
        );

        // Ensure columns are populated correctly before setting state
        setColumns(updatedColumns);
        setFilteredColumns(updatedColumns);
        console.log("Updated Columns: ", updatedColumns);
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
  }, []);

  // Filter columns and cards based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredColumns(columns);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = columns.map((column) => {
      // Filter cards in each column
      const filteredCards = column.cards.filter(
        (card: any) =>
          card.Name?.toLowerCase().includes(query) ||
          card.ContactName?.toLowerCase().includes(query) ||
          card.contactName?.toLowerCase().includes(query) ||
          card.BusinessName?.toLowerCase().includes(query) ||
          card.PhoneNumber?.toLowerCase().includes(query) ||
          card.Email?.toLowerCase().includes(query) ||
          card.Website?.toLowerCase().includes(query) ||
          card.Instagram?.toLowerCase().includes(query) ||
          card.Facebook?.toLowerCase().includes(query)
      );

      // Return column with filtered cards
      return {
        ...column,
        cards: filteredCards,
      };
    });

    setFilteredColumns(filtered);
  }, [searchQuery, columns]);

  const handleAddCard = async () => {
    if (!selectedColumnId) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/cards`,
        { ...cardData, columnId: selectedColumnId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const newCard = {
        id: response.data.cardId,
        Name: cardData.name,
        ContactName: cardData.contactName, // Ensure consistent naming
        BusinessName: cardData.businessName,
        PhoneNumber: cardData.phoneNumber,
        Email: cardData.email,
        IsCommented: cardData.isCommented,
        Website: cardData.website,
        Instagram: cardData.instagram,
        Facebook: cardData.facebook,
        FirstContact: cardData.firstContact,
        DateOfAdded: cardData.dateOfAdded,
      };

      console.log("New caaaaaaaaaaaaaard:", newCard);

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === selectedColumnId
            ? {
                ...col,
                cardNumber: col.cardNumber + 1,
                cards: [...col.cards, newCard],
              }
            : col
        )
      );

      setShowCardModal(false);

      setCardData({
        name: "",
        contactName: "",
        businessName: "",
        phoneNumber: "",
        email: "",
        website: "",
        instagram: "",
        facebook: "",
        dateOfAdded: Math.floor(Date.now() / 1000).toString(),
        firstContact: "",
        isCommented: false,
      });
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleDeleteCard = async (columnId: string, cardId: string) => {
    try {
      // Send delete request to the server
      const response = await axios.delete(
        `${API_BASE_URL}/api/cards/${cardId}`,
        {
          data: { columnId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      // Update the state to remove the card from the specified column
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === columnId
            ? {
                ...col,
                cards: col.cards.filter((card: any) => card.id !== cardId),
                cardIds: col.cardIds.filter((id: any) => id !== cardId),
                cardNumber: col.cardNumber - 1, // Decrement card count
              }
            : col
        )
      );
    } catch (error) {
      console.error("Error deleting card:", (error as Error).message);
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/columns`,
        {
          columnName: newColumnName,
          tagColor: tagColor,
          priority: columns.length,
          cardNumbers: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setColumns([
        ...columns,
        {
          id: response.data.columnId,
          name: newColumnName,
          tagColor: tagColor,
          cards: [],
        },
      ]);

      setShowColumnModal(false);
      setNewColumnName("");
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/columns/${columnId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setColumns((prevColumns) =>
        prevColumns.filter((col) => col.id !== columnId)
      );

      setIsDeleteMode(false);
      const contentElement = document.querySelector(".main-content") as HTMLElement;
    if (contentElement) {
      contentElement.style.backgroundColor = !isDeleteMode ? "rgba(21, 225, 38, 0.4)" : "";
    }
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    console.log("Source:", source);
    console.log("Destination:", destination);
    console.log("Draggable ID:", draggableId);
    console.log("Type:", type);

    // Check if destination is valid
    if (!destination) return;

    // Handle trash bin deletion in delete mode
    if (
      isDeleteMode &&
      destination.droppableId === "trash" &&
      type === "column"
    ) {
      // Find the column by its draggableId (column.id)
      const columnToDelete = columns.find((col) => col.id === draggableId);

      if (columnToDelete) {
        await handleDeleteColumn(columnToDelete.id);
        return;
      }
    }

    // Handle column reordering
    if (type === "column") {
      if (source.index === destination.index) return;

      const reorderedColumns = Array.from(columns);
      const [movedColumn] = reorderedColumns.splice(source.index, 1);
      reorderedColumns.splice(destination.index, 0, movedColumn);

      setColumns(reorderedColumns);

      const priorityUpdates = reorderedColumns.map((column, index) => ({
        columnId: column.id,
        priority: index,
      }));

      try {
        await axios.put(
          `${API_BASE_URL}/api/columns/priority`,
          { columns: priorityUpdates },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
      } catch (error) {
        console.error("Error updating column priority:", error);
      }
    }

    // Handle card moving/reordering
    if (type === "card") {
      const sourceColumnId = source.droppableId;
      const destinationColumnId = destination.droppableId;

      const sourceColumn = columns.find((col) => col.id === sourceColumnId);
      const destinationColumn = columns.find(
        (col) => col.id === destinationColumnId
      );

      if (!sourceColumn || !destinationColumn) {
        console.error("Invalid source or destination column");
        return;
      }

      // Get the card being moved
      const movedCard = sourceColumn.cards.find(
        (card: any) => card.id === draggableId
      );

      if (!movedCard) {
        console.error("Card not found:", draggableId);
        return;
      }

      if (sourceColumnId === destinationColumnId) {
        // Reordering within the same column
        const updatedCards = Array.from(sourceColumn.cards);

        // Remove card from current position
        updatedCards.splice(source.index, 1);

        // Add card to new position
        updatedCards.splice(destination.index, 0, movedCard);

        // Update state for the single column
        setColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.id === sourceColumnId ? { ...col, cards: updatedCards } : col
          )
        );
      } else {
        // Moving card to a different column
        const updatedSourceCards = sourceColumn.cards.filter(
          (card: any) => card.id !== draggableId
        );
        const updatedDestinationCards = Array.from(destinationColumn.cards);
        updatedDestinationCards.splice(destination.index, 0, movedCard);

        // Update state for both columns
        setColumns((prevColumns) =>
          prevColumns.map((col) => {
            if (col.id === sourceColumnId) {
              return {
                ...col,
                cardNumber: col.cardNumber - 1,
                cards: updatedSourceCards,
              };
            }
            if (col.id === destinationColumnId) {
              return {
                ...col,
                cardNumber: col.cardNumber + 1,
                cards: updatedDestinationCards,
              };
            }
            return col;
          })
        );
      }
      try {
        const payload = {
          sourceColumnId,
          destinationColumnId,
          cardId: draggableId,
          newIndex: destination.index,
        };

        console.log("Payload for updating card priority:", payload);

        await axios.put(`${API_BASE_URL}/api/cards/change/priority`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error updating card position:", error);
      }
    }
  };

  const handleCloseColumnModal = (): void => {
    setShowColumnModal((prev) => !prev);
  };

  const toggleDeleteMode = (): void => {
    setIsDeleteMode((prev) => !prev);
    const contentElement = document.querySelector(".main-content") as HTMLElement;
    if (contentElement) {
      contentElement.style.backgroundColor = !isDeleteMode ? "rgba(171, 0, 0, 0.4)" : "";
    }
  };

  return (
    <div
      className={`kanban-board w-full relative`}
    >
      {/* Header section with responsive adjustments */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 border-b pb-2 gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowColumnModal(!showColumnModal)}
            className="text-white px-4 py-2 rounded dark:text-white bg-[#65558F] hover:bg-blue-600 flex-grow sm:flex-grow-0"
          >
            Add Column
          </button>

          <button
            onClick={toggleDeleteMode}
            className={`px-4 py-2 rounded ${
              isDeleteMode
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white"
            } flex-grow sm:flex-grow-0`}
          >
            {isDeleteMode ? "Exit Delete Mode" : "Delete Column"}
          </button>
        </div>

        {/* Search Input - full width on mobile */}
        <div className="relative w-full sm:w-64 mt-2 sm:mt-0">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#65558F] dark:bg-[#1e1e1e] dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Add Column Modal */}
      {showColumnModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-[400px] relative">
            {/* Modal Header */}
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">
              Add column
            </h2>
            <button
              onClick={handleCloseColumnModal}
              className="text-black px-3 py-1 sm:px-4 sm:py-2 rounded hover:bg-[red] transition absolute top-2 right-2"
            >
              X
            </button>

            {/* Input for Board Name */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Column name</label>
              <input
                type="text"
                placeholder="Enter board name"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 dark:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Color Picker Section */}
            <div className="mb-4">
              <label className="block font-semibold mb-1">Tag color</label>
              <div className="flex items-center gap-2">
                <div className="relative">
                  {/* Custom Color Picker */}
                  <input
                    type="color"
                    id="colorPicker"
                    value= {tagColor || "#cc458f"}
                    onChange={(e) => setTagColor(e.target.value)}
                    className="w-10 h-10 border-none p-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Footer with Add Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAddColumn}
                className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
              >
                + Add Board
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Original columns layout - preserved exactly as in the original code */}
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {(provided) => (
            <div
            className="flex overflow-x-auto pb-4 gap-4 px-2 [&>*]:min-w-[350px]"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredColumns.length > 0 &&
                filteredColumns.map((column, index) => {
                  if (!column || !column.id) {
                    console.error("Invalid column data:", column);
                    return null;
                  }

                  return (
                    <Column
                      key={column.id}
                      column={column}
                      onAddCard={() => {
                        setSelectedColumnId(column.id);
                        setShowCardModal(true);
                      }}
                      onDeleteColumn={handleDeleteColumn}
                      onDeleteCard={handleDeleteCard}
                      index={index}
                      className="min-w-[280px] sm:min-w-[300px]"
                    />
                  );
                })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Fixed Trash Bin at bottom of the page - only shown in delete mode */}
        {isDeleteMode && (
          <Droppable droppableId="trash" type="column">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center h-20 w-64 border-2 border-dashed rounded-lg z-40 ${
                  snapshot.isDraggingOver
                    ? "bg-red-200 border-red-500"
                    : "bg-red-100 border-red-300"
                } transition-all duration-300`}
                style={{
                  boxShadow: snapshot.isDraggingOver
                    ? `
                  0 0 200px 40px rgba(239, 68, 68, 0.4),
                  0 0 600px 80px rgba(239, 68, 68, 0.3),
                  0 0 1200px 120px rgba(239, 68, 68, 0.2),
                  0 0 1800px 160px rgba(239, 68, 68, 0.1)
                `
                    : "0 -6px 16px rgba(252, 165, 165, 0.4)",
                }}
              >
                {/* Fixed content that won't move when dragging over */}
                <div className="flex items-center justify-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-red-500 mr-2"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                    <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  </svg>
                  <p className="text-sm text-red-700">
                    Drop column here to delete
                  </p>
                </div>

                {/* This invisible element receives the dropped item */}
                <div className="absolute inset-0">{provided.placeholder}</div>
              </div>
            )}
          </Droppable>
        )}
      </DragDropContext>

      {/* Add Card Modal */}
      {showCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e1e] dark:text-white p-4 sm:p-6 rounded-lg border-4 border-[#E5E6E7] shadow-lg w-full max-w-[723px] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4 text-center">
              Add Card
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCard();
              }}
            >
              {/* Responsive form fields */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="card-name"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Card Name:
                </label>
                <input
                  id="card-name"
                  type="text"
                  placeholder="Card Name"
                  value={cardData.name}
                  onChange={(e) =>
                    setCardData({ ...cardData, name: e.target.value })
                  }
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {/* Contact Name */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="contact-name"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Contact Name:
                </label>
                <input
                  id="contact-name"
                  type="text"
                  placeholder="Contact Name"
                  value={cardData.contactName}
                  onChange={(e) => {
                    setCardData({ ...cardData, contactName: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Business Name */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="business-name"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Business Name:
                </label>
                <input
                  id="business-name"
                  type="text"
                  placeholder="Business Name"
                  value={cardData.businessName}
                  onChange={(e) => {
                    setCardData({ ...cardData, businessName: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Phone Number */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="phone-number"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Phone number:
                </label>
                <input
                  id="phone-number"
                  type="text"
                  placeholder="Phone number"
                  value={cardData.phoneNumber}
                  onChange={(e) => {
                    setCardData({ ...cardData, phoneNumber: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Email */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="email"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Email:
                </label>
                <input
                  id="email"
                  type="text"
                  placeholder="Email"
                  value={cardData.email}
                  onChange={(e) => {
                    setCardData({ ...cardData, email: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Website */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="website"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Website:
                </label>
                <input
                  id="website"
                  type="text"
                  placeholder="Website"
                  value={cardData.website}
                  onChange={(e) => {
                    setCardData({ ...cardData, website: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Instagram */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="instagram"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Instagram:
                </label>
                <input
                  id="instagram"
                  type="text"
                  placeholder="Instagram"
                  value={cardData.instagram}
                  onChange={(e) => {
                    setCardData({ ...cardData, instagram: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Facebook */}
              <div className="mb-4 flex flex-col sm:flex-row sm:items-center">
                <label
                  htmlFor="facebook"
                  className="font-medium text-black dark:text-white sm:w-28 mb-1 sm:mb-0"
                >
                  Facebook:
                </label>
                <input
                  id="facebook"
                  type="text"
                  placeholder="Facebook"
                  value={cardData.facebook}
                  onChange={(e) => {
                    setCardData({ ...cardData, facebook: e.target.value });
                  }}
                  className="flex-1 border border-transparent dark:bg-[#1e1e1e] hover:border-gray-300 rounded-lg px-3 py-2 focus:border-[#65558F]"
                />
              </div>

              {/* Form buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3">
                <button
                  type="submit"
                  className="bg-[#65558F] text-white px-4 py-2 rounded hover:bg-[#65558F] order-2 sm:order-1"
                >
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-800 order-1 sm:order-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
