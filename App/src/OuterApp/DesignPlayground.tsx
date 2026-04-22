import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Eye,
  EyeOff,
  Bell,
  Mail,
  Check,
  X,
  Star,
  Heart,
  Settings,
  User,
  Calendar,
  Clock,
  Search,
  ChevronDown,
  ArrowRight,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import GradientButton from "../InnerApp/components/GradientButton";
import GlowCard from "./components/GlowCard";
import GlassInfoCard from "../InnerApp/components/GlassInfoCard";
import GradientDivider from "./components/GradientDivider";
import NotificationBadge from "../InnerApp/components/NotificationBadge";

/* ─── helpers ─────────────────────────────────────────────────────────────── */

const Section: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
}> = ({ title, description, children }) => (
  <section className="mb-16">
    <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
    {description && (
      <p className="text-content-muted text-sm mb-6">{description}</p>
    )}
    {!description && <div className="mb-6" />}
    {children}
  </section>
);

const PropControl: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <label className="flex items-center gap-2 text-sm text-content-muted">
    <span className="min-w-[90px]">{label}</span>
    {children}
  </label>
);

const ColorSwatch: React.FC<{
  name: string;
  value: string;
  tailwind: string;
}> = ({ name, value, tailwind }) => (
  <div className="flex items-center gap-3">
    <div
      className="w-10 h-10 rounded-lg border border-line-glass shrink-0"
      style={{ background: value }}
    />
    <div>
      <p className="text-white text-sm font-medium">{name}</p>
      <p className="text-content-muted text-xs">
        {tailwind} · {value}
      </p>
    </div>
  </div>
);

/* ─── page ────────────────────────────────────────────────────────────────── */

const DesignPlayground: React.FC = () => {
  /* button controls */
  const [btnVariant, setBtnVariant] = useState<
    "primary" | "secondary" | "danger"
  >("primary");
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [btnFullWidth, setBtnFullWidth] = useState(false);

  /* input controls */
  const [inputError, setInputError] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputValue, setInputValue] = useState("");

  /* badge controls */
  const [badgeCount, setBadgeCount] = useState(5);

  /* modal controls */
  const [showConfirm, setShowConfirm] = useState(false);

  /* divider style */
  const [dividerStyle, setDividerStyle] = useState<
    "wave" | "gradient" | "mesh" | "glow"
  >("wave");
  const [dividerFlipped, setDividerFlipped] = useState(false);

  /* toast controls */
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  return (
    <div className="relative min-h-screen bg-surface-overlay">
      <Helmet>
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta name="googlebot" content="noindex, nofollow" />
        <title>Design Playground — ANL (internal)</title>
      </Helmet>

      {/* ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 15% 30%, rgba(101,85,143,0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 85% 70%, rgba(122,164,159,0.4) 0%, transparent 50%)
              `,
            }}
          />
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12 sm:py-20">
        {/* ── Header ── */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3">
            Design Playground
          </h1>
          <p className="text-content-muted max-w-xl mx-auto">
            Interactive showcase of ANL's atomic design-system components.
            Tweak props live to see how each building block behaves.
          </p>
        </header>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 1. COLORS                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Colors"
          description="Semantic color tokens from the design system."
        >
          {/* brand */}
          <h3 className="text-lg font-semibold text-white mb-3">Brand</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <ColorSwatch name="Default" value="#65558F" tailwind="bg-brand" />
            <ColorSwatch
              name="Hover"
              value="#7c6bb7"
              tailwind="bg-brand-hover"
            />
            <ColorSwatch
              name="Muted"
              value="rgba(101,85,143,0.2)"
              tailwind="bg-brand-muted"
            />
            <ColorSwatch
              name="Focus"
              value="#a78bfa"
              tailwind="ring-brand-focus"
            />
          </div>

          {/* accent */}
          <h3 className="text-lg font-semibold text-white mb-3">Accent</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <ColorSwatch
              name="Teal"
              value="#7AA49F"
              tailwind="bg-accent-teal"
            />
            <ColorSwatch
              name="Rose"
              value="#9A4647"
              tailwind="bg-accent-rose"
            />
            <ColorSwatch
              name="Purple"
              value="#9B7ADB"
              tailwind="bg-accent-purple"
            />
          </div>

          {/* surface */}
          <h3 className="text-lg font-semibold text-white mb-3">Surface</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <ColorSwatch
              name="Light"
              value="#FFFFFF"
              tailwind="bg-surface-light"
            />
            <ColorSwatch
              name="Dark"
              value="#121212"
              tailwind="bg-surface-dark"
            />
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
            <ColorSwatch
              name="Error"
              value="#EF4444"
              tailwind="text-status-error"
            />
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
            <ColorSwatch
              name="Info"
              value="#3B82F6"
              tailwind="text-status-info"
            />
          </div>

          {/* content */}
          <h3 className="text-lg font-semibold text-white mb-3">Content</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <ColorSwatch
              name="Default"
              value="#000000"
              tailwind="text-content"
            />
            <ColorSwatch
              name="Inverse"
              value="#FFFFFF"
              tailwind="text-content-inverse"
            />
            <ColorSwatch
              name="Muted"
              value="#A5A5A5"
              tailwind="text-content-muted"
            />
            <ColorSwatch
              name="Disabled"
              value="#9CA3AF"
              tailwind="text-content-disabled"
            />
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 2. TYPOGRAPHY                                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Typography"
          description="Font sizes and weights — Inter font family."
        >
          <div className="space-y-4">
            {[
              { cls: "text-5xl font-extrabold", label: "5xl / extrabold — Hero heading" },
              { cls: "text-4xl font-bold", label: "4xl / bold — Page heading" },
              { cls: "text-3xl font-bold", label: "3xl / bold — Section heading" },
              { cls: "text-2xl font-semibold", label: "2xl / semibold — Card title" },
              { cls: "text-xl font-semibold", label: "xl / semibold — Subtitle" },
              { cls: "text-lg font-medium", label: "lg / medium — Large body" },
              { cls: "text-base font-normal", label: "base / normal — Body" },
              { cls: "text-sm font-normal", label: "sm / normal — Small body" },
              { cls: "text-xs font-normal", label: "xs / normal — Caption" },
            ].map((t) => (
              <div key={t.cls} className="flex items-baseline gap-4">
                <span className={`text-white ${t.cls}`}>Aa</span>
                <span className="text-content-muted text-sm">{t.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 3. SPACING & RADIUS                                             */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Spacing & Border Radius"
          description="Base unit: 4px. Border radius from sm to full."
        >
          <h3 className="text-lg font-semibold text-white mb-3">
            Spacing scale
          </h3>
          <div className="flex flex-wrap items-end gap-3 mb-8">
            {[1, 2, 3, 4, 6, 8, 10, 12, 16].map((n) => (
              <div key={n} className="flex flex-col items-center gap-1">
                <div
                  className="bg-brand rounded"
                  style={{ width: n * 4, height: n * 4 }}
                />
                <span className="text-content-muted text-xs">
                  {n} ({n * 4}px)
                </span>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-white mb-3">
            Border radius
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { cls: "rounded-sm", label: "sm (2px)" },
              { cls: "rounded", label: "base (4px)" },
              { cls: "rounded-md", label: "md (6px)" },
              { cls: "rounded-lg", label: "lg (8px)" },
              { cls: "rounded-xl", label: "xl (12px)" },
              { cls: "rounded-2xl", label: "2xl (16px)" },
              { cls: "rounded-3xl", label: "3xl (24px)" },
              { cls: "rounded-full", label: "full" },
            ].map((r) => (
              <div
                key={r.cls}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-14 h-14 bg-brand/60 border border-brand ${r.cls}`}
                />
                <span className="text-content-muted text-xs">{r.label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 4. SHADOWS                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section title="Shadows">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {[
              { cls: "shadow-soft", label: "soft" },
              { cls: "shadow-card", label: "card" },
              { cls: "shadow-card-hover", label: "card-hover" },
              { cls: "shadow-glass", label: "glass" },
              { cls: "shadow-dark-card", label: "dark-card" },
              { cls: "shadow-elevated", label: "elevated" },
            ].map((s) => (
              <div
                key={s.cls}
                className={`p-6 bg-surface-elevated rounded-xl border border-line-glass text-center ${s.cls}`}
              >
                <span className="text-white text-sm font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 5. BUTTONS                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Buttons"
          description="GradientButton — primary, secondary, danger variants."
        >
          {/* controls */}
          <div
            className="p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap gap-4"
            style={{ background: "rgba(20,20,30,0.5)" }}
          >
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
            <button className="w-full py-3 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition shadow-lg shadow-brand/20">
              Submit
            </button>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 6. INPUTS                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Inputs"
          description="Text, password, and checkbox form primitives."
        >
          {/* controls */}
          <div
            className="p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap gap-4"
            style={{ background: "rgba(20,20,30,0.5)" }}
          >
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
              <label className="text-content-muted text-sm mb-1 block">
                Select
              </label>
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
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none" size={18} />
              </div>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 7. CARDS                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
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

          <h3 className="text-sm font-semibold text-content-muted mb-3">
            GlassInfoCard
          </h3>
          <div className="flex flex-wrap gap-3">
            <GlassInfoCard icon={<Calendar className="w-4 h-4 text-white" />}>
              April 22, 2026
            </GlassInfoCard>
            <GlassInfoCard icon={<Clock className="w-4 h-4 text-white" />} gradient="from-accent-teal to-brand">
              10:00 — 11:00
            </GlassInfoCard>
            <GlassInfoCard icon={<User className="w-4 h-4 text-white" />} gradient="from-accent-rose to-accent-purple">
              John Doe
            </GlassInfoCard>
          </div>

          <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
            Simple glass card
          </h3>
          <div
            className="max-w-sm p-6 rounded-2xl border border-line-glass"
            style={{
              background: "rgba(20,20,30,0.7)",
              backdropFilter: "blur(16px)",
            }}
          >
            <h3 className="text-white font-semibold text-lg mb-2">
              Glass Card
            </h3>
            <p className="text-content-muted text-sm">
              Standard glassmorphism card used on auth pages.
            </p>
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 8. BADGES & INDICATORS                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Badges & Indicators"
          description="NotificationBadge, status pills, toast-style alerts."
        >
          {/* badge control */}
          <div
            className="p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap items-center gap-4"
            style={{ background: "rgba(20,20,30,0.5)" }}
          >
            <PropControl label="Count">
              <input
                type="number"
                value={badgeCount}
                onChange={(e) => setBadgeCount(Number(e.target.value))}
                className="w-20 bg-surface-overlay text-white border border-line-dark rounded-lg px-2 py-1 text-sm"
                min={0}
                max={200}
              />
            </PropControl>
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-1">
              <Bell className="text-white" size={20} />
              <NotificationBadge count={badgeCount} />
            </div>
            <div className="flex items-center gap-1">
              <Mail className="text-white" size={20} />
              <NotificationBadge count={badgeCount} />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-content-muted mb-3">
            Status pills
          </h3>
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { label: "Active", cls: "bg-status-success/20 text-status-success" },
              { label: "Pending", cls: "bg-status-warning/20 text-status-warning" },
              { label: "Error", cls: "bg-status-error/20 text-status-error" },
              { label: "Info", cls: "bg-status-info/20 text-status-info" },
              { label: "Brand", cls: "bg-brand-muted text-brand-hover" },
            ].map((p) => (
              <span
                key={p.label}
                className={`px-3 py-1 text-xs font-semibold rounded-full ${p.cls}`}
              >
                {p.label}
              </span>
            ))}
          </div>

          {/* toast alerts */}
          <h3 className="text-sm font-semibold text-content-muted mb-3">
            Toast / Alert
          </h3>
          <div
            className="p-4 rounded-xl border border-line-glass mb-4 flex flex-wrap gap-4"
            style={{ background: "rgba(20,20,30,0.5)" }}
          >
            <PropControl label="Type">
              <select
                value={toastType}
                onChange={(e) => setToastType(e.target.value as any)}
                className="bg-surface-overlay text-white border border-line-dark rounded-lg px-2 py-1 text-sm"
              >
                <option value="success">success</option>
                <option value="error">error</option>
                <option value="warning">warning</option>
                <option value="info">info</option>
              </select>
            </PropControl>
          </div>
          <div className="max-w-md">
            {(() => {
              const configs = {
                success: { icon: <CheckCircle size={18} />, bg: "bg-status-success/10 border-status-success/30", text: "text-status-success", msg: "Operation completed successfully!" },
                error: { icon: <XCircle size={18} />, bg: "bg-status-error/10 border-status-error/30", text: "text-status-error", msg: "Something went wrong. Try again." },
                warning: { icon: <AlertTriangle size={18} />, bg: "bg-status-warning/10 border-status-warning/30", text: "text-status-warning", msg: "Please review before continuing." },
                info: { icon: <Info size={18} />, bg: "bg-status-info/10 border-status-info/30", text: "text-status-info", msg: "Here's some useful information." },
              };
              const c = configs[toastType];
              return (
                <div className={`flex items-center gap-3 p-3 rounded-xl border ${c.bg}`}>
                  <span className={c.text}>{c.icon}</span>
                  <span className={`text-sm ${c.text}`}>{c.msg}</span>
                </div>
              );
            })()}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 9. MODALS                                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section title="Modals" description="Confirm dialog pattern.">
          <GradientButton onClick={() => setShowConfirm(true)}>
            Open Confirm Modal
          </GradientButton>

          {showConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div
                className="w-full max-w-md p-6 rounded-2xl border border-line-glass shadow-elevated"
                style={{
                  background: "rgba(20,20,30,0.9)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <h3 className="text-lg font-semibold text-white mb-2">
                  Confirm Action
                </h3>
                <p className="text-content-muted text-sm mb-6">
                  Are you sure you want to proceed? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <GradientButton
                    variant="secondary"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </GradientButton>
                  <GradientButton
                    variant="danger"
                    onClick={() => setShowConfirm(false)}
                  >
                    Confirm
                  </GradientButton>
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 10. DIVIDERS                                                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Dividers"
          description="GradientDivider — wave, gradient, mesh, glow styles."
        >
          <div
            className="p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap gap-4"
            style={{ background: "rgba(20,20,30,0.5)" }}
          >
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
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 11. ICONS & THEME ICON                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        <Section
          title="Icons"
          description="Lucide icons at various sizes + ThemeIcon for light/dark switching."
        >
          <h3 className="text-sm font-semibold text-content-muted mb-3">
            Icon sizes
          </h3>
          <div className="flex items-end gap-4 mb-6">
            {[14, 16, 18, 20, 24, 28, 32].map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <Star className="text-brand" size={s} />
                <span className="text-content-muted text-xs">{s}px</span>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-content-muted mb-3">
            Common icons
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { Icon: Mail, name: "Mail" },
              { Icon: Bell, name: "Bell" },
              { Icon: Settings, name: "Settings" },
              { Icon: User, name: "User" },
              { Icon: Calendar, name: "Calendar" },
              { Icon: Clock, name: "Clock" },
              { Icon: Search, name: "Search" },
              { Icon: Heart, name: "Heart" },
              { Icon: Star, name: "Star" },
              { Icon: Check, name: "Check" },
              { Icon: X, name: "X" },
              { Icon: ArrowRight, name: "Arrow" },
              { Icon: Info, name: "Info" },
              { Icon: AlertTriangle, name: "Warning" },
            ].map(({ Icon, name }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-surface-elevated/50 transition"
              >
                <Icon className="text-content-inverse" size={22} />
                <span className="text-content-muted text-xs">{name}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 12. LOADING STATES                                               */}
        {/* ══════════════════════════════════════════════════════════════════ */}
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
        </Section>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* 13. Z-INDEX                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
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

        {/* ── Footer ── */}
        <footer className="text-center text-content-muted text-sm pt-8 border-t border-line-glass">
          ANL Design System — Internal playground. Not indexed.
        </footer>
      </div>
    </div>
  );
};

export default DesignPlayground;
