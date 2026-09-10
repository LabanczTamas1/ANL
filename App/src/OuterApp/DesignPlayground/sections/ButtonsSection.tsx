import React, { useState } from "react";
import GradientButton from "@/InnerApp/components/GradientButton";
import { Section, PropControl, CodeBlock } from "../_shared";

const ButtonsSection: React.FC = () => {
  const [btnVariant, setBtnVariant] = useState<
    "primary" | "secondary" | "danger"
  >("primary");
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnFullWidth, setBtnFullWidth] = useState(false);

  return (
    <Section
      title="Buttons"
      description="GradientButton — primary, secondary, danger variants."
    >
      {/* controls */}
      <div className="pg-control p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap gap-4">
        <PropControl label="Variant">
          <select
            value={btnVariant}
            onChange={(e) => setBtnVariant(e.target.value as any)}
            className="bg-surface-overlay text-white border border-line-dark rounded-lg px-2 py-1 text-sm"
          >
            <option value="primary">primary</option>
            <option value="secondary">secondary</option>
            <option value="danger">danger</option>
          </select>
        </PropControl>
        <PropControl label="Loading">
          <input
            type="checkbox"
            checked={btnLoading}
            onChange={(e) => setBtnLoading(e.target.checked)}
            className="accent-brand"
          />
        </PropControl>
        <PropControl label="Disabled">
          <input
            type="checkbox"
            checked={btnDisabled}
            onChange={(e) => setBtnDisabled(e.target.checked)}
            className="accent-brand"
          />
        </PropControl>
        <PropControl label="Full Width">
          <input
            type="checkbox"
            checked={btnFullWidth}
            onChange={(e) => setBtnFullWidth(e.target.checked)}
            className="accent-brand"
          />
        </PropControl>
      </div>

      {/* preview */}
      <div className="p-6 rounded-xl border border-line-glass bg-surface-elevated/30 flex items-center justify-center">
        <GradientButton
          variant={btnVariant}
          loading={btnLoading}
          disabled={btnDisabled}
          fullWidth={btnFullWidth}
        >
          Button Label
        </GradientButton>
      </div>

      <CodeBlock
        label="Copy this code"
        code={`import GradientButton from "@/InnerApp/components/GradientButton";

<GradientButton${btnVariant !== "primary" ? `\n  variant="${btnVariant}"` : ""}${btnLoading ? "\n  loading" : ""}${btnDisabled ? "\n  disabled" : ""}${btnFullWidth ? "\n  fullWidth" : ""}${btnVariant !== "primary" || btnLoading || btnDisabled || btnFullWidth ? "\n" : ""}>
  Button Label
</GradientButton>`}
      />

      {/* static examples */}
      <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
        All variants at a glance
      </h3>
      <div className="flex flex-wrap gap-3">
        <GradientButton variant="primary">Primary</GradientButton>
        <GradientButton variant="secondary">Secondary</GradientButton>
        <GradientButton variant="danger">Danger</GradientButton>
        <GradientButton disabled>Disabled</GradientButton>
        <GradientButton loading>Loading</GradientButton>
      </div>

      <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
        Submit Button (form style)
      </h3>
      <div className="max-w-sm">
        <button className="w-full py-3 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-semibold transition shadow-lg shadow-[#e11d48]/40">
          Submit
        </button>
      </div>
      <CodeBlock
        label="Submit button (Tailwind)"
        code={`<button className="w-full py-3 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white font-semibold transition shadow-lg shadow-[#e11d48]/40">
  Submit
</button>`}
      />
    </Section>
  );
};

export default ButtonsSection;
