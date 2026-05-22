import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSearch, FiPlus, FiDollarSign, FiInfo } from "react-icons/fi";
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

const STATUS_BADGE: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  terminated: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currency, setCurrency] = useState("ron");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [groupBy, setGroupBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required. Please login again.");
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
      setUsers(data.allUserData || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users.");
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

  // Add new user
  const handleAddUser = async (data: any) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required.");
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
      toast.success("User added successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = async (userId: string, step: number) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;
    await handleUserUpdate({ id: userId, step });
  };

  const handleAddMoney = async (userId: string, amount: number | string) => {
    const userToUpdate = users.find((u) => u.id === userId);
    if (!userToUpdate) return;

    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) {
      toast.error("Invalid amount entered.");
      return;
    }

    const updatedSpends = Number(userToUpdate.spends) + numericAmount;
    await handleUserUpdate({ id: userId, spends: updatedSpends });
    closeMoneyModal();
    toast.success(`Added ${numericAmount} to ${userToUpdate.name}'s balance`);
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
      setExchangeRate(rate);
    } catch (err: any) {
      toast.error("Failed to fetch exchange rate.");
      setExchangeRate(1);
    }
  }, []);

  const handleCurrencyChange = (type: string) => {
    setCurrency(type);
    fetchExchangeRate(type);
  };

  const convertSpends = (amount: number) => (amount * exchangeRate).toFixed(2);

  const handleStatusChange = async (userId: string, status: string) => {
    await handleUserUpdate({ id: userId, status });
  };

  const handleUserUpdate = async (updatedUserData: Partial<User>) => {
    if (!updatedUserData.id) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required.");
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
      if (data.updatedUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === data.updatedUser.id ? data.updatedUser : u))
        );
        if (selectedUser && selectedUser.id === data.updatedUser.id) {
          setSelectedUser(data.updatedUser);
        }
      }
    } catch (err: any) {
      fetchUsers();
      toast.error(err.message || "Failed to update user.");
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesGroup = groupBy === "all" || u.status === groupBy;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);
    return matchesGroup && matchesSearch;
  });

  return (
    <div className="min-h-full bg-white dark:bg-[#121212] text-gray-900 dark:text-gray-100 p-4 md:p-6">
      <ToastContainer position="top-right" theme="colored" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl md:text-2xl font-bold">User Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#65558F] hover:bg-[#4e4070] text-white text-sm font-medium transition-colors"
        >
          <FiPlus className="text-base" />
          Add User
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, company, ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
          />
        </div>

        {/* Group filter */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="active">Active</option>
          <option value="failed">Deal Failed</option>
          <option value="terminated">Terminated</option>
        </select>

        {/* Currency */}
        <select
          value={currency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
        >
          <option value="ron">RON</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
          <option value="HUF">HUF</option>
        </select>

        <span className="self-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {filteredUsers.length} / {users.length} users
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 py-8 justify-center">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading users…
        </div>
      )}

      {/* Empty */}
      {!loading && filteredUsers.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">
          No users match your filters.
        </p>
      )}

      {/* Table (desktop) / Cards (mobile) */}
      {!loading && filteredUsers.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1a1a2e] text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Progress</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Income ({currency.toUpperCase()})</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.company}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                          <button
                            key={step}
                            onClick={() => handleStepClick(user.id, step)}
                            className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                              user.step >= step
                                ? "bg-[#65558F] text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {step}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#65558F] appearance-auto"
                      >
                        <option value="new">New</option>
                        <option value="active">Active</option>
                        <option value="failed">Deal Failed</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono">
                      {convertSpends(user.spends)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openMoneyModal(user); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-[#65558F] hover:bg-[#4e4070] text-white transition-colors"
                        >
                          <FiDollarSign className="text-sm" />
                          Add
                        </button>
                        <button
                          onClick={() => openDetailModal(user)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                          <FiInfo className="text-sm" />
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => openDetailModal(user)}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e1e] shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{user.name}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_BADGE[user.status] ?? STATUS_BADGE.terminated}`}>
                    {user.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{user.company}</p>

                {/* Step indicators */}
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5, 6, 7].map((step) => (
                    <div
                      key={step}
                      className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-semibold ${
                        user.step >= step
                          ? "bg-[#65558F] text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {convertSpends(user.spends)} {currency.toUpperCase()}
                  </span>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#65558F] hover:bg-[#4e4070] text-white transition-colors"
                    onClick={(e) => { e.stopPropagation(); openMoneyModal(user); }}
                  >
                    <FiDollarSign className="text-sm" />
                    Add money
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

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
