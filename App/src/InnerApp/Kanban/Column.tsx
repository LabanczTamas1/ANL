import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import Card from "./Card";
import MobileActionSheet, { SheetAction } from "./MobileActionSheet";
import { usePostHog } from "@posthog/react";
import { useLanguage } from "../../hooks/useLanguage";

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
  className?: string;
  isMobile?: boolean;
  isFirstColumn?: boolean;
  isLastColumn?: boolean;
  allColumns?: { id: string; name: string }[];
  onMoveColumn?: (columnId: string, direction: "left" | "right") => void;
  onMoveCardWithin?: (columnId: string, cardId: string, direction: "up" | "down") => void;
  onMoveCardToColumn?: (sourceColumnId: string, cardId: string, destinationColumnId: string) => void;
}

// Confirmation Modal Component
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, columnName }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  columnName: string;
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4 dark:text-white">{t("kanban.confirmDeletion")}</h3>
        <p className="mb-6 dark:text-gray-300">
          {t("kanban.deleteColumnConfirm", { name: columnName })}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
          >
            {t("kanban.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {t("kanban.delete")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Column: React.FC<ColumnProps> = ({
  column,
  onAddCard,
  onDeleteColumn,
  onDeleteCard,
  index,
  isMobile = false,
  isFirstColumn = false,
  isLastColumn = false,
  allColumns = [],
  onMoveColumn,
  onMoveCardWithin,
  onMoveCardToColumn,
}) => {
  const { t } = useLanguage();
  const posthog = usePostHog();
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isColumnSheetOpen, setIsColumnSheetOpen] = useState(false);
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
      alert(t("kanban.invalidPageNumber"));
    }
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (isNaN(page) || page < 1 || page > totalPages) {
      alert(t("kanban.enterValidPage", { max: String(totalPages) }));
    } else {
      setCurrentPage(page);
    }
    setInputPage("");
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    posthog.capture("kanban_column_deleted", { column_name: column.name });
    onDeleteColumn(column.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <>
      <Draggable draggableId={column.id} index={index} isDragDisabled={isMobile}>
        {(provided) => (
          <div
          className={`kanban-column ${isMobile ? "w-full" : "min-w-[300px] w-[350px] mr-4"} h-full bg-gradient-to-b from-[#EFEFEF] via-[#CDCDCD] to-[#FCFCFD] dark:from-[#353535] dark:via-[#121212] dark:to-[#353535] rounded-lg shadow-lg`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div
              className="w-[100%] h-[17px] rounded-lg border-2 dark:border-[#1D2431]"
              style={{ backgroundColor: column.tagColor }}
            ></div>
            <div className="p-2">
            {/* Column Header */}
            <div className="flex flex-col justify-between mb-4 items-center relative">
              {isMobile && (
                <button
                  type="button"
                  onClick={() => setIsColumnSheetOpen(true)}
                  aria-label={t("kanban.columnActions")}
                  className="absolute right-0 top-0 inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              )}
              <h2 className="text-xl font-semibold">{column.name}</h2>
              <div className="">{t("kanban.cardsCount", { count: column.cardNumber })}</div>
              <button
                onClick={handleDeleteClick}
                className="text-red-500 hover:text-red-700"
              >
                {t("kanban.delete")}
              </button>
            </div>

            {/* Cards Droppable Area */}
            <Droppable droppableId={column.id} type="card">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-1 min-h-[1vh] mx-2 ${isMobile ? "" : "max-h-[50vh] overflow-y-auto"}`}
                >
                  {currentCards.map((card, index) => {
                    const globalIndex = (currentPage - 1) * cardsPerPage + index;
                    return (
                      <Card
                        key={card.id}
                        card={card}
                        columnId={column.id}
                        index={index}
                        onDeleteCard={onDeleteCard}
                        isMobile={isMobile}
                        isFirstCard={globalIndex === 0}
                        isLastCard={globalIndex === column.cards.length - 1}
                        otherColumns={allColumns.filter((c) => c.id !== column.id)}
                        onMoveCardWithin={onMoveCardWithin}
                        onMoveCardToColumn={onMoveCardToColumn}
                      />
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
              <div className="">
            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-sm text-white bg-gray-400 rounded disabled:opacity-50 hover:bg-gray-500"
              >
                {t("kanban.previous")}
              </button>
              <span className="mx-2 text-sm">
                {t("kanban.pageOf", { current: String(currentPage), total: String(totalPages) })}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-sm text-white bg-gray-400 rounded disabled:opacity-50 hover:bg-gray-500"
              >
                {t("kanban.next")}
              </button>
            </div>

            {/* Go to Page Input */}
            <div className="flex justify-center items-center mt-2">
              <input
                type="text"
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                placeholder={t("kanban.goToPagePh")}
                className="w-20 px-2 py-1 text-sm border rounded"
              />
              <button
                onClick={handleGoToPage}
                className="ml-2 px-2 py-1 text-sm text-white bg-[#65558F] rounded hover:bg-blue-600"
              >
                {t("kanban.go")}
              </button>
            </div>

            {/* Add Card Button */}
            <button
              onClick={() => {
                posthog.capture("kanban_card_added", { column_name: column.name });
                onAddCard(column.id);
              }}
              className="bg-[#65558F] text-white px-4 py-2 rounded mt-4 w-full hover:bg-blue-600"
            >
              {t("kanban.addCard")}
            </button>
            </div>
            </div>
          </div>
        )}
      </Draggable>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        columnName={column.name}
      />

      {/* Mobile column action sheet */}
      <MobileActionSheet
        open={isColumnSheetOpen}
        title={column.name}
        onClose={() => setIsColumnSheetOpen(false)}
        closeLabel={t("kanban.close")}
      >
        <SheetAction
          icon={<ChevronLeft className="w-5 h-5" />}
          label={t("kanban.moveColumnLeft")}
          disabled={isFirstColumn}
          onClick={() => {
            onMoveColumn?.(column.id, "left");
            setIsColumnSheetOpen(false);
          }}
        />
        <SheetAction
          icon={<ChevronRight className="w-5 h-5" />}
          label={t("kanban.moveColumnRight")}
          disabled={isLastColumn}
          onClick={() => {
            onMoveColumn?.(column.id, "right");
            setIsColumnSheetOpen(false);
          }}
        />
      </MobileActionSheet>
    </>
  );
};

export default Column;