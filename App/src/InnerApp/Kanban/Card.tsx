import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Draggable } from "@hello-pangea/dnd";
import { MoreVertical, ArrowUp, ArrowDown, FolderInput } from "lucide-react";
import CardMessageSection from "./CardMessageSection";
import ActivityLog, { ActivityLogHandle } from "./ActivityLog";
import MobileActionSheet, { SheetAction } from "./MobileActionSheet";
import { updateCard } from "../../services/api/kanbanApi";
import { FiMessageSquare } from "react-icons/fi";
import timeAgo from "./../../utils/calculateTimeAgo";
import { useLanguage } from "../../hooks/useLanguage";

interface CardProps {
  card: {
    id: string;
    name: string;
    Name?: string;
    Fields?: string;
    ContactName: string;
    BusinessName: string;
    businessName: string;
    phoneNumber: string;
    email: string;
    website: string;
    instagram: string;
    facebook: string;
    DateOfAdded: string;
    firstContact: string;
    isCommented: boolean;
  };
  columnId: string;
  index: number;
  onDeleteCard: (columnId: string, cardId: string) => void;
  isMobile?: boolean;
  isFirstCard?: boolean;
  isLastCard?: boolean;
  otherColumns?: { id: string; name: string }[];
  onMoveCardWithin?: (columnId: string, cardId: string, direction: "up" | "down") => void;
  onMoveCardToColumn?: (sourceColumnId: string, cardId: string, destinationColumnId: string) => void;
}

type CardKey = keyof CardProps["card"];

const Card: React.FC<CardProps> = ({
  card,
  columnId,
  index,
  onDeleteCard,
  isMobile = false,
  isFirstCard = false,
  isLastCard = false,
  otherColumns = [],
  onMoveCardWithin,
  onMoveCardToColumn,
}) => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCardSheetOpen, setIsCardSheetOpen] = useState(false);
  const [cardData, setCardData] = useState(card);
  const [isEditing, setIsEditing] = useState<CardKey | null>(null);
  const [value, setValue] = useState<string | boolean>(cardData.name);
  const activityRef = useRef<ActivityLogHandle>(null);
  const [editingFieldIdx, setEditingFieldIdx] = useState<number | null>(null);
  const [fieldEditValue, setFieldEditValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedCardName, setEditedCardName] = useState('');
  const [editedFields, setEditedFields] = useState<Array<{ name: string; type: string; value: string }>>([]);
  const [newEditFieldName, setNewEditFieldName] = useState('');
  const [newEditFieldType, setNewEditFieldType] = useState<'text' | 'link'>('text');
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);
  const editModeOriginalRef = useRef<{ name: string; fields: string } | null>(null);

  // Parse dynamic fields for template-based cards
  let parsedFields: Array<{ name: string; type: string; value: string }> = [];
  try {
    const raw = (cardData as any).Fields;
    if (raw) parsedFields = JSON.parse(raw);
  } catch {}

  const keyOrder = [
    "id",
    "Facebook",
    "Email",
    "Instagram",
    "IsCommented",
    "Website",
    "ColumnId",
    "BusinessName",
    "ContactName",
    "FirstContact",
    "DateOfAdded",
    "PhoneNumber",
  ];

  const reorderedObject = keyOrder.reduce((acc, key) => {
    if (key in cardData) {
      acc[key] = cardData[key as keyof typeof cardData];
    }
    return acc;
  }, {} as Record<string, unknown>);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    if (isEditMode) {
      const orig = editModeOriginalRef.current;
      const isDirty = orig
        ? orig.name !== editedCardName || orig.fields !== JSON.stringify(editedFields)
        : true;
      if (isDirty) {
        setIsDiscardConfirmOpen(true);
        return;
      }
      setIsEditMode(false);
      setIsModalOpen(false);
    } else {
      setIsModalOpen(false);
    }
  };
  const handleConfirmDiscard = () => {
    setIsDiscardConfirmOpen(false);
    setIsEditMode(false);
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => setIsDeleteModalOpen(false);

  const handleConfirmDelete = () => {
    onDeleteCard(columnId, card.id);
    setIsDeleteModalOpen(false);
    handleCloseModal();
  };

  const handleClick = (key: CardKey) => {
    setIsEditing(key);
    setValue(cardData[key] as string);
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCardData((prev) => ({
      ...prev,
      [name]: name === "isCommented" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (key: CardKey) => {
    const updatedValue = value;

    try {
      await updateCard(card.id, { name: key, updatedValue });

      setCardData((prevData) => ({
        ...prevData,
        [key]: updatedValue,
      }));

      setIsEditing(null);

      // Show instant activity update
      activityRef.current?.addLocal('updated', t("kanban.activityUpdatedField", { field: key }));
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(null);
    if (isEditing) {
      setValue(cardData[isEditing] ?? '');
    }
  };

  const handleSaveField = async (idx: number) => {
    const updatedFields = parsedFields.map((f, i) =>
      i === idx ? { ...f, value: fieldEditValue } : f
    );
    try {
      await updateCard(card.id, { name: 'Fields', updatedValue: updatedFields });
      setCardData((prev: any) => ({ ...prev, Fields: JSON.stringify(updatedFields) }));
      setEditingFieldIdx(null);
      activityRef.current?.addLocal('updated', t("kanban.activityUpdatedField", { field: parsedFields[idx].name }));
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  const handleEnterEditMode = () => {
    const name = (cardData as any).Name || cardData.name || '';
    const fields = parsedFields.map((f) => ({ ...f }));
    editModeOriginalRef.current = { name, fields: JSON.stringify(fields) };
    setEditedCardName(name);
    setEditedFields(fields);
    setNewEditFieldName('');
    setNewEditFieldType('text');
    setIsEditMode(true);
  };

  const handleCancelEditMode = () => {
    setIsEditMode(false);
    setNewEditFieldName('');
  };

  const handleAddEditField = () => {
    const trimmed = newEditFieldName.trim();
    if (!trimmed) return;
    if (editedFields.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) return;
    setEditedFields([...editedFields, { name: trimmed, type: newEditFieldType, value: '' }]);
    setNewEditFieldName('');
    setNewEditFieldType('text');
  };

  const handleSaveEditMode = async () => {
    try {
      const trimmedName = editedCardName.trim();
      await Promise.all([
        updateCard(card.id, { name: 'Fields', updatedValue: editedFields }),
        ...(trimmedName ? [updateCard(card.id, { name: 'Name', updatedValue: trimmedName })] : []),
      ]);
      setCardData((prev: any) => ({
        ...prev,
        Fields: JSON.stringify(editedFields),
        ...(trimmedName ? { Name: trimmedName } : {}),
      }));
      setIsEditMode(false);
      activityRef.current?.addLocal('updated', t("kanban.activityEditedFields"));
    } catch (error) {
      console.error('Error saving card edits:', error);
    }
  };

  const extractBaseUrl = (url: string): string => {
    try {
      const urlMatch = url.match(/https?:\/\/[^\s\]]+/);
      return urlMatch ? urlMatch[0] : "";
    } catch {
      return "";
    }
  };

  const formatDate = (timestamp: string | null | boolean): string => {
    if (!timestamp) return t("kanban.noDateAvailable");
    const date = new Date(Number(timestamp));
    const today = new Date();
    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return `${date.getFullYear()}. ${date.toLocaleString("en-US", {
      month: "short",
    })} ${date.getDate()}.`;
  };

  const deleteModalContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-[60] overflow-auto"
      onClick={(e) => {
        e.stopPropagation();
        handleCloseDeleteModal();
      }}
    >
      <div
        className="relative bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-6 w-[30vw] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center dark:text-white">{t("kanban.confirmDeletion")}</h2>
        <p className="text-center mb-6 dark:text-gray-300">{t("kanban.reallyDeleteCard")}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmDelete}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            {t("kanban.delete")}
          </button>
          <button
            onClick={handleCloseDeleteModal}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            {t("kanban.cancel")}
          </button>
        </div>
      </div>
    </div>
  );

  const discardConfirmContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-[70] overflow-auto"
      onClick={() => setIsDiscardConfirmOpen(false)}
    >
      <div
        className="relative bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg p-6 w-[min(90vw,480px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center dark:text-white">{t("kanban.discardChanges")}</h2>
        <p className="text-center mb-6 dark:text-gray-300">{t("kanban.unsavedEdits")}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleConfirmDiscard}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            {t("kanban.discard")}
          </button>
          <button
            onClick={() => setIsDiscardConfirmOpen(false)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            {t("kanban.keepEditing")}
          </button>
        </div>
      </div>
    </div>
  );

  const modalContent = (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 overflow-auto p-4"
      onClick={handleCloseModal}
    >
      <div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full sm:w-4/5 md:w-3/4 lg:w-[40vw] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky header — stays pinned while body scrolls */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 flex items-center justify-between px-4 md:px-6 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold dark:text-white truncate pr-4">
            {isEditMode
              ? (editedCardName || t("kanban.cardDetails"))
              : ((cardData as any).Name || cardData.BusinessName || cardData.name || t("kanban.cardDetails"))}
          </h2>
          <button
            onClick={handleCloseModal}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
        <div className="space-y-4 md:space-y-6">
          {parsedFields.length > 0 ? (
            isEditMode ? (
              /* ── Bulk edit mode ──────────────────────────────────────── */
              <div className="space-y-4">
                {/* Card name — visually separated */}
                <div className="mb-2 p-3 rounded-lg bg-[#65558F]/10 dark:bg-[#65558F]/20 border border-[#65558F]/30">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#65558F] dark:text-[#a594d4] mb-1.5">
                    {t("kanban.cardName")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editedCardName}
                    onChange={(e) => setEditedCardName(e.target.value)}
                    className="p-2 block w-full border border-[#65558F]/40 dark:border-[#65558F]/50 rounded-md hover:border-[#65558F]/70 focus:ring focus:ring-[#65558F]/30 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3" />
                {editedFields.map((field, idx) => (
                  <div key={idx} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.name}
                      {field.type === "link" && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">{t("kanban.linkBadge")}</span>
                      )}
                    </label>
                    <input
                      type={field.type === "link" ? "url" : "text"}
                      placeholder={field.type === "link" ? t("kanban.httpsPlaceholder") : t("kanban.enterFieldValue", { field: field.name.toLowerCase() })}
                      value={field.value}
                      onChange={(e) => setEditedFields(editedFields.map((f, i) => i === idx ? { ...f, value: e.target.value } : f))}
                      className="p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                ))}
                {/* Add new field */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("kanban.addField")}</p>
                  <div className="flex gap-2 items-end">
                    <input
                      type="text"
                      placeholder={t("kanban.fieldNamePh")}
                      value={newEditFieldName}
                      onChange={(e) => setNewEditFieldName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddEditField()}
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                    />
                    <select
                      value={newEditFieldType}
                      onChange={(e) => setNewEditFieldType(e.target.value as "text" | "link")}
                      className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                    >
                      <option value="text">{t("kanban.typeText")}</option>
                      <option value="link">{t("kanban.typeLink")}</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddEditField}
                      className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition whitespace-nowrap"
                    >
                      {t("kanban.addBtn")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── View / inline-edit mode ─────────────────────────────── */
              parsedFields.map((field, idx) => (
                <div key={idx} className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                      {field.name}
                      {field.type === "link" && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"> {t("kanban.linkBadge")}</span>
                      )}
                    </label>
                    <div className="relative flex-1">
                      <input
                        type={field.type === "link" ? "url" : "text"}
                        value={editingFieldIdx === idx ? fieldEditValue : field.value}
                        onChange={(e) => setFieldEditValue(e.target.value)}
                        onClick={() => { if (editingFieldIdx !== idx) { setEditingFieldIdx(idx); setFieldEditValue(field.value); } }}
                        className="p-2 block w-full border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white"
                      />
                      {field.type === "link" && editingFieldIdx !== idx && field.value && (
                        <a href={field.value} target="_blank" rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 hover:text-blue-700"
                          onClick={(e) => e.stopPropagation()}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                  {editingFieldIdx === idx && (
                    <div className="mt-2 flex flex-row space-x-2">
                      <button onClick={() => handleSaveField(idx)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">{t("kanban.save")}</button>
                      <button onClick={() => setEditingFieldIdx(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700">{t("kanban.cancel")}</button>
                    </div>
                  )}
                </div>
              ))
            )
          ) : (
            Object.keys(reorderedObject)
            .slice(0, 10)
            .map((key) => {
              const cardKey = key as CardKey;

              if (cardKey === "id") return null;

              if (cardKey === "isCommented") {
                return (
                  <div key={cardKey} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                    </label>
                    <input
                      type="checkbox"
                      name={cardKey}
                      checked={cardData[cardKey] as boolean}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                );
              }

              if (
                cardKey.toLowerCase() === "instagram" ||
                cardKey.toLowerCase() === "facebook" ||
                cardKey.toLowerCase() === "website"
              ) {
                return (
                  <div
                    key={cardKey}
                    className="flex flex-col sm:flex-row sm:items-center w-full mb-4"
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                      {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                    </label>
                    <div className="flex items-center space-x-2 w-full sm:w-3/4">
                      <div className="relative w-full">
                        <input
                          type="text"
                          name={cardKey}
                          value={isEditing === cardKey ? (value as string) : (cardData[cardKey] as string)}
                          onChange={(e) => setValue(e.target.value)}
                          onClick={() => handleClick(cardKey)}
                          className="mt-1 p-2 block w-full pr-10 border border-gray-300 dark:border-gray-600 rounded-md focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white hover:border-gray-400 dark:hover:border-gray-500"
                        />
                        {!isEditing && (
                          <a
                            href={extractBaseUrl(cardData[cardKey] as string)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                    {isEditing === cardKey && (
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-row space-x-2 sm:ml-1/4 sm:pl-1/4">
                        <button
                          onClick={() => handleSave(cardKey)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                          {t("kanban.save")}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                        >
                          {t("kanban.cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              if (cardKey.toLowerCase() === "dateofadded") {
                return (
                  <div key={cardKey} className="mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                        {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                      </label>
                      <input
                        type="text"
                        name={cardKey}
                        value={isEditing === cardKey ? (formatDate(value as string | boolean | null)) : (formatDate(cardData[cardKey] ?? null))}
                        onChange={(e) => setValue(e.target.value)}
                        onClick={() => handleClick(cardKey)}
                        className="mt-1 p-2 block w-full sm:w-3/4 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    {isEditing === cardKey && (
                      <div className="mt-4 sm:mt-2 flex flex-row space-x-2 sm:ml-1/4">
                        <button
                          onClick={() => handleSave(cardKey)}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                          {t("kanban.save")}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                        >
                          {t("kanban.cancel")}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={cardKey} className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-0 sm:mr-2 sm:w-1/4">
                      {cardKey.charAt(0).toUpperCase() + cardKey.slice(1)}
                    </label>
                    <input
                      type="text"
                      name={cardKey}
                      value={isEditing === cardKey ? (value as string) : (cardData[cardKey] as string)}
                      onChange={(e) => setValue(e.target.value)}
                      onClick={() => handleClick(cardKey)}
                      className="mt-1 p-2 block w-full sm:w-3/4 border border-gray-300 dark:border-gray-600 rounded-md hover:border-gray-400 dark:hover:border-gray-500 focus:ring focus:ring-blue-200 dark:focus:ring-blue-700 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {isEditing === cardKey && (
                    <div className="mt-4 sm:mt-2 flex flex-row space-x-2 sm:ml-1/4">
                      <button
                        onClick={() => handleSave(cardKey)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        {t("kanban.save")}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700"
                      >
                        {t("kanban.cancel")}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handleOpenDeleteModal}
            className="bg-red-500 text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition"
          >
            {t("kanban.delete")}
          </button>
          {parsedFields.length > 0 && (
            isEditMode ? (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEditMode}
                  className="bg-[#65558F] text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base hover:bg-[#544a7a] transition"
                >
                  {t("kanban.saveChanges")}
                </button>
                <button
                  onClick={handleCancelEditMode}
                  className="bg-gray-500 text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base hover:bg-gray-600 transition"
                >
                  {t("kanban.cancel")}
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnterEditMode}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white px-3 py-1 md:px-4 md:py-2 rounded text-sm md:text-base hover:bg-gray-300 dark:hover:bg-gray-500 transition"
              >
                {t("kanban.editCard")}
              </button>
            )
          )}
        </div>
        <CardMessageSection cardId={card.id} onCommentAction={(action, details) => activityRef.current?.addLocal(action, details)} />
        <ActivityLog ref={activityRef} cardId={card.id} />
        </div>{/* end scrollable body */}
      </div>
    </div>
  );

  return (
    <>
      <Draggable
        draggableId={card.id}
        index={index}
        isDragDisabled={isModalOpen || isMobile}
      >
        {(provided, snapshot) => (
          <div
            className={`relative bg-white shadow-lg mb-0 w-full h-10 space-y-2 dark:bg-[#464646] dark:text-[white] hover:shadow-xl ${
              snapshot.isDragging ? "scale-105" : ""
            }`}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              ...provided.draggableProps.style,
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onClick={handleOpenModal}
          >
            <div className="relative h-1 w-full bg-[#65558F] text-xs">
              <div className="absolute top-5 right-1">
                {cardData.DateOfAdded ? timeAgo(Number(cardData.DateOfAdded)) : "just now"}
              </div>
            </div>
            <p className={`flex flex-row items-center text-base font-semibold text-gray-800 dark:text-[white] truncate px-4 ${isMobile ? "pr-10" : ""}`}>
              {(cardData as any).Name || cardData.BusinessName || 'Untitled'}
              <div className="pl-2">
                {Object.keys(reorderedObject)
                  .slice(4, 5)
                  .map((key) => {
                    const cardKey = key as CardKey;
                    return cardData && cardData[cardKey] === "true" ? <FiMessageSquare /> : null;
                  })}
              </div>
            </p>
            {isMobile && (
              <button
                type="button"
                aria-label={t("kanban.cardActions")}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCardSheetOpen(true);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </Draggable>

      {/* Mobile card action sheet */}
      <MobileActionSheet
        open={isCardSheetOpen}
        title={(cardData as any).Name || cardData.BusinessName || "Untitled"}
        onClose={() => setIsCardSheetOpen(false)}
        closeLabel={t("kanban.close")}
      >
        <SheetAction
          icon={<ArrowUp className="w-5 h-5" />}
          label={t("kanban.moveUp")}
          disabled={isFirstCard}
          onClick={() => {
            onMoveCardWithin?.(columnId, card.id, "up");
            setIsCardSheetOpen(false);
          }}
        />
        <SheetAction
          icon={<ArrowDown className="w-5 h-5" />}
          label={t("kanban.moveDown")}
          disabled={isLastCard}
          onClick={() => {
            onMoveCardWithin?.(columnId, card.id, "down");
            setIsCardSheetOpen(false);
          }}
        />
        <div className="mt-1 border-t border-line dark:border-line-glass pt-2">
          <p className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-content-subtle dark:text-content-subtle-inverse">
            <FolderInput className="w-4 h-4" />
            {t("kanban.moveToColumn")}
          </p>
          {otherColumns.length === 0 ? (
            <p className="px-4 py-2 text-sm text-content-subtle dark:text-content-subtle-inverse">
              {t("kanban.noOtherColumns")}
            </p>
          ) : (
            otherColumns.map((col) => (
              <SheetAction
                key={col.id}
                label={col.name}
                onClick={() => {
                  onMoveCardToColumn?.(columnId, card.id, col.id);
                  setIsCardSheetOpen(false);
                }}
              />
            ))
          )}
        </div>
      </MobileActionSheet>

      {isModalOpen && ReactDOM.createPortal(modalContent, document.body)}
      {isDeleteModalOpen && ReactDOM.createPortal(deleteModalContent, document.body)}
      {isDiscardConfirmOpen && ReactDOM.createPortal(discardConfirmContent, document.body)}
    </>
  );
};

export default Card;
