import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import Column from "./Column";

const Kanban: React.FC = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
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
    isCommented: false,
  });

  // Fetch columns and their cards
  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/columns", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });

        const updatedColumns = await Promise.all(
          response.data.columns.map(async (column: any) => {
            const cardResponse = await axios.get(
              `http://localhost:3000/api/cards/${column.id}`,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
              }
            );

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
        console.log("Updated Columns: ", updatedColumns);
      } catch (error) {
        console.error("Error fetching columns:", error);
      }
    };

    fetchColumns();
  }, []);

  const handleAddCard = async () => {
    if (!selectedColumnId) return;

    try {
      const response = await axios.post(
        "http://localhost:3000/api/cards",
        { ...cardData, columnId: selectedColumnId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log("Card Data:", cardData);

      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === selectedColumnId
            ? {
                ...col,
                cards: [
                  ...col.cards,
                  { id: response.data.cardId, ...cardData },
                ],
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
        `http://localhost:3000/api/cards/${cardId}`,
        {
          data: { columnId },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      console.log(`Deleted card ${cardId}:`, response.data);

      console.log("-----------------", columns);
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
        "http://localhost:3000/api/columns",
        {
          columnName: newColumnName,
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
        { id: response.data.columnId, name: newColumnName, cards: [] },
      ]);

      setShowColumnModal(false);
      setNewColumnName("");
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/columns/${columnId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      setColumns((prevColumns) =>
        prevColumns.filter((col) => col.id !== columnId)
      );
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
          "http://localhost:3000/api/columns/priority",
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
              return { ...col, cards: updatedSourceCards };
            }
            if (col.id === destinationColumnId) {
              return { ...col, cards: updatedDestinationCards };
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

          await axios.put("http://localhost:3000/api/cards/priority", payload, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          });
        } catch (error) {
          console.error("Error updating card position:", error);
        }
      
    }
  };

  return (
    <div className="kanban-board">
      <div className="flex items-center mb-4">
        <input
          type="text"
          placeholder="Column Name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 mb-3"
          required
        />
        <button
          onClick={handleAddColumn}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Column
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="columns" direction="horizontal" type="column">
          {(provided) => (
            <div
              className="flex"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {columns.length > 0 &&
                columns.map((column, index) => {
                  if (!column || !column.id) {
                    console.error("Invalid column data:", column); // Log invalid columns for debugging
                    return null; // Skip invalid columns
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
                    />
                  );
                })}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showCardModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Add Card</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCard();
              }}
            >
              <input
                type="text"
                placeholder="Card Name"
                value={cardData.name}
                onChange={(e) =>
                  setCardData({ ...cardData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
                required
              />
              <input
                type="text"
                placeholder="Contact Name"
                value={cardData.contactName}
                onChange={(e) =>
                  setCardData({ ...cardData, contactName: e.target.value })
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <div className="flex justify-between">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Card
                </button>
                <button
                  type="button"
                  onClick={() => setShowCardModal(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
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
