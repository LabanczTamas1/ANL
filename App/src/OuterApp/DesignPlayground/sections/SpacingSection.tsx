import React from "react";
import { Section } from "../_shared";

const SpacingSection: React.FC = () => (
  <Section
    title="Spacing & Border Radius"
    description="Base unit: 4px. Border radius from sm to full."
  >
    <h3 className="text-lg font-semibold text-white mb-3">Spacing scale</h3>
    <div className="flex flex-wrap items-end gap-3 mb-8">
      {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((n) => (
        <div key={n} className="flex flex-col items-center gap-1">
          <div
            className="bg-brand rounded"
            style={{ width: n * 4, height: n * 4 }}
          />
          <span className="text-content-muted text-xs">
            {n} ({n * 4}px)
          </span>
        </div>
      ))}
    </div>

    <h3 className="text-lg font-semibold text-white mb-3">Border radius</h3>
    <div className="flex flex-wrap gap-4">
      {[
        { cls: "rounded-sm", label: "sm (2px)" },
        { cls: "rounded", label: "base (4px)" },
        { cls: "rounded-md", label: "md (6px)" },
        { cls: "rounded-lg", label: "lg (8px)" },
        { cls: "rounded-xl", label: "xl (12px)" },
        { cls: "rounded-2xl", label: "2xl (16px)" },
        { cls: "rounded-3xl", label: "3xl (24px)" },
        { cls: "rounded-full", label: "full" },
      ].map((r) => (
        <div key={r.cls} className="flex flex-col items-center gap-1">
          <div className={`w-14 h-14 bg-brand/60 border border-brand ${r.cls}`} />
          <span className="text-content-muted text-xs">{r.label}</span>
        </div>
      ))}
    </div>
  </Section>
);

export default SpacingSection;
