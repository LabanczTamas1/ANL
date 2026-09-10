import React from "react";
import {
  Palette,
  Type,
  Ruler,
  Layers,
  MousePointerClick,
  FormInput,
  CreditCard,
  BadgeCheck,
  SquareStack,
  Minus,
  Sparkles,
  Loader,
  AlignVerticalSpaceAround,
  type LucideIcon,
} from "lucide-react";

import ColorsSection from "./sections/ColorsSection";
import TypographySection from "./sections/TypographySection";
import SpacingSection from "./sections/SpacingSection";
import ShadowsSection from "./sections/ShadowsSection";
import ButtonsSection from "./sections/ButtonsSection";
import InputsSection from "./sections/InputsSection";
import CardsSection from "./sections/CardsSection";
import BadgesSection from "./sections/BadgesSection";
import ModalsSection from "./sections/ModalsSection";
import DividersSection from "./sections/DividersSection";
import IconsSection from "./sections/IconsSection";
import LoadingSection from "./sections/LoadingSection";
import ZIndexSection from "./sections/ZIndexSection";

export type PlaygroundCategory = "Foundations" | "Components";

export interface PlaygroundEntry {
  /** URL slug — /design-playground/:slug */
  slug: string;
  title: string;
  description: string;
  category: PlaygroundCategory;
  icon: LucideIcon;
  /** Extra terms to match against when searching. */
  keywords: string[];
  Component: React.ComponentType;
}

export const playgroundEntries: PlaygroundEntry[] = [
  // ── Foundations ──────────────────────────────────────────────────────────
  {
    slug: "colors",
    title: "Colors",
    description: "Semantic color tokens from the design system.",
    category: "Foundations",
    icon: Palette,
    keywords: ["color", "brand", "accent", "surface", "status", "content", "swatch", "palette", "token"],
    Component: ColorsSection,
  },
  {
    slug: "typography",
    title: "Typography",
    description: "Font sizes and weights — Inter font family.",
    category: "Foundations",
    icon: Type,
    keywords: ["font", "text", "heading", "size", "weight", "inter", "type"],
    Component: TypographySection,
  },
  {
    slug: "spacing",
    title: "Spacing & Radius",
    description: "Base unit: 4px. Border radius from sm to full.",
    category: "Foundations",
    icon: Ruler,
    keywords: ["spacing", "space", "gap", "padding", "margin", "radius", "border", "rounded"],
    Component: SpacingSection,
  },
  {
    slug: "shadows",
    title: "Shadows",
    description: "Elevation tokens for depth and layering.",
    category: "Foundations",
    icon: Layers,
    keywords: ["shadow", "elevation", "depth", "soft", "card", "glass"],
    Component: ShadowsSection,
  },
  {
    slug: "z-index",
    title: "Z-Index Scale",
    description: "Layering tokens for consistent stacking.",
    category: "Foundations",
    icon: AlignVerticalSpaceAround,
    keywords: ["z-index", "zindex", "layer", "stacking", "overlay", "modal", "tooltip"],
    Component: ZIndexSection,
  },

  // ── Components ─────────────────────────────────────────────────────────────
  {
    slug: "buttons",
    title: "Buttons",
    description: "GradientButton — primary, secondary, danger variants.",
    category: "Components",
    icon: MousePointerClick,
    keywords: ["button", "gradient", "cta", "submit", "primary", "secondary", "danger", "loading"],
    Component: ButtonsSection,
  },
  {
    slug: "inputs",
    title: "Inputs",
    description: "Text, password, and checkbox form primitives.",
    category: "Components",
    icon: FormInput,
    keywords: ["input", "form", "text", "password", "checkbox", "textarea", "select", "field"],
    Component: InputsSection,
  },
  {
    slug: "cards",
    title: "Cards",
    description: "GlowCard and GlassInfoCard containers.",
    category: "Components",
    icon: CreditCard,
    keywords: ["card", "glow", "glass", "info", "container", "panel"],
    Component: CardsSection,
  },
  {
    slug: "badges",
    title: "Badges & Indicators",
    description: "NotificationBadge, status pills, toast-style alerts.",
    category: "Components",
    icon: BadgeCheck,
    keywords: ["badge", "indicator", "notification", "pill", "toast", "alert", "status"],
    Component: BadgesSection,
  },
  {
    slug: "modals",
    title: "Modals",
    description: "Confirm dialog pattern.",
    category: "Components",
    icon: SquareStack,
    keywords: ["modal", "dialog", "confirm", "popup", "overlay"],
    Component: ModalsSection,
  },
  {
    slug: "dividers",
    title: "Dividers",
    description: "GradientDivider — wave, gradient, mesh, glow styles.",
    category: "Components",
    icon: Minus,
    keywords: ["divider", "separator", "wave", "gradient", "mesh", "glow", "rule"],
    Component: DividersSection,
  },
  {
    slug: "icons",
    title: "Icons",
    description: "Lucide icons at various sizes.",
    category: "Components",
    icon: Sparkles,
    keywords: ["icon", "lucide", "svg", "glyph", "symbol"],
    Component: IconsSection,
  },
  {
    slug: "loading",
    title: "Loading States",
    description: "Spinner, skeleton, and progress indicators.",
    category: "Components",
    icon: Loader,
    keywords: ["loading", "spinner", "skeleton", "progress", "loader", "pulse", "shimmer"],
    Component: LoadingSection,
  },
];

export const getEntryBySlug = (slug: string | undefined): PlaygroundEntry | undefined =>
  playgroundEntries.find((e) => e.slug === slug);
