---
name: ANL — AnladsAndLeads
description: The Midnight Studio — a bold, brand-drenched dark client portal for a data-driven marketing agency.
colors:
  brand: "#65558F"
  brand-hover: "#7c6bb7"
  brand-focus: "#a78bfa"
  accent-teal: "#7AA49F"
  accent-rose: "#9A4647"
  accent-purple: "#9B7ADB"
  surface-black: "#000000"
  surface-overlay: "#080A0D"
  surface-dark: "#121212"
  surface-elevated: "#1e1e1e"
  surface-sidebar: "#1D2431"
  surface-light: "#FFFFFF"
  content-inverse: "#FFFFFF"
  content-muted: "#A5A5A5"
  content-subtle-inverse: "#D1D5DB"
  content-subtle: "#4B5563"
  line-glass: "rgba(255, 255, 255, 0.08)"
  line-dark: "#374151"
  status-error: "#EF4444"
  status-success: "#22C55E"
  status-warning: "#F59E0B"
  status-info: "#3B82F6"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.025em"
rounded:
  md: "0.5rem"
  lg: "1rem"
  xl: "1.5rem"
  4xl: "2rem"
  navbar: "2.5rem"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.content-inverse}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.brand-hover}"
    textColor: "{colors.content-inverse}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.content-inverse}"
    rounded: "{rounded.lg}"
    padding: "16px 32px"
  card:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.content-inverse}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.content-inverse}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: ANL — AnladsAndLeads

## Overview

**Creative North Star: "The Midnight Studio"**

ANL is a premium creative marketing agency rendered after dark. The interface is a
confident, brand-drenched space where deep black backgrounds let the signature
purple (`#65558F`) and its aurora of teal, rose, and violet accents become the light
source of every screen. This is not a timid enterprise dashboard painted dark; it is
an expressive, editorial-grade portal that signals craft and momentum from the first
viewport, then hands clients calm, legible tools for tracking real campaign progress.

The system holds two moods in tension and resolves them deliberately. Persuade
surfaces — the landing page, About, Services — lean into brand drench: large black
canvases lit by blurred brand blooms, bold `extrabold` display type, and gradient CTAs.
Operate surfaces — the portal, Kanban, progress tracker, inbox — pull the same palette
into refined, restrained containers where soft shadows, quiet glass borders, and
generous spacing keep dense data readable. The brand is loud where it persuades and
precise where it operates, but it is always the same brand.

Depth comes from tone and blur, not heavy ornament. Elevation is soft and low; borders
are near-invisible glass hairlines; motion eases in from an already-visible default.
The result should feel like a studio that measures everything: expressive on the
surface, disciplined underneath.

**Key Characteristics:**
- Black-first canvas with brand-purple and accent blooms as the primary light source.
- Bold, brand-drenched Persuade surfaces; refined, restrained Operate surfaces.
- Single sans (Inter) across the whole system, worked hard through weight and scale.
- Soft, low elevation and glass hairline borders — depth without clutter.
- Dark mode is a locked, first-class experience, not a theme variant.

## Colors

A single confident brand purple, an aurora of three warm-to-cool accents, and a deep
neutral stack that runs pure black up through elevated charcoal.

### Primary
- **Brand Purple** (`#65558F`): The identity. Carries primary CTAs, active states,
  focus rings, and the dominant bloom behind hero and feature areas. This is the
  color the product is remembered by.
- **Brand Hover** (`#7c6bb7`): Lifted brand for hover/pressed on primary actions.
- **Brand Focus** (`#a78bfa`): Bright violet reserved for focus rings and keyboard
  affordances against dark surfaces.

### Secondary — the Accent Aurora
- **Accent Teal** (`#7AA49F`): The cool half of the gradient CTA and hero aurora;
  signals progress, data, and calm.
- **Accent Rose** (`#9A4647`): The warm counterweight; used sparingly for depth in
  auroras and emphasis, never for error.
- **Accent Purple** (`#9B7ADB`): A brighter violet for highlights and secondary
  accent moments that need more pop than brand purple.

### Neutral
- **Surface Black** (`#000000`) / **Overlay** (`#080A0D`): The base canvas for
  Persuade surfaces and full-bleed hero sections.
- **Surface Dark** (`#121212`): The default app background for Operate surfaces.
- **Surface Elevated** (`#1e1e1e`): Cards, panels, popovers — one step up from the base.
- **Surface Sidebar** (`#1D2431`): The authenticated navigation rail.
- **Content Inverse** (`#FFFFFF`): Primary text and headlines on dark.
- **Content Subtle-Inverse** (`#D1D5DB`): Trust lines, captions, secondary labels on dark.
- **Content Muted** (`#A5A5A5`): Body and supporting copy on dark.

### Status
- **Error** (`#EF4444`), **Success** (`#22C55E`), **Warning** (`#F59E0B`),
  **Info** (`#3B82F6`): Feedback only. Reserved semantics — never decorative.

### Named Rules
**The Aurora Rule.** Color arrives as *light*, not fill. Large brand and accent
presence should come from blurred, low-opacity blooms behind content
(`bg-brand/40 blur-[130px]`), letting the black canvas read through. Flat, fully
saturated brand panels are the exception, not the default.

**The One Error Hue Rule.** `accent-rose` (`#9A4647`) is decorative and must never be
used to signal errors; `status-error` (`#EF4444`) owns all failure states. Do not blur
the line between them.

**The Subtle-on-Dark Rule.** `content-subtle` (`#4B5563`) is for light surfaces only.
On dark surfaces, secondary text uses `content-subtle-inverse` (`#D1D5DB`) or
`content-muted` (`#A5A5A5`) to hold WCAG AA contrast.

## Typography

**Display / Body / Label Font:** Inter (with `system-ui, sans-serif` fallback).

**Character:** One typeface, worked hard. Personality comes entirely from weight and
scale contrast — `extrabold` display against `normal` body — not from a second face.
Inter's neutral, engineered forms keep dense portal data legible while still reading
as intentional and modern on marketing surfaces.

### Hierarchy
- **Display** (800, 3.75rem / up to `text-7xl` on hero, line-height 1.05, tracking -0.025em):
  Hero and section-defining headlines on Persuade surfaces. Tight leading, heavy weight.
- **Headline** (700, 1.875rem, line-height 1.25): Page titles and major section headers.
- **Title** (700, 1.5rem, line-height 1.25): Card titles and sub-section headers.
- **Body** (400, 1rem, line-height 1.5): Default reading copy; `content-muted` on dark.
- **Label** (700, 0.875rem, tracking 0.025em, often UPPERCASE): Eyebrows, trust lines,
  metadata, and stat captions. Uppercase + wide tracking signals a labelled, measured system.

### Named Rules
**The One Face Rule.** Inter is the only typeface. Hierarchy is built from weight
(400/500/600/700/800) and scale — never from adding a display serif or second sans.

**The Measured Label Rule.** Trust lines, eyebrows, and stat captions use uppercase
Label with `letter-spacing: 0.025em`+ to reinforce the "everything is measured" voice.

## Layout

A centered, max-width column model on marketing surfaces (`content-max` 72rem / 1152px),
and a fixed-rail shell on the portal (sidebar 300px, navbar 64px). Persuade sections are
full-viewport (`min-h-screen`) with content vertically centered and secondary elements
(tickers, scroll cues) anchored to the fold. Spacing rhythm follows an 8px base
(8 / 16 / 24 / 40). Density is comfortable-to-airy on Persuade surfaces and comfortable
on Operate surfaces; dense data views (Kanban, tables) tighten to functional spacing
without abandoning the rhythm. Height-based breakpoints (`h-sm`/`h-md`/`h-lg`) adapt
hero and full-screen layouts to short viewports.

## Elevation & Depth

Depth is soft, low, and mostly conveyed through tonal layering (black → `#121212` →
`#1e1e1e`) plus blurred brand blooms, rather than hard drop shadows. Glass hairline
borders (`rgba(255,255,255,0.08)`) separate elevated surfaces from the canvas. Shadows
are reserved and diffuse.

### Shadow Vocabulary
- **soft** (`0 2px 8px -2px rgba(0,0,0,0.08)`): Resting lift for quiet elements.
- **card** (`0 4px 12px -2px rgba(0,0,0,0.12)`): Card at rest.
- **card-hover** (`0 8px 24px -4px rgba(0,0,0,0.15)`): Card hover/focus response.
- **glass** (`0 4px 32px 0 rgba(0,0,0,0.18)`): Glassmorphic panels over blooms.
- **elevated** (`0 12px 40px -8px rgba(0,0,0,0.2)`): Modals and popovers only.

### Named Rules
**The Tonal-First Rule.** Separation on dark comes first from surface tone and glass
hairlines; add a shadow only when tone alone can't sell the lift (hover, modal, popover).

## Shapes

Rounded and soft throughout. Cards and panels use `xl`/`4xl` radii (1–2rem); buttons
and inputs use `md`/`lg` (0.5–1rem); the marketing navbar uses a pill `navbar` radius
(2.5rem). No sharp 0-radius corners on interactive surfaces. Borders, when present, are
single glass hairlines rather than solid strokes. The overall silhouette is smooth,
capsule-leaning, and calm — the "refined and restrained" component feel resolved as geometry.

## Components

### Buttons
- **Shape:** Rounded `lg`–`xl` (`0.75rem`–`1rem`).
- **Primary:** Brand-drenched. Solid `brand` (`#65558F`) or a `brand → accent-teal`
  gradient on hero CTAs; white text; padding ~`16px 32px`; soft brand shadow.
- **Hover / Focus:** Lift to `brand-hover` (`#7c6bb7`) and/or `scale-105`; a subtle
  sheen sweep on gradient CTAs; focus-visible ring in `brand-focus`/`accent-teal`
  with an offset against the black surface.
- **Secondary / Ghost:** Glass — `surface-elevated/40` fill, `line-glass` border,
  `backdrop-blur`; border warms toward `brand/40` on hover.

### Cards / Containers
- **Corner Style:** `xl` (`1.5rem`), occasionally `4xl` for hero panels.
- **Background:** `surface-elevated` (`#1e1e1e`) over the black/`#121212` canvas, often
  above a brand bloom.
- **Shadow Strategy:** `card` at rest → `card-hover` on hover (see Elevation).
- **Border:** Optional `line-glass` hairline.
- **Internal Padding:** `24px` (`lg`), scaling up on feature cards.

### Inputs / Fields
- **Style:** `surface-dark` fill, `line-glass` or `line-dark` hairline, `md` radius.
- **Focus:** Border shifts to `brand`/`brand-focus` with a soft ring; no harsh glow.
- **Error:** `status-error` border + helper text — never `accent-rose`.

### Navigation
- **Marketing Navbar:** Pill-shaped (`navbar` radius 2.5rem), floating, glassy over
  the hero; brand-forward. Active/hover states use brand.
- **Portal Sidebar:** Fixed 300px rail on `surface-sidebar` (`#1D2431`); active item
  carries brand fill/indicator; collapses to an overlay on mobile.

### Signature Component — Aurora Hero
A full-viewport black section lit by blurred brand/teal/rose blooms over a starfield
texture, with an `extrabold` display headline, gradient primary CTA, glass secondary
CTA, and an uppercase trust line — the archetype of the Midnight Studio direction.

## Do's and Don'ts

### Do:
- **Do** treat black (`#000000`/`#080A0D`) as the default Persuade canvas and let brand
  blooms be the light source (`bg-brand/40 blur-[130px]`).
- **Do** build hierarchy from Inter weight and scale (400 → 800), not extra typefaces.
- **Do** use `content-muted`/`content-subtle-inverse` for secondary text on dark to hold AA contrast.
- **Do** keep Operate surfaces refined: soft shadows, glass hairlines, generous spacing.
- **Do** animate from an already-visible default so LCP text (hero headline) never depends on JS to appear.
- **Do** reserve `accent-rose` for decorative depth and `status-error` for real errors.

### Don't:
- **Don't** use flat, fully saturated brand panels as the default background — prefer aurora blooms.
- **Don't** put `content-subtle` (`#4B5563`) text on dark surfaces; it fails contrast.
- **Don't** introduce a second font family or off-brand hues (e.g. `bg-blue-600` buttons).
- **Don't** rely on hard drop shadows for separation on dark; layer tone and glass borders first.
- **Don't** fade the hero headline in from `opacity: 0`; slide from a visible state instead.
