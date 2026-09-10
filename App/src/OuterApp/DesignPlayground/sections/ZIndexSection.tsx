import React from "react";
import { Section } from "../_shared";

const ZIndexSection: React.FC = () => (
  <Section
    title="Z-Index Scale"
    description="Layering tokens for consistent stacking."
  >
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { name: "base", value: 0 },
        { name: "raised", value: 10 },
        { name: "dropdown", value: 20 },
        { name: "sticky", value: 30 },
        { name: "fixed", value: 40 },
        { name: "navbar", value: 50 },
        { name: "modal", value: 60 },
        { name: "toast", value: 70 },
        { name: "tooltip", value: 80 },
        { name: "overlay", value: 100 },
      ].map((z) => (
        <div
          key={z.name}
          className="p-3 rounded-lg border border-line-glass bg-surface-elevated/30 text-center"
        >
          <p className="text-white font-mono text-sm">{z.value}</p>
          <p className="text-content-muted text-xs">{z.name}</p>
        </div>
      ))}
    </div>
  </Section>
);

export default ZIndexSection;
