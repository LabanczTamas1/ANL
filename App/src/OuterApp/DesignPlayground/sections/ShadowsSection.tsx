import React from "react";
import { Section } from "../_shared";

const ShadowsSection: React.FC = () => (
  <Section title="Shadows" description="Elevation tokens for depth and layering.">
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {[
        { cls: "shadow-soft", label: "soft" },
        { cls: "shadow-card", label: "card" },
        { cls: "shadow-card-hover", label: "card-hover" },
        { cls: "shadow-glass", label: "glass" },
        { cls: "shadow-dark-card", label: "dark-card" },
        { cls: "shadow-elevated", label: "elevated" },
      ].map((s) => (
        <div
          key={s.cls}
          className={`p-6 bg-surface-elevated rounded-xl border border-line-glass text-center ${s.cls}`}
        >
          <span className="text-white text-sm font-medium">{s.label}</span>
        </div>
      ))}
    </div>
  </Section>
);

export default ShadowsSection;
