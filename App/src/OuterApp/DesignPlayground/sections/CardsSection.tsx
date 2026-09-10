import React from "react";
import { Calendar, Clock, User } from "lucide-react";
import GlowCard from "@/OuterApp/components/GlowCard";
import GlassInfoCard from "@/InnerApp/components/GlassInfoCard";
import { Section, CodeBlock } from "../_shared";

const CardsSection: React.FC = () => (
  <Section
    title="Cards"
    description="GlowCard with mouse-tracking gradient glow, GlassInfoCard for compact info."
  >
    <h3 className="text-sm font-semibold text-content-muted mb-3">
      GlowCard — hover to see the glow
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {[
        { title: "Analytics", desc: "Track your campaign performance in real-time." },
        { title: "Automation", desc: "Set up workflows that run on autopilot." },
        { title: "Insights", desc: "AI-powered recommendations for growth." },
      ].map((card) => (
        <GlowCard key={card.title}>
          <div className="p-6">
            <h3 className="text-white font-semibold text-lg mb-2">
              {card.title}
            </h3>
            <p className="text-content-muted text-sm">{card.desc}</p>
          </div>
        </GlowCard>
      ))}
    </div>

    <CodeBlock
      label="GlowCard code"
      code={`import GlowCard from "@/OuterApp/components/GlowCard";

<GlowCard>
  <div className="p-6">
    <h3 className="text-white font-semibold text-lg mb-2">Title</h3>
    <p className="text-content-muted text-sm">Description text.</p>
  </div>
</GlowCard>

{/* With custom glow color */}
<GlowCard glowColor="rgba(122, 164, 159, 0.6)">
  ...
</GlowCard>`}
    />

    <h3 className="text-sm font-semibold text-content-muted mb-3">
      GlassInfoCard
    </h3>
    <div className="flex flex-wrap gap-3">
      <GlassInfoCard icon={<Calendar className="w-4 h-4 text-white" />}>
        April 22, 2026
      </GlassInfoCard>
      <GlassInfoCard
        icon={<Clock className="w-4 h-4 text-white" />}
        gradient="from-accent-teal to-brand"
      >
        10:00 — 11:00
      </GlassInfoCard>
      <GlassInfoCard
        icon={<User className="w-4 h-4 text-white" />}
        gradient="from-accent-rose to-accent-purple"
      >
        John Doe
      </GlassInfoCard>
    </div>

    <CodeBlock
      label="GlassInfoCard code"
      code={`import GlassInfoCard from "@/InnerApp/components/GlassInfoCard";
import { Calendar } from "lucide-react";

<GlassInfoCard icon={<Calendar className="w-4 h-4 text-white" />}>
  April 22, 2026
</GlassInfoCard>

{/* Custom gradient */}
<GlassInfoCard
  icon={<Clock className="w-4 h-4 text-white" />}
  gradient="from-accent-teal to-brand"
>
  10:00 — 11:00
</GlassInfoCard>`}
    />

    <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
      Simple glass card
    </h3>
    <div
      className="pg-glass max-w-sm p-6 rounded-2xl border border-line-glass"
      style={{
        backdropFilter: "blur(16px)",
      }}
    >
      <h3 className="text-white font-semibold text-lg mb-2">Glass Card</h3>
      <p className="text-content-muted text-sm">
        Standard glassmorphism card used on auth pages.
      </p>
    </div>
    <CodeBlock
      label="Glass card (Tailwind)"
      code={`<div
  className="max-w-sm p-6 rounded-2xl border border-line-glass"
  style={{
    background: "rgba(20, 20, 30, 0.7)",
    backdropFilter: "blur(16px)",
  }}
>
  <h3 className="text-white font-semibold text-lg mb-2">Title</h3>
  <p className="text-content-muted text-sm">Description.</p>
</div>`}
    />
  </Section>
);

export default CardsSection;
