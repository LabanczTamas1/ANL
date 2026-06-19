import React, { useState, useEffect } from "react";
import ModalHeader from "./ModalHeader";
import {
  getTemplates,
  createTemplate,
  deleteTemplate,
} from "../../services/api/kanbanApi";
import { useLanguage } from "../../hooks/useLanguage";

interface FieldDef {
  name: string;
  type: "text" | "link";
}

interface Template {
  id: string;
  name: string;
  fields: FieldDef[];
}

interface TemplateBuilderProps {
  show: boolean;
  onClose: () => void;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ show, onClose }) => {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  // New template form state
  const [templateName, setTemplateName] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "link">("text");
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getTemplates();
      setTemplates(res.data.templates || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) fetchTemplates();
  }, [show]);

  if (!show) return null;

  const handleAddField = () => {
    const trimmed = newFieldName.trim();
    if (!trimmed) return;
    if (fields.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) return;
    setFields([...fields, { name: trimmed, type: newFieldType }]);
    setNewFieldName("");
    setNewFieldType("text");
  };

  const handleRemoveField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim() || fields.length === 0) return;
    setSaving(true);
    try {
      await createTemplate({ name: templateName.trim(), fields });
      setTemplateName("");
      setFields([]);
      setShowForm(false);
      await fetchTemplates();
    } catch (err) {
      console.error("Error creating template:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setTemplateName("");
    setFields([]);
    setNewFieldName("");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-[650px] max-h-[90vh] flex flex-col overflow-hidden">
        <ModalHeader title={t("kanban.templateBuilder")} onClose={onClose} />
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">

          {/* Existing templates list */}
          {!showForm && (
            <div className="space-y-3">
              {loading ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t("kanban.loadingTemplates")}
                </p>
              ) : templates.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  {t("kanban.noTemplates")}
                </p>
              ) : (
                templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex items-start justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-white">
                        {tpl.name}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {tpl.fields.map((f, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              f.type === "link"
                                ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {f.name}
                            {f.type === "link" && " 🔗"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(tpl.id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-3 flex-shrink-0"
                      title={t("kanban.deleteTemplate")}
                    >
                      🗑️
                    </button>
                  </div>
                ))
              )}

              <button
                onClick={() => setShowForm(true)}
                className="w-full py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#65558F] dark:hover:border-[#65558F] text-gray-600 dark:text-gray-300 hover:text-[#65558F] dark:hover:text-[#65558F] transition font-medium"
              >
                {t("kanban.createNewTemplate")}
              </button>
            </div>
          )}

          {/* Create template form */}
          {showForm && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("kanban.templateNameLabel")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder={t("kanban.templateNamePh")}
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                />
              </div>

              {/* Fields list */}
              {fields.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("kanban.fields")}
                  </p>
                  {fields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
                    >
                      <span className="flex-1 text-gray-800 dark:text-white">
                        {field.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          field.type === "link"
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {field.type}
                      </span>
                      <button
                        onClick={() => handleRemoveField(idx)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add field */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t("kanban.fieldNamePh")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("kanban.fieldNamePh2")}
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {t("kanban.typeLabel")}
                  </label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as "text" | "link")}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#65558F] focus:outline-none"
                  >
                    <option value="text">{t("kanban.typeText")}</option>
                    <option value="link">{t("kanban.typeLink")}</option>
                  </select>
                </div>
                <button
                  onClick={handleAddField}
                  className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500 transition whitespace-nowrap"
                >
                  {t("kanban.addBtn")}
                </button>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={resetForm}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  {t("kanban.backToList")}
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || fields.length === 0 || saving}
                  className="px-6 py-2 rounded-lg bg-[#65558F] text-white hover:bg-[#544a7a] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? t("kanban.saving") : t("kanban.saveTemplate")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
