import React, { useState } from "react";
import {
  Bell,
  Mail,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import NotificationBadge from "@/InnerApp/components/NotificationBadge";
import { Section, PropControl, CodeBlock } from "../_shared";

const BadgesSection: React.FC = () => {
  const [badgeCount, setBadgeCount] = useState(5);
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("success");

  return (
    <Section
      title="Badges & Indicators"
      description="NotificationBadge, status pills, toast-style alerts."
    >
      {/* badge control */}
      <div className="pg-control p-4 rounded-xl border border-line-glass mb-6 flex flex-wrap items-center gap-4">
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

      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-1">
          <Bell className="text-white" size={20} />
          <NotificationBadge count={badgeCount} />
        </div>
        <div className="flex items-center gap-1">
          <Mail className="text-white" size={20} />
          <NotificationBadge count={badgeCount} />
        </div>
      </div>

      <CodeBlock
        label="NotificationBadge code"
        code={`import NotificationBadge from "@/InnerApp/components/NotificationBadge";
import { Bell } from "lucide-react";

<div className="flex items-center gap-1">
  <Bell className="text-white" size={20} />
  <NotificationBadge count={${badgeCount}} />
</div>`}
      />

      <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
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

      <CodeBlock
        label="Status pill code"
        code={`{/* Success */}
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-status-success/20 text-status-success">
  Active
</span>

{/* Warning */}
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-status-warning/20 text-status-warning">
  Pending
</span>

{/* Error */}
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-status-error/20 text-status-error">
  Error
</span>

{/* Info */}
<span className="px-3 py-1 text-xs font-semibold rounded-full bg-status-info/20 text-status-info">
  Info
</span>`}
      />

      {/* toast alerts */}
      <h3 className="text-sm font-semibold text-content-muted mb-3">
        Toast / Alert
      </h3>
      <div className="pg-control p-4 rounded-xl border border-line-glass mb-4 flex flex-wrap gap-4">
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

      <CodeBlock
        label="Toast / Alert code"
        code={(() => {
          const iconMap = { success: "CheckCircle", error: "XCircle", warning: "AlertTriangle", info: "Info" };
          const bgMap = { success: "bg-status-success/10 border-status-success/30", error: "bg-status-error/10 border-status-error/30", warning: "bg-status-warning/10 border-status-warning/30", info: "bg-status-info/10 border-status-info/30" };
          const textMap = { success: "text-status-success", error: "text-status-error", warning: "text-status-warning", info: "text-status-info" };
          return `import { ${iconMap[toastType]} } from "lucide-react";

<div className="flex items-center gap-3 p-3 rounded-xl border ${bgMap[toastType]}">
  <span className="${textMap[toastType]}">
    <${iconMap[toastType]} size={18} />
  </span>
  <span className="text-sm ${textMap[toastType]}">Your message here</span>
</div>`;
        })()}
      />
    </Section>
  );
};

export default BadgesSection;
