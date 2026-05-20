import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TABS } from './constants';
import AdminTabBar from './AdminTabBar';
import UsersTab from './users/UsersTab';
import RequestStats from './RequestStats';
import AdminIPBan from './AdminIPBan';
import MeetingHosts from './MeetingHosts';
import CalendarConnection from './CalendarConnection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState('user');

  const hashTab = location.hash.replace('#', '');
  const activeTab = TABS.some(t => t.id === hashTab) ? hashTab : 'users';

  const setActiveTab = (id: string) => navigate({ hash: id }, { replace: true });

  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/v1/user/me`, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) return;
        const data = await response.json();
        setCurrentUserRole(data.role);
      } catch {
        // non-critical
      }
    };
    fetchCurrentUserRole();
  }, []);

  return (
    <div className="min-h-full bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100">
      <ToastContainer position="top-right" theme="colored" />
      <AdminTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="p-4 md:p-6">
        {activeTab === 'users'         && <UsersTab />}
        {activeTab === 'stats'         && <RequestStats userRole={currentUserRole} />}
        {activeTab === 'ip_ban'        && <AdminIPBan />}
        {activeTab === 'meeting_hosts' && <MeetingHosts />}
        {activeTab === 'calendar'      && <CalendarConnection />}
      </div>
    </div>
  );
};

export default AdminPage;
