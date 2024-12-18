import React, { useState, useEffect } from "react";
import axios from "axios";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import Column from "./Column";

const Kanban: React.FC = () => {
  const [columns, setColumns] = useState<any[]>([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [tagColor, setTagColor] = useState("#ffffff");
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
            console.log("Response Column: ",response.data.columns);
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
  
      const newCard = {
        id: response.data.cardId,
        name: cardData.name,
        ContactName: cardData.contactName, // Ensure consistent naming
        businessName: cardData.businessName,
        phoneNumber: cardData.phoneNumber,
        email: cardData.email,
        website: cardData.website,
        instagram: cardData.instagram,
        facebook: cardData.facebook,
        firstContact: cardData.firstContact,
        isCommented: cardData.isCommented,
      };
      
  
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === selectedColumnId
            ? {
                ...col,
                cardNumber: col.cardNumber+1,
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
        { id: response.data.columnId, name: newColumnName, tagColor: tagColor, cards: [] },
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
              return { ...col,  cardNumber: col.cardNumber-1, cards: updatedSourceCards };
            }
            if (col.id === destinationColumnId) {
              return { ...col,  cardNumber: col.cardNumber+1, cards: updatedDestinationCards };
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

  const handleCloseColumnModal = (): void => {
    setShowColumnModal((prev) => !prev);
  };
  

  return (
    <div className="kanban-board">
      <button
          onClick={()=>setShowColumnModal(!showColumnModal)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Column
        </button>
        {showColumnModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg p-6 w-[400px] relative">
      {/* Modal Header */}
      <h2 className="text-2xl font-bold text-center mb-4">Add board</h2>
      <button
            onClick={handleCloseColumnModal}
            className="text-black px-4 py-2 rounded hover:bg-[red] transition absolute top-2 right-2"

          >
            X
          </button>

      {/* Input for Board Name */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Board name</label>
        <input
          type="text"
          placeholder="Enter board name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              value="#cc458f"
             onChange={(e) => setTagColor(e.target.value)}
              className="w-10 h-10 border-none p-0 cursor-pointer"
            />
          </div>
          <button className="bg-pink-500 text-white px-3 py-1 rounded-md text-xs">Trash</button>
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
                onChange={(e) =>{
                  setCardData({ ...cardData, contactName: e.target.value }); console.log(e.target.value);}
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Business Name"
                value={cardData.businessName}
                onChange={(e) =>{
                  setCardData({ ...cardData, businessName: e.target.value }); console.log(e.target.value);}
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Phone number"
                value={cardData.phoneNumber}
                onChange={(e) =>{
                  setCardData({ ...cardData, phoneNumber: e.target.value }); console.log(e.target.value);}
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Email"
                value={cardData.email}
                onChange={(e) =>{
                  setCardData({ ...cardData, email: e.target.value }); console.log(e.target.value);}
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Website"
                value={cardData.website}
                onChange={(e) =>{
                  setCardData({ ...cardData, website: e.target.value }); console.log(e.target.value);}
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Instagram"
                value={cardData.instagram}
                onChange={(e) =>{
                  setCardData({ ...cardData, instagram: e.target.value }); console.log(e.target.value);}
                }
                className="w-full border border-gray-300 rounded px-3 py-2 mb-3"
              />
              <input
                type="text"
                placeholder="Facebook"
                value={cardData.facebook}
                onChange={(e) =>{
                  setCardData({ ...cardData, facebook: e.target.value }); console.log(e.target.value);}
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
