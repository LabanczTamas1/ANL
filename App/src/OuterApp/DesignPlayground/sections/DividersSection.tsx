import React, { useState } from "react";
import GradientDivider from "@/OuterApp/components/GradientDivider";
import { Section, PropControl, CodeBlock } from "../_shared";

const DividersSection: React.FC = () => {
  const [dividerStyle, setDividerStyle] = useState<
    "wave" | "gradient" | "mesh" | "glow"
  >("wave");
  const [dividerFlipped, setDividerFlipped] = useState(false);

  return (
    <Section
      title="Dividers"
      description="GradientDivider — wave, gradient, mesh, glow styles."
    >
      <div className="pg-control p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap gap-4">
        <PropControl label="Style">
          <select
            value={dividerStyle}
            onChange={(e) => setDividerStyle(e.target.value as any)}
            className="bg-surface-overlay text-white border border-line-dark rounded-lg px-2 py-1 text-sm"
          >
            <option value="wave">wave</option>
            <option value="gradient">gradient</option>
            <option value="mesh">mesh</option>
            <option value="glow">glow</option>
          </select>
        </PropControl>
        <PropControl label="Flipped">
          <input
            type="checkbox"
            checked={dividerFlipped}
            onChange={(e) => setDividerFlipped(e.target.checked)}
            className="accent-brand"
          />
        </PropControl>
      </div>

      <div className="rounded-xl overflow-hidden border border-line-glass bg-surface-overlay">
        <GradientDivider style={dividerStyle} flip={dividerFlipped} />
      </div>

      <CodeBlock
        label="Copy this code"
        code={`import GradientDivider from "@/OuterApp/components/GradientDivider";

<GradientDivider${dividerStyle !== "wave" ? ` style="${dividerStyle}"` : ""}${dividerFlipped ? " flip" : ""} />`}
      />
    </Section>
  );
};

export default DividersSection;
