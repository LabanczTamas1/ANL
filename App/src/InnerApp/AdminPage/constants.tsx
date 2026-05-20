import { FiUsers, FiShield, FiWifi, FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { IconType } from 'react-icons';

export interface Tab {
  id: string;
  label: string;
  icon: IconType;
}

export const TABS: Tab[] = [
  { id: 'users',         label: 'Users',        icon: FiUsers },
  { id: 'stats',         label: 'API Stats',    icon: FiBarChart2 },
  { id: 'ip_ban',        label: 'IP Bans',      icon: FiShield },
  { id: 'meeting_hosts', label: 'Meeting Hosts', icon: FiWifi },
  { id: 'calendar',      label: 'Calendar',     icon: FiCalendar },
];
