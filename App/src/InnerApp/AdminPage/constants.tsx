import { FiUsers, FiShield, FiWifi, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { IconType } from 'react-icons';

export interface Tab {
  id: string;
  label: string;
  icon: IconType;
}

export const TABS: Tab[] = [
  { id: 'users',         label: 'admin.tabUsers',        icon: FiUsers },
  { id: 'stats',         label: 'admin.tabStats',    icon: FiBarChart2 },
  { id: 'ip_ban',        label: 'admin.tabIpBans',      icon: FiShield },
  { id: 'meeting_hosts', label: 'admin.tabMeetingHosts', icon: FiWifi },
  { id: 'calendar',      label: 'admin.tabCalendar',     icon: FiCalendar },
];
