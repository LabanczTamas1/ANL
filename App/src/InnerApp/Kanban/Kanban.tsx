import React, { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import Column from "./Column";

interface ColumnType {
  id: string;
  name: string;
  cardNumber: number;
  priority: number;
}

const Kanban: React.FC = () => {
  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [newColumnName, setNewColumnName] = useState("");

  // Fetch columns from API
  const fetchColumns = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/columns", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setColumns(response.data.columns || []);
    } catch (error) {
      console.error("Error fetching columns:", error);
    }
  };

  // Add new column
  const addColumn = async () => {
    if (!newColumnName) return;

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

      const newColumn = {
        id: response.data.columnId,
        name: response.data.columnName,
        cardNumber: response.data.cardNumbers,
        priority: response.data.priority,
      };
      setColumns((prevColumns) => [...prevColumns, newColumn]); // Update state
      setNewColumnName("");
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  // Delete column
  const deleteColumn = async (columnId: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/columns/${columnId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      // Remove the column locally
      setColumns(columns.filter((col) => col.id !== columnId));
    } catch (error) {
      console.error("Error deleting column:", error);
    }
  };

  // Handle drag and drop
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedColumns = Array.from(columns);
    const [removed] = reorderedColumns.splice(result.source.index, 1);
    reorderedColumns.splice(result.destination.index, 0, removed);

    // Update priorities locally
    const updatedColumns = reorderedColumns.map((col, index) => ({
      ...col,
      priority: index,
    }));

    setColumns(updatedColumns);

    // Update priorities in the database
    try {
      await Promise.all(
        updatedColumns.map((column) =>
          axios.put(
            "http://localhost:3000/api/columns/priority",
            {
              columnId: column.id,
              priority: column.priority,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          )
        )
      );
    } catch (error) {
      console.error("Error updating column priorities:", error);
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          className="border rounded p-2 w-1/3"
          placeholder="New Column Name"
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={addColumn}
        >
          Add Column
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="kanban" direction="horizontal">
          {(provided) => (
            <div
              className="flex space-x-4 overflow-x-auto"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Column column={column} onDelete={deleteColumn} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Kanban;
