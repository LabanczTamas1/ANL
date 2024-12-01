interface ColumnProps {
    column: {
      id: string;
      name: string;
      cardNumber: number;
      priority: number;
    };
    onDelete: (columnId: string) => void;
  }
  
  const Column: React.FC<ColumnProps> = ({ column, onDelete }) => {
    return (
      <div className="bg-gray-100 rounded-lg shadow-md p-4 w-64">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">{column.name}</h2>
          <button
            className="text-red-500"
            onClick={() => onDelete(column.id)}
          >
            Delete
          </button>
        </div>
        <p className="text-sm text-gray-600">ID: {column.id}</p>
        <p className="text-sm text-gray-600">Cards: {column.cardNumber}</p>
      </div>
    );
  };
  
  export default Column;
  