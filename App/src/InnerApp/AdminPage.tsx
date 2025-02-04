import React, { useEffect, useState } from 'react';
import FlashMessage from '../FlashMessage';

interface User {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
}

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('users');
  const [flashMessage, setFlashMessage] = useState<{ message: string; type: 'success' | 'error'; duration: number } | null>(null);

  // Fetch users from backend when the component is mounted
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3000/listAllUsersAdmin', {
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
        setUsers(data); // Assuming the backend sends the list of users
        setFilteredUsers(data); // Initialize filteredUsers with all users
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3000/updateUserRole/${userId}`, {
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

     
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.username === userId ? { ...user, role: newRole } : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.username === userId ? { ...user, role: newRole } : user
        )
      );


      setFlashMessage({
        message: `User role updated successfully to ${newRole!}`,
        type: "success",
        duration: 3000,
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  
  useEffect(() => {
    if (flashMessage) {
      const timer = setTimeout(() => {
        setFlashMessage(null); // Clear the flash message after duration
      }, flashMessage.duration);

      return () => clearTimeout(timer); // Clean up the timer on component unmount or before setting a new flash message
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
        user.username.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery) ||
        user.firstName.toLowerCase().includes(lowerCaseQuery) ||
        user.lastName.toLowerCase().includes(lowerCaseQuery)
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
          className={`pb-2 ${activeTab === 'yours' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => handleTabClick('yours')}
        >
          Yours
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

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username, email, first name, or last name"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded shadow-sm"
        />
      </div>

      {/* Display Content Based on Active Tab */}
      {loading && <p className="text-gray-500">Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {activeTab === 'users' && !loading && filteredUsers.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold">Users</h2>
          {/* Add overview content here */}
        </div>
      )}

      {activeTab === 'users' && !loading && filteredUsers.length > 0 && (
        <div>
          <table className="min-w-full table-auto bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Username</th>
                <th className="px-4 py-2 text-left">First Name</th>
                <th className="px-4 py-2 text-left">Last Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.firstName}</td>
                  <td className="px-4 py-2">{user.lastName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.username, e.target.value)}
                      className="border border-gray-300 p-1 rounded"
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Render Flash Message */}
      {flashMessage && <FlashMessage message={flashMessage.message} type={flashMessage.type} duration={flashMessage.duration} />}
    </div>
  );
};

export default AdminPage;
