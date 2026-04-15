import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import {
  getColumns,
  getCards,
  createCard,
  deleteCard,
  createColumn,
  deleteColumn,
  updateColumnPriority,
  moveCard,
} from "../../services/api/kanbanApi";
import Column from "./Column";
import KanbanHeader from './KanbanHeader';
import AddColumnModal from './AddColumnModal';
import AddCardModal from './AddCardModal';
import TrashBin from './TrashBin';

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
    const fetchColumns = async () => {
      try {
        const response = await getColumns();

        const updatedColumns = await Promise.all(
          response.data.columns.map(async (column: any) => {
            const cardResponse = await getCards(column.id);
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
      const response = await createCard({ ...cardData, columnId: selectedColumnId });

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
      await deleteCard(cardId);
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
      const response = await createColumn({
        columnName: newColumnName,
        tagColor: tagColor,
        priority: columns.length,
        cardNumbers: 0,
      });

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
      await deleteColumn(columnId);

      setColumns((prevColumns) =>
        prevColumns.filter((col) => col.id !== columnId)
      );

      setIsDeleteMode(false);
      const contentElement = document.querySelector(
        ".main-content"
      ) as HTMLElement;
      if (contentElement) {
        contentElement.style.backgroundColor = !isDeleteMode
          ? "rgba(21, 225, 38, 0.4)"
          : "";
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
        await updateColumnPriority({ columns: priorityUpdates });
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

        await moveCard(payload);
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
    const contentElement = document.querySelector(
      ".main-content"
    ) as HTMLElement;
    if (contentElement) {
      contentElement.style.backgroundColor = !isDeleteMode
        ? "rgba(171, 0, 0, 0.4)"
        : "";
    }
  };

  return (
    <div className={`kanban-board w-full relative`}>
      {/* Header section with responsive adjustments */}
      <KanbanHeader
        isDeleteMode={isDeleteMode}
        onAddColumn={() => setShowColumnModal(true)}
        onToggleDeleteMode={toggleDeleteMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Add Column Modal */}
      <AddColumnModal
        show={showColumnModal}
        onClose={handleCloseColumnModal}
        newColumnName={newColumnName}
        setNewColumnName={setNewColumnName}
        tagColor={tagColor}
        setTagColor={setTagColor}
        onAddColumn={handleAddColumn}
      />

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
            {(provided, snapshot) => <TrashBin provided={provided} snapshot={snapshot} />}
          </Droppable>
        )}
      </DragDropContext>

      {/* Add Card Modal */}
      <AddCardModal
        show={showCardModal}
        onClose={() => setShowCardModal(false)}
        cardData={cardData}
        setCardData={setCardData}
        onAddCard={handleAddCard}
      />
    </div>
  );
};

export default Kanban;
