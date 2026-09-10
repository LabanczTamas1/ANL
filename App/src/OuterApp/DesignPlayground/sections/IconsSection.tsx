import React from "react";
import {
  Mail,
  Bell,
  Settings,
  User,
  Calendar,
  Clock,
  Search,
  Heart,
  Star,
  Check,
  X,
  ArrowRight,
  Info,
  AlertTriangle,
} from "lucide-react";
import { Section, CodeBlock } from "../_shared";

const IconsSection: React.FC = () => (
  <Section
    title="Icons"
    description="Lucide icons at various sizes + ThemeIcon for light/dark switching."
  >
    <h3 className="text-sm font-semibold text-content-muted mb-3">Icon sizes</h3>
    <div className="flex items-end gap-4 mb-6">
      {[14, 16, 18, 20, 24, 28, 32].map((s) => (
        <div key={s} className="flex flex-col items-center gap-1">
          <Star className="text-brand" size={s} />
          <span className="text-content-muted text-xs">{s}px</span>
        </div>
      ))}
    </div>

    <CodeBlock
      label="Icon usage"
      code={`import { Star, Bell, Mail } from "lucide-react";

<Star className="text-brand" size={20} />
<Bell className="text-content-inverse" size={22} />
<Mail className="text-white" size={24} />`}
    />

    <h3 className="text-sm font-semibold text-content-muted mt-6 mb-3">
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
);

export default IconsSection;
