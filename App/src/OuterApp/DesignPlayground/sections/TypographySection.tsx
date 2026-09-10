import React from "react";
import { Section } from "../_shared";

const TypographySection: React.FC = () => (
  <Section
    title="Typography"
    description="Font sizes and weights — Inter font family."
  >
    <div className="space-y-4">
      {[
        { cls: "text-5xl font-extrabold", label: "5xl / extrabold — Hero heading" },
        { cls: "text-4xl font-bold", label: "4xl / bold — Page heading" },
        { cls: "text-3xl font-bold", label: "3xl / bold — Section heading" },
        { cls: "text-2xl font-semibold", label: "2xl / semibold — Card title" },
        { cls: "text-xl font-semibold", label: "xl / semibold — Subtitle" },
        { cls: "text-lg font-medium", label: "lg / medium — Large body" },
        { cls: "text-base font-normal", label: "base / normal — Body" },
        { cls: "text-sm font-normal", label: "sm / normal — Small body" },
        { cls: "text-xs font-normal", label: "xs / normal — Caption" },
      ].map((t) => (
        <div key={t.cls} className="flex items-baseline gap-4">
          <span className={`text-white ${t.cls}`}>Aa</span>
          <span className="text-content-muted text-sm">{t.label}</span>
        </div>
      ))}
    </div>
  </Section>
);

export default TypographySection;
