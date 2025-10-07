import { useState, useEffect, useCallback } from "react";
import AddUserModal from "./AddUserModal";
import AddMoneyModal from "./AddMoneyModal";
import UserDetailModal from "./UserDetailModal";

interface User {
  id: string;
  name: string;
  company: string;
  step: number;
  spends: number;
  status: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currency, setCurrency] = useState("ron");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [groupBy, setGroupBy] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Responsive screen check
  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/allUsersProgress`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);

      const data = await response.json();
      console.log("Fetched Users:", data.allUserData);
      setUsers(data.allUserData || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Modal handlers
  const openMoneyModal = (user: User) => {
    setSelectedUser(user);
    setIsMoneyModalOpen(true);
  };

  const closeMoneyModal = () => {
    setIsMoneyModalOpen(false);
    setSelectedUser(null);
  };

  const openDetailModal = (user: User) => {
    setSelectedUser({ ...user });
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleGroupChange = (value: string) => setGroupBy(value);

  // Add new user
  const handleAddUser = async (data: any) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/addUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to add user");

      await fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle step click
  const handleStepClick = async (userId: string, step: number) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    await handleUserUpdate({ id: userId, step });
  };

  // Handle add money (main fix here)
  const handleAddMoney = async (userId: string, amount: number | string) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      setError("Invalid amount entered.");
      return;
    }

    const updatedSpends = Number(userToUpdate.spends) + numericAmount;

    await handleUserUpdate({
      id: userId,
      spends: updatedSpends,
    });

    closeMoneyModal();
  };

  // Exchange rate
  const fetchExchangeRate = useCallback(async (targetCurrency: string) => {
    if (targetCurrency.toLowerCase() === "ron") {
      setExchangeRate(1);
      return;
    }

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/RON`);
      if (!response.ok) throw new Error("Failed to fetch exchange rate");

      const data = await response.json();
      const rate = data.rates[targetCurrency.toUpperCase()];
      if (!rate) throw new Error("Invalid currency");

      console.log("Exchange rate for", targetCurrency, ":", rate);
      setExchangeRate(rate);
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      setError("Failed to fetch exchange rate. Using default 1.");
      setExchangeRate(1);
    }
  }, []);

  const handleCurrencyChange = (type: string) => {
    setCurrency(type);
    fetchExchangeRate(type);
  };

  const convertSpends = (amount: number) => (amount * exchangeRate).toFixed(2);

  // Handle status change
  const handleStatusChange = async (userId: string, status: string) => {
    await handleUserUpdate({ id: userId, status });
  };

  // Unified update function
  const handleUserUpdate = async (updatedUserData: Partial<User>) => {
    if (!updatedUserData.id) {
      setError("User ID is required for updates");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    try {
      const currentUser = users.find((u) => u.id === updatedUserData.id);
      if (!currentUser) throw new Error("User not found");

      const mergedUserData = { ...currentUser, ...updatedUserData };
      setUsers((prev) => prev.map((u) => (u.id === mergedUserData.id ? mergedUserData : u)));

      if (selectedUser && selectedUser.id === mergedUserData.id) {
        setSelectedUser(mergedUserData);
      }

      console.log("Sending user update:", updatedUserData);

      const response = await fetch(`${API_BASE_URL}/api/modifyUserData`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) throw new Error(`Failed to update user: ${response.status}`);

      const data = await response.json();
      console.log("Update response:", data);

      if (data.updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === data.updatedUser.id ? data.updatedUser : u))
        );

        if (selectedUser && selectedUser.id === data.updatedUser.id) {
          setSelectedUser(data.updatedUser);
        }
      }

      setError(null);
    } catch (err) {
      console.error("Error updating user:", err);
      fetchUsers();
      setError("Failed to update user. Please try again.");
    }
  };

  // Filtered users
  const filteredUsers =
    users && users.length > 0
      ? users.filter((u) => groupBy === "all" || u.status === groupBy)
      : [];

  return (
    <div className="p-4 md:p-8 h-full w-full">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">User Management</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button className="underline text-sm" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0 mb-4">
        <label className="flex items-center">
          Group by:
          <select
            value={groupBy}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="ml-2 border border-gray-300 p-1 rounded"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="active">Active</option>
            <option value="failed">Deal failed</option>
            <option value="terminated">Terminated</option>
          </select>
        </label>

        <label className="flex items-center">
          Currency:
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="ml-2 border border-gray-300 p-1 rounded"
          >
            <option value="ron">RON</option>
            <option value="EUR">EURO</option>
            <option value="USD">USD</option>
            <option value="HUF">HUF</option>
          </select>
        </label>
      </div>

      {loading ? (
        <div className="p-4 flex justify-center items-center">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-[800px] min-w-[80vw]">
          <div className="max-h-[60vh] overflow-y-auto">
            {isMobile ? (
              // Mobile cards
              <div className="grid grid-cols-1 gap-4">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-white shadow rounded-lg p-4 border-l-4 border-[#65558F]"
                      onClick={() => openDetailModal(user)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold">{user.name}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.status === "active"
                              ? "bg-green-100 text-green-800"
                              : user.status === "new"
                              ? "bg-blue-100 text-blue-800"
                              : user.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{user.company}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">
                          {convertSpends(user.spends)} {currency.toUpperCase()}
                        </span>
                        <button
                          className="bg-[#65558F] text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            openMoneyModal(user);
                          }}
                        >
                          Add money
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">No users found</p>
                )}
              </div>
            ) : (
              // Desktop table
              <table className="min-w-full w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-100 border-b sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Company</th>
                    <th className="text-left p-4">Progress</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Income ({currency.toUpperCase()})</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{user.name}</td>
                        <td className="p-4">{user.company}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                              <div
                                key={step}
                                className={`w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-colors duration-200 ${
                                  user.step >= step
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                                onClick={() => handleStepClick(user.id, step)}
                              >
                                {step}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={user.status}
                            onChange={(e) =>
                              handleStatusChange(user.id, e.target.value)
                            }
                            className="border border-gray-300 p-1 rounded"
                          >
                            <option value="new">New</option>
                            <option value="active">Active</option>
                            <option value="failed">Deal failed</option>
                            <option value="terminated">Terminated</option>
                          </select>
                        </td>
                        <td className="p-4">{convertSpends(user.spends)}</td>
                        <td className="p-4 flex space-x-2">
                          <button
                            className="bg-[#65558F] text-white px-2 py-1 rounded hover:bg-blue-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              openMoneyModal(user);
                            }}
                          >
                            Add money
                          </button>
                          <button
                            className="bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                            onClick={() => openDetailModal(user)}
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <button
          className="bg-[#65558F] text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => setIsModalOpen(true)}
        >
          Add new user
        </button>
      </div>

      {/* Modals */}
      <AddMoneyModal
        isOpen={isMoneyModalOpen}
        onClose={closeMoneyModal}
        onAddMoney={(amount) => {
          if (selectedUser) handleAddMoney(selectedUser.id, Number(amount));
        }}
        username={selectedUser?.name || ""}
      />

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {selectedUser && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          user={selectedUser}
          currency={currency}
          convertedSpends={convertSpends(selectedUser.spends)}
          onStepClick={(_, step) => handleStepClick(selectedUser.id, step)}
          onStatusChange={(updatedUser) =>
            handleStatusChange(selectedUser.id, updatedUser.status)
          }
          onAddMoney={(amount) => handleAddMoney(selectedUser.id, Number(amount))}
        />
      )}
    </div>
  );
};

export default UserManagement;
