import React from "react";
import {
  FiArrowUp,
  FiArrowDown,
  FiTrash2,
  FiType,
  FiImage,
  FiList,
  FiAlignLeft,
} from "react-icons/fi";
import { BsBlockquoteLeft } from "react-icons/bs";
import { Button, Input, Select } from "../../../design-system/components";
import { useLanguage } from "../../../hooks/useLanguage";
import type { ArticleBlock } from "../../../services/api/articleApi";

interface BlockEditorProps {
  blocks: ArticleBlock[];
  onChange: (blocks: ArticleBlock[]) => void;
}

const inputClass =
  "w-full rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-dark px-3 py-2 text-sm text-content dark:text-content-inverse placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors";

const safePreview = (url: string): string => {
  const t = (url || "").trim();
  if (t.startsWith("/")) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return "";
};

/**
 * Block-based body editor. Authors stack paragraphs, headings, images, quotes,
 * and lists in any order so they control exactly where each image appears.
 */
const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const { t } = useLanguage();

  const update = (index: number, patch: Partial<ArticleBlock>) => {
    onChange(blocks.map((b, i) => (i === index ? ({ ...b, ...patch } as ArticleBlock) : b)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (index: number) => onChange(blocks.filter((_, i) => i !== index));

  const add = (block: ArticleBlock) => onChange([...blocks, block]);

  const addButtons: { label: string; icon: React.ReactNode; block: ArticleBlock }[] = [
    { label: t("articles.block.paragraph"), icon: <FiAlignLeft />, block: { type: "paragraph", text: "" } },
    { label: t("articles.block.heading"), icon: <FiType />, block: { type: "heading", text: "", level: 2 } },
    { label: t("articles.block.image"), icon: <FiImage />, block: { type: "image", url: "", caption: "", alt: "", align: "center" } },
    { label: t("articles.block.quote"), icon: <BsBlockquoteLeft />, block: { type: "quote", text: "", cite: "" } },
    { label: t("articles.block.list"), icon: <FiList />, block: { type: "list", ordered: false, items: [] } },
  ];

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-line dark:border-line-dark p-8 text-center text-sm text-content-muted">
          {t("articles.block.empty")}
        </div>
      )}

      {blocks.map((block, index) => (
        <div
          key={index}
          className="rounded-xl border border-line dark:border-line-dark bg-black/[0.02] dark:bg-white/[0.02] p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand dark:text-brand-focus">
              {t(`articles.block.${block.type}`)}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded p-1.5 text-content-muted hover:bg-black/[0.05] disabled:opacity-30 dark:hover:bg-white/10"
                aria-label="Move up"
              >
                <FiArrowUp />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                className="rounded p-1.5 text-content-muted hover:bg-black/[0.05] disabled:opacity-30 dark:hover:bg-white/10"
                aria-label="Move down"
              >
                <FiArrowDown />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded p-1.5 text-status-error hover:bg-status-error/10"
                aria-label="Delete block"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>

          {block.type === "paragraph" && (
            <textarea
              className={`${inputClass} min-h-[90px] resize-y`}
              placeholder={t("articles.block.paragraphPlaceholder")}
              value={block.text}
              onChange={(e) => update(index, { text: e.target.value })}
            />
          )}

          {block.type === "heading" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                containerClassName="flex-1"
                placeholder={t("articles.block.headingPlaceholder")}
                value={block.text}
                onChange={(e) => update(index, { text: e.target.value })}
              />
              <Select
                value={String(block.level)}
                onChange={(e) => update(index, { level: Number(e.target.value) })}
              >
                <option value="2">H2</option>
                <option value="3">H3</option>
                <option value="4">H4</option>
              </Select>
            </div>
          )}

          {block.type === "image" && (
            <div className="flex flex-col gap-2">
              <Input
                placeholder={t("articles.block.imageUrlPlaceholder")}
                value={block.url}
                onChange={(e) => update(index, { url: e.target.value })}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  containerClassName="flex-1"
                  placeholder={t("articles.block.imageAltPlaceholder")}
                  value={block.alt}
                  onChange={(e) => update(index, { alt: e.target.value })}
                />
                <Select
                  value={block.align}
                  onChange={(e) =>
                    update(index, { align: e.target.value as "left" | "center" | "right" })
                  }
                >
                  <option value="left">{t("articles.align.left")}</option>
                  <option value="center">{t("articles.align.center")}</option>
                  <option value="right">{t("articles.align.right")}</option>
                </Select>
              </div>
              <Input
                placeholder={t("articles.block.imageCaptionPlaceholder")}
                value={block.caption}
                onChange={(e) => update(index, { caption: e.target.value })}
              />
              {safePreview(block.url) && (
                <img
                  src={safePreview(block.url)}
                  alt={block.alt}
                  className="mt-1 max-h-48 rounded-lg border border-line dark:border-line-dark object-cover"
                />
              )}
            </div>
          )}

          {block.type === "quote" && (
            <div className="flex flex-col gap-2">
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                placeholder={t("articles.block.quotePlaceholder")}
                value={block.text}
                onChange={(e) => update(index, { text: e.target.value })}
              />
              <Input
                placeholder={t("articles.block.citePlaceholder")}
                value={block.cite}
                onChange={(e) => update(index, { cite: e.target.value })}
              />
            </div>
          )}

          {block.type === "list" && (
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-content-muted">
                <input
                  type="checkbox"
                  checked={block.ordered}
                  onChange={(e) => update(index, { ordered: e.target.checked })}
                  className="accent-brand"
                />
                {t("articles.block.ordered")}
              </label>
              <textarea
                className={`${inputClass} min-h-[90px] resize-y`}
                placeholder={t("articles.block.listPlaceholder")}
                value={block.items.join("\n")}
                onChange={(e) =>
                  update(index, {
                    items: e.target.value.split("\n").map((s) => s).filter((s) => s.length > 0),
                  })
                }
              />
            </div>
          )}
        </div>
      ))}

      {/* Add block toolbar */}
      <div className="flex flex-wrap gap-2 pt-1">
        {addButtons.map((b) => (
          <Button
            key={b.label}
            type="button"
            size="sm"
            variant="outline"
            leftIcon={b.icon}
            onClick={() => add(b.block)}
          >
            {b.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BlockEditor;
