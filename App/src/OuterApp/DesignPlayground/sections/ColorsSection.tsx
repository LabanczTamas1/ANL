import React from "react";
import { Section, ColorSwatch } from "../_shared";

const ColorsSection: React.FC = () => (
  <Section
    title="Colors"
    description="Semantic color tokens from the design system."
  >
    {/* brand */}
    <h3 className="text-lg font-semibold text-white mb-3">Brand</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <ColorSwatch name="Default" value="#65558F" tailwind="bg-brand" />
      <ColorSwatch name="Hover" value="#7c6bb7" tailwind="bg-brand-hover" />
      <ColorSwatch
        name="Muted"
        value="rgba(101,85,143,0.2)"
        tailwind="bg-brand-muted"
      />
      <ColorSwatch name="Focus" value="#a78bfa" tailwind="ring-brand-focus" />
    </div>

    {/* accent */}
    <h3 className="text-lg font-semibold text-white mb-3">Accent</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      <ColorSwatch name="Teal" value="#7AA49F" tailwind="bg-accent-teal" />
      <ColorSwatch name="Rose" value="#9A4647" tailwind="bg-accent-rose" />
      <ColorSwatch name="Purple" value="#9B7ADB" tailwind="bg-accent-purple" />
    </div>

    {/* surface */}
    <h3 className="text-lg font-semibold text-white mb-3">Surface</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <ColorSwatch name="Light" value="#FFFFFF" tailwind="bg-surface-light" />
      <ColorSwatch name="Dark" value="#121212" tailwind="bg-surface-dark" />
      <ColorSwatch
        name="Elevated"
        value="#1e1e1e"
        tailwind="bg-surface-elevated"
      />
      <ColorSwatch
        name="Overlay"
        value="#080A0D"
        tailwind="bg-surface-overlay"
      />
    </div>

    {/* status */}
    <h3 className="text-lg font-semibold text-white mb-3">Status</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <ColorSwatch name="Error" value="#EF4444" tailwind="text-status-error" />
      <ColorSwatch
        name="Success"
        value="#22C55E"
        tailwind="text-status-success"
      />
      <ColorSwatch
        name="Warning"
        value="#F59E0B"
        tailwind="text-status-warning"
      />
      <ColorSwatch name="Info" value="#3B82F6" tailwind="text-status-info" />
    </div>

    {/* content */}
    <h3 className="text-lg font-semibold text-white mb-3">Content</h3>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <ColorSwatch name="Default" value="#000000" tailwind="text-content" />
      <ColorSwatch
        name="Inverse"
        value="#FFFFFF"
        tailwind="text-content-inverse"
      />
      <ColorSwatch name="Muted" value="#A5A5A5" tailwind="text-content-muted" />
      <ColorSwatch
        name="Disabled"
        value="#9CA3AF"
        tailwind="text-content-disabled"
      />
    </div>
  </Section>
);

export default ColorsSection;
