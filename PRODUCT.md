# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two first-class audiences, weighted equally:

- **Marketing clients** — small to mid-market businesses engaged with ANL for
  marketing services. They log in to a client portal to book meetings, follow a
  structured 90-day engagement, track project milestones, use a Kanban board,
  exchange messages, complete video onboarding, and submit reviews.
- **Internal staff** — `admin`, `owner`, and `manager` roles who run the
  business side: user and account management, finance/transaction oversight,
  availability and meeting-host configuration, request/usage statistics, and
  IP-ban security controls.

Account status lifecycle: `pending` → `active` → `inactive` → `terminated`.

## Product Purpose

ANL (AnladsAndLeads SRL) is a digital marketing agency. This application is the
client portal and internal operations console that runs the agency's engagement
lifecycle end to end: onboarding, scheduling, project/milestone tracking,
client communication, reviews, and finance — plus the admin tooling that staff
use to operate it. Success means clients can transparently follow their
campaign progress and interact with the agency, while staff can manage clients,
schedules, and finances from one place.

## Positioning

ANL's emphasis is **data-driven results and campaign performance** — marketing
"done the right way" through measurable outcomes and analytics-backed decisions,
delivered through a transparent client portal where clients can see the
structured journey and progress against it rather than being kept in the dark.

## Operating Context

- Client engagement follows a structured **90-day program** introduced through a
  **7-step video onboarding** flow (introduction, 90-day overview, contract &
  payment, Ads Manager integration, audience briefing, strategy-session booking,
  closing).
- Meetings are scheduled against staff **availability** (standard weekly +
  custom slots) with Google Meet/Calendar integration and timezone handling.
- Work is tracked on a **Kanban board** (columns, drag-and-drop cards, custom
  fields, comments, activity log) and via **progress milestones**
  (`pending` → `in_progress` → `completed`) with admin notes and timelines.
- **Finance** is handled per user with multi-currency transactions
  (RON, EUR, USD, GBP, HUF, CHF), pending payments, and balances.
- In-app **messaging** (inbox, send, sent, system notifications) is the primary
  client↔staff communication channel.

## Capabilities and Constraints

- Auth: email/password plus Google and Facebook OAuth; mandatory email
  verification; password reset; JWT sessions.
- Role-based access control gates admin/owner/manager surfaces from client
  surfaces.
- Public marketing surfaces: landing page, About Us, Services, Contact, public
  booking, legal/policy pages.
- Authenticated client surfaces: home dashboard, booking, availability, progress
  tracker, Kanban, inbox/mail, account, add-review, onboarding, statistics.
- Analytics via PostHog (events, session replay, Core Web Vitals).
- Stack: React 18 + TypeScript + Vite; Tailwind CSS + Emotion; MUI + MUI
  X-Charts + Recharts; Framer Motion + GSAP; React Router v6. Backend: Node.js /
  Express + PostgreSQL (knex migrations) + Redis, Passport auth, Nodemailer,
  Google Calendar API.

## Brand Commitments

- **Brand name is locked:** ANL / AnladsAndLeads SRL. Founders: Péterfi
  Szabolcs (Founder), Koszta Zsolt (Co-Founder). Based in Romania.
- **Dark mode is locked** — must remain supported, with system-preference
  detection and a manual toggle, persisted across sessions.
- Voice: professional, transparent, relationship-focused; "do marketing the
  right way."
- **Colors are NOT locked** — the current purple (`#65558F`) and accompanying
  palette are open to change in future design work.

## Evidence on Hand

- Marketing claims present in current copy: 300+ campaigns, 50+ clients, 12
  countries, 97% client satisfaction. Treat these as existing site copy; do not
  fabricate new metrics, testimonials, customers, pricing, or case studies
  beyond what already exists in the codebase/translations.
- Assets: logo and marketing imagery under `App/public/LandingPage` and
  `App/public/socialMedia`; Inter typeface via FontSource.

## Product Principles

- **Transparency over opacity** — clients should always be able to see where
  they are in the journey and what happens next.
- **Data-driven** — surface measurable progress and performance, not vague
  reassurance.
- **One system, two audiences** — client portal and internal console must both
  feel first-class; neither is a bolt-on.
- **Structured journey** — the 90-day / milestone / onboarding structure is a
  core product concept, not decoration.

## Internationalization

Locked: three supported languages — **English** (default), **Magyar
(Hungarian)**, and **Română (Romanian)**. A language switcher persists the
choice. All user-facing copy must remain translatable across these three.

## Accessibility & Inclusion

Maintain WCAG AA contrast, keyboard navigation, and ARIA labeling already
present. Dark mode is a locked accessibility/comfort feature (see Brand
Commitments).
