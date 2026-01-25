import React, { useEffect, useState } from 'react';
import FlashMessage from '../FlashMessage';
import RequestStats from './admin/RequestStats';
import AdminIPBan from './admin/AdminIPBan';

// Updated interface to match the backend model
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  username?: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('users');
  const [flashMessage, setFlashMessage] = useState<{ message: string; type: 'success' | 'error'; duration: number } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string>('user');
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch users from backend when the component is mounted
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/listAllUsers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    fetchCurrentUserRole();
  }, []);

  // Fetch current user's role
  const fetchCurrentUserRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/user/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch current user');
      }

      const data = await response.json();
      setCurrentUserRole(data.role);
    } catch (err: any) {
      console.error('Error fetching current user role:', err.message);
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/updateUserRole/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const result = await response.json();
     
      // Update the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      setFlashMessage({
        message: result.message || `User role updated successfully to ${newRole}`,
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setFlashMessage({
        message: err.message || 'Failed to update user role',
        type: "error",
        duration: 3000,
      });
    }
  };

  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null);
      }, flashMessage.duration);

      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  // Handle tab click
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle search query change
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const lowerCaseQuery = query.toLowerCase();

    const filtered = users.filter(
      (user) =>
        user.id.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        user.name.toLowerCase().includes(lowerCaseQuery)
    );

    setFilteredUsers(filtered);
  };

  return (
    <div className="container mx-auto p-4">
      {/* Tabs Navigation */}
      <div className="mb-4 flex space-x-4 border-b-2 border-gray-300">
        <button
          className={`pb-2 ${activeTab === 'users' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('users')}
        >
          Users
        </button>
        <button
          className={`pb-2 ${activeTab === 'stats' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('stats')}
        >
          API Stats
        </button>
        <button
          className={`pb-2 ${activeTab === 'ip_ban' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('ip_ban')}
        >
          IP Bans
        </button>
        <button
          className={`pb-2 ${activeTab === 'active' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('active')}
        >
          Active
        </button>
        <button
          className={`pb-2 ${activeTab === 'stale' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('stale')}
        >
          Stale
        </button>
        <button
          className={`pb-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('all')}
        >
          All
        </button>
      </div>

      {/* Display Content Based on Active Tab */}
      {activeTab === 'users' && (
        <>
          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by ID, email, or name"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded shadow-sm"
            />
          </div>

          {loading && <p className="text-gray-500">Loading users...</p>}
          {error && <p className="text-red-500">{error}</p>}

          <div>
            <h2 className="text-2xl font-semibold mb-4">Users</h2>
            {filteredUsers.length === 0 ? (
              <p className="text-gray-500">No users found matching your search criteria.</p>
            ) : (
              <table className="min-w-full table-auto bg-white border border-gray-300 shadow-md rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">User ID</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.id}</td>
                      <td className="px-4 py-2">{user.name || user.username}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="border border-gray-300 p-1 rounded"
                        >
                          <option value="admin">Admin</option>
                          <option value="user">User</option>
                          <option value="owner">Owner</option>
                        </select>
                      </td>
                      <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* API Stats Tab */}
      {activeTab === 'stats' && <RequestStats userRole={currentUserRole} />}
      {activeTab === 'ip_ban' && <AdminIPBan/>}

      {/* Other existing tabs would be here... */}

      {/* Render Flash Message */}
      {flashMessage && <FlashMessage message={flashMessage.message} type={flashMessage.type} duration={flashMessage.duration} />}
    </div>
  );
};

export default AdminPage;