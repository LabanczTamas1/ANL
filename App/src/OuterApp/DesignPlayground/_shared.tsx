import React, { useState, useCallback } from "react";
import { Copy, CheckCheck } from "lucide-react";

/* ─── CodeBlock ───────────────────────────────────────────────────────────── */

export const CodeBlock: React.FC<{ code: string; label?: string }> = ({
  code,
  label,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [code]);

  return (
    <div className="mt-4">
      {label && (
        <p className="text-content-muted text-xs mb-1 font-semibold uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="relative group">
        <pre className="bg-[#0d1117] border border-line-glass rounded-xl p-4 overflow-x-auto text-sm leading-relaxed">
          <code className="text-[#c9d1d9] whitespace-pre">{code}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface-elevated/70 border border-line-glass text-content-muted hover:text-white hover:bg-surface-elevated transition opacity-0 group-hover:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? (
            <CheckCheck size={14} className="text-status-success" />
          ) : (
            <Copy size={14} />
          )}
        </button>
      </div>
    </div>
  );
};

/* ─── Section ─────────────────────────────────────────────────────────────── */

export const Section: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="mb-4">
    <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
    {description && (
      <p className="text-content-muted text-sm mb-6">{description}</p>
    )}
    {!description && <div className="mb-6" />}
    {children}
  </section>
);

/* ─── PropControl ─────────────────────────────────────────────────────────── */

export const PropControl: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <label className="flex items-center gap-2 text-sm text-content-muted">
    <span className="min-w-[90px]">{label}</span>
    {children}
  </label>
);

/* ─── ColorSwatch ─────────────────────────────────────────────────────────── */

export const ColorSwatch: React.FC<{
  name: string;
  value: string;
  tailwind: string;
}> = ({ name, value, tailwind }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-lg border border-line-glass shrink-0"
      style={{ background: value }}
    />
    <div>
      <p className="text-white text-sm font-medium">{name}</p>
      <p className="text-content-muted text-xs">
        {tailwind} · {value}
      </p>
    </div>
  </div>
);
