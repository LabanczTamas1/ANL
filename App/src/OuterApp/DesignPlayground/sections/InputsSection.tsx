import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { Section, PropControl, CodeBlock } from "../_shared";

const InputsSection: React.FC = () => {
  const [inputError, setInputError] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <Section
      title="Inputs"
      description="Text, password, and checkbox form primitives."
    >
      {/* controls */}
      <div className="pg-control p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap gap-4">
        <PropControl label="Error state">
          <input
            type="checkbox"
            checked={inputError}
            onChange={(e) => setInputError(e.target.checked)}
            className="accent-brand"
          />
        </PropControl>
        <PropControl label="Disabled">
          <input
            type="checkbox"
            checked={inputDisabled}
            onChange={(e) => setInputDisabled(e.target.checked)}
            className="accent-brand"
          />
        </PropControl>
      </div>

      <div className="max-w-md space-y-4">
        {/* text input */}
        <div>
          <label className="text-content-muted text-sm mb-1 block">
            Text Input
          </label>
          <input
            type="text"
            placeholder="Enter your email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={inputDisabled}
            className={`w-full p-3 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition disabled:opacity-50 disabled:cursor-not-allowed ${
              inputError ? "border-status-error" : "border-line-dark"
            }`}
          />
          {inputError && (
            <p className="text-status-error text-sm mt-1">
              This field is required
            </p>
          )}
        </div>

        {/* password input */}
        <div>
          <label className="text-content-muted text-sm mb-1 block">
            Password Input
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={inputDisabled}
              className={`w-full p-3 pr-12 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition disabled:opacity-50 disabled:cursor-not-allowed ${
                inputError ? "border-status-error" : "border-line-dark"
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-white transition"
              onClick={() => setShowPassword((p) => !p)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* checkbox */}
        <div>
          <label className="flex items-start gap-2 text-sm text-content-subtle-inverse">
            <input type="checkbox" className="mt-0.5 accent-brand" />
            <span>I agree to the terms and conditions</span>
          </label>
        </div>

        {/* textarea */}
        <div>
          <label className="text-content-muted text-sm mb-1 block">
            Textarea
          </label>
          <textarea
            placeholder="Write a message..."
            rows={3}
            disabled={inputDisabled}
            className={`w-full p-3 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
              inputError ? "border-status-error" : "border-line-dark"
            }`}
          />
        </div>

        {/* select */}
        <div>
          <label className="text-content-muted text-sm mb-1 block">Select</label>
          <div className="relative">
            <select
              disabled={inputDisabled}
              className={`w-full p-3 rounded-xl border bg-surface-overlay text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-focus transition disabled:opacity-50 disabled:cursor-not-allowed ${
                inputError ? "border-status-error" : "border-line-dark"
              }`}
            >
              <option value="">Select an option</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
              size={18}
            />
          </div>
        </div>
      </div>

      <CodeBlock
        label="Input code"
        code={`<input
  type="text"
  placeholder="Enter your email"${inputDisabled ? "\n  disabled" : ""}
  className={\`w-full p-3 rounded-xl border bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition${inputDisabled ? " disabled:opacity-50 disabled:cursor-not-allowed" : ""} ${inputError ? "border-status-error" : "border-line-dark"}\`}
/>${inputError ? "\n<p className=\"text-status-error text-sm mt-1\">This field is required</p>" : ""}`}
      />

      <CodeBlock
        label="Password input code"
        code={`import { Eye, EyeOff } from "lucide-react";

<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"${inputDisabled ? "\n    disabled" : ""}
    className="w-full p-3 pr-12 rounded-xl border${inputError ? " border-status-error" : " border-line-dark"} bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition"
  />
  <button
    type="button"
    className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-white transition"
    onClick={() => setShowPassword(p => !p)}
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>`}
      />

      <CodeBlock
        label="Checkbox code"
        code={`<label className="flex items-start gap-2 text-sm text-content-subtle-inverse">
  <input type="checkbox" className="mt-0.5 accent-brand" />
  <span>I agree to the terms and conditions</span>
</label>`}
      />

      <CodeBlock
        label="Textarea code"
        code={`<textarea
  placeholder="Write a message..."
  rows={3}${inputDisabled ? "\n  disabled" : ""}
  className="w-full p-3 rounded-xl border${inputError ? " border-status-error" : " border-line-dark"} bg-surface-overlay text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand-focus transition resize-none"
/>`}
      />

      <CodeBlock
        label="Select code"
        code={`import { ChevronDown } from "lucide-react";

<div className="relative">
  <select
    className="w-full p-3 rounded-xl border${inputError ? " border-status-error" : " border-line-dark"} bg-surface-overlay text-white appearance-none focus:outline-none focus:ring-2 focus:ring-brand-focus transition"
  >
    <option value="">Select an option</option>
    <option value="1">Option 1</option>
  </select>
  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" size={18} />
</div>`}
      />
    </Section>
  );
};

export default InputsSection;
