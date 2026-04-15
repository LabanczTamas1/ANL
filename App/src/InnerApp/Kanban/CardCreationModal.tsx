import React, { useState, useEffect } from "react";
import ModalHeader from "./ModalHeader";
import { getTemplates, createCard } from "../../services/api/kanbanApi";

export interface FieldDef {
  name: string;
  type: "text" | "link";
  value: string;
}

interface Template {
  id: string;
  name: string;
  fields: { name: string; type: "text" | "link" }[];
}

interface CardCreationModalProps {
  show: boolean;
  onClose: () => void;
  columnId: string | null;
  onCardCreated: (columnId: string, cardId: string, cardName: string, fields: FieldDef[]) => void;
}

type Step = "choose" | "form";

const CardCreationModal: React.FC<CardCreationModalProps> = ({
  show,
  onClose,
  columnId,
  onCardCreated,
}) => {
  const [step, setStep] = useState<Step>("choose");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [cardName, setCardName] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "link">("text");
  const [saving, setSaving] = useState(false);
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (show) {
      setStep("choose");
      setSelectedTemplate(null);
      setCardName("");
      setFields([]);
      setNewFieldName("");
      setSavingTemplateId(null);

      getTemplates()
        .then((res) => setTemplates(res.data.templates || []))
        .catch(() => setTemplates([]));
    }
  }, [show]);

  if (!show || !columnId) return null;

  /** Clicking a template instantly creates the card with empty fields from the template */
  const handlePickTemplate = async (template: Template) => {
    setSavingTemplateId(template.id);
    try {
      const templateFields: FieldDef[] = template.fields.map((f) => ({
        name: f.name,
        type: f.type,
        value: "",
      }));

      const payload: Record<string, unknown> = {
        name: template.name,
        columnId,
        fields: templateFields.map((f) => ({ name: f.name, type: f.type, value: f.value })),
        templateId: template.id,
        isCommented: false,
      };

      const res = await createCard(payload);
      onCardCreated(columnId, res.data.cardId, template.name, templateFields);
      onClose();
    } catch (err) {
      console.error("Error creating card from template:", err);
    } finally {
      setSavingTemplateId(null);
    }
  };

  const handleStartFromScratch = () => {
    setSelectedTemplate(null);
    setFields([]);
    setStep("form");
  };

  const handleAddField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) return;
    if (fields.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) return;
    setFields([...fields, { name: trimmed, type: newFieldType, value: "" }]);
    setNewFieldName("");
    setNewFieldType("text");
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleFieldValueChange = (idx: number, value: string) => {
    setFields(fields.map((f, i) => (i === idx ? { ...f, value } : f)));
  };

  const handleSave = async () => {
    if (!cardName.trim()) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: cardName,
        columnId,
        fields: fields.map((f) => ({ name: f.name, type: f.type, value: f.value })),
        isCommented: false,
      };
      if (selectedTemplate) payload.templateId = selectedTemplate.id;

      const res = await createCard(payload);
      onCardCreated(columnId, res.data.cardId, cardName, fields);
      onClose();
    } catch (err) {
      console.error("Error creating card:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">
        <ModalHeader
          title={step === "choose" ? "Create New Card" : "New Card (From Scratch)"}
          onClose={onClose}
        />
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">

          {/* STEP 1: Choose template or scratch */}
          {step === "choose" && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300 text-center">
                How would you like to create this card?
              </p>

              <button
                onClick={handleStartFromScratch}
                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#65558F] dark:hover:border-[#65558F] hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left"
              >
                <div className="font-semibold text-gray-800 dark:text-white">
                  Start from Scratch
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Create a blank card and add custom fields
                </div>
              </button>

              {templates.length > 0 && (
                <>
                  <div className="flex items-center gap-2 my-2">
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">or choose a template</span>
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handlePickTemplate(t)}
                        disabled={savingTemplateId !== null}
                        className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#65558F] dark:hover:border-[#65558F] hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-medium text-gray-800 dark:text-white flex items-center justify-between">
                          <span>{t.name}</span>
                          {savingTemplateId === t.id && (
                            <span className="text-xs text-[#65558F] dark:text-purple-300 animate-pulse">Creating...</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t.fields.length} field{t.fields.length !== 1 ? "s" : ""}:{" "}
                          {t.fields.map((f) => f.name).join(", ")}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 2: Form */}
          {step === "form" && (
            <div className="space-y-4">
              {/* Card name (always required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Card Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter card name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                />
              </div>

              {/* Existing fields */}
              {fields.map((field, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {field.name}
                      {field.type === "link" && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          link
                        </span>
                      )}
                    </label>
                    <input
                      type={field.type === "link" ? "url" : "text"}
                      placeholder={field.type === "link" ? "https://..." : `Enter ${field.name.toLowerCase()}`}
                      value={field.value}
                      onChange={(e) => handleFieldValueChange(idx, e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                    />
                  </div>
                  {/* Only allow removing fields on scratch cards */}
                  {!selectedTemplate && (
                    <button
                      onClick={() => handleRemoveField(idx)}
                      className="mt-7 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-lg"
                      title="Remove field"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}

              {/* Add new field controls (always available, even for template cards) */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add a field
                </p>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Field name"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                    />
                  </div>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as "text" | "link")}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                  >
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition whitespace-nowrap"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setStep("choose")}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  ← Back
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!cardName.trim() || saving}
                    className="px-6 py-2 rounded-lg bg-[#65558F] text-white hover:bg-[#544a7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Create Card"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardCreationModal;
