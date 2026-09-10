import React from "react";
import { Section, CodeBlock } from "../_shared";

const LoadingSection: React.FC = () => (
  <Section
    title="Loading States"
    description="Spinner, skeleton, and progress indicators."
  >
    <div className="flex flex-wrap items-center gap-8">
      {/* spinner */}
      <div className="flex flex-col items-center gap-2">
        <svg
          className="animate-spin w-8 h-8 text-brand"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <span className="text-content-muted text-xs">Spinner</span>
      </div>

      {/* pulsing dot */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce" />
          <div
            className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
        <span className="text-content-muted text-xs">Dots</span>
      </div>
    </div>

    <CodeBlock
      label="Spinner code"
      code={`<svg className="animate-spin w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none">
  <circle className="opacity-25" cx="12" cy="12" r="10"
    stroke="currentColor" strokeWidth="4" />
  <path className="opacity-75" fill="currentColor"
    d="M4 12a8 8 0 018-8v8z" />
</svg>`}
    />

    <CodeBlock
      label="Bouncing dots code"
      code={`<div className="flex gap-1.5">
  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce" />
  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce"
    style={{ animationDelay: "0.1s" }} />
  <div className="w-2.5 h-2.5 rounded-full bg-brand animate-bounce"
    style={{ animationDelay: "0.2s" }} />
</div>`}
    />

    <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
      Skeleton loading
    </h3>
    <div className="max-w-sm space-y-3">
      <div className="h-4 w-3/4 bg-surface-elevated rounded animate-pulse" />
      <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
      <div className="h-4 w-5/6 bg-surface-elevated rounded animate-pulse" />
      <div className="flex gap-3 mt-4">
        <div className="w-12 h-12 bg-surface-elevated rounded-full animate-pulse" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 w-2/3 bg-surface-elevated rounded animate-pulse" />
          <div className="h-3 w-1/2 bg-surface-elevated rounded animate-pulse" />
        </div>
      </div>
    </div>

    <CodeBlock
      label="Skeleton loading code"
      code={`<div className="space-y-3">
  <div className="h-4 w-3/4 bg-surface-elevated rounded animate-pulse" />
  <div className="h-4 w-full bg-surface-elevated rounded animate-pulse" />
  <div className="h-4 w-5/6 bg-surface-elevated rounded animate-pulse" />
  <div className="flex gap-3 mt-4">
    <div className="w-12 h-12 bg-surface-elevated rounded-full animate-pulse" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3 w-2/3 bg-surface-elevated rounded animate-pulse" />
      <div className="h-3 w-1/2 bg-surface-elevated rounded animate-pulse" />
    </div>
  </div>
</div>`}
    />

    <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
      Progress bar
    </h3>
    <div className="max-w-sm">
      <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand to-accent-teal rounded-full transition-all duration-1000"
          style={{ width: "65%" }}
        />
      </div>
      <p className="text-content-muted text-xs mt-1">65% complete</p>
    </div>

    <CodeBlock
      label="Progress bar code"
      code={`<div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-brand to-accent-teal rounded-full transition-all duration-1000"
    style={{ width: "65%" }}
  />
</div>`}
    />
  </Section>
);

export default LoadingSection;
