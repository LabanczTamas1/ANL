import { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSearch, FiPlus, FiInfo, FiDollarSign, FiClock } from "react-icons/fi";
import AddUserModal from "./AddUserModal";
import AddMoneyModal from "./AddMoneyModal";
import TransactionHistoryModal from "./TransactionHistoryModal";
import UserDetailModal from "./UserDetailModal";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  progressionStatus: string;
  progressionCategory: string;
  progressionTimeline: string;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  inactive: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  terminated: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  inactive: "Inactive",
  terminated: "Terminated",
};

const DISPLAY_CURRENCIES = ["RON", "EUR", "USD", "GBP", "HUF", "CHF"] as const;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [groupBy, setGroupBy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState("RON");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Rate to convert RON → display currency
  const displayRate = displayCurrency === "RON" ? 1 : (exchangeRates[displayCurrency] || 1);

  const formatBalance = (ronAmount: number) => {
    const converted = ronAmount * displayRate;
    return `${converted.toFixed(2)} ${displayCurrency}`;
  };

  const fetchRates = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/finance/rates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data.rates || {});
      }
    } catch {
      // silently fail
    }
  }, [API_BASE_URL]);

  const fetchBalances = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/finance/balances`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBalances(data.balances || {});
      }
    } catch {
      // silently fail — balances are supplementary
    }
  }, [API_BASE_URL]);

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/progress/allUsersProgress`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);

      const data = await response.json();
      const mapped: User[] = (data.data || []).map((u: any) => ({
        id: u.userId,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        company: u.company || "",
        progressionStatus: u.progressionStatus || "pending",
        progressionCategory: u.progressionCategory || "",
        progressionTimeline: u.progressionTimeline || "",
      }));
      setUsers(mapped);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchUsers();
    fetchBalances();
    fetchRates();
  }, [fetchUsers, fetchBalances, fetchRates]);

  // Modal handlers
  const openDetailModal = (user: User) => {
    setSelectedUser({ ...user });
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const openMoneyModal = (user: User) => {
    setSelectedUser({ ...user });
    setIsMoneyModalOpen(true);
  };

  const openHistoryModal = (user: User) => {
    setSelectedUser({ ...user });
    setIsHistoryModalOpen(true);
  };

  // Add new user — just refresh the list after AddUserModal succeeds
  const handleAddUser = async () => {
    await fetchUsers();
    setIsModalOpen(false);
    toast.success("User added successfully");
  };

  // Update progression status via v1 progress endpoint
  const handleStatusChange = async (userId: string, progressionStatus: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required.");
      return;
    }

    try {
      // Optimistic update
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, progressionStatus } : u))
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, progressionStatus } : prev);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/progress/changeUserProgress/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ progressionStatus }),
        }
      );

      if (!response.ok) throw new Error(`Failed to update status: ${response.status}`);
    } catch (err: any) {
      fetchUsers();
      toast.error(err.message || "Failed to update status.");
    }
  };

  // Update progression category/timeline
  const handleProgressUpdate = async (
    userId: string,
    updates: { progressionCategory?: string; progressionTimeline?: string }
  ) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required.");
      return;
    }

    try {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...updates } : u))
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => prev ? { ...prev, ...updates } : prev);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/progress/changeUserProgress/${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) throw new Error(`Failed to update progress: ${response.status}`);
    } catch (err: any) {
      fetchUsers();
      toast.error(err.message || "Failed to update progress.");
    }
  };

  // Filtered users
  const fullName = (u: User) => `${u.firstName} ${u.lastName}`.trim();
  const filteredUsers = users.filter((u) => {
    const matchesGroup = groupBy === "all" || u.progressionStatus === groupBy;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      fullName(u).toLowerCase().includes(q) ||
      u.company.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
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
            placeholder="Search by name, email, company…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm"
          />
        </div>

        {/* Status filter */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </select>

        {/* Display currency selector */}
        <select
          value={displayCurrency}
          onChange={(e) => setDisplayCurrency(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#65558F] text-sm appearance-auto"
          title="Display currency"
        >
          {DISPLAY_CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
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
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Balance ({displayCurrency})</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                      {fullName(user)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{user.company}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.progressionStatus}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#65558F] appearance-auto"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="terminated">Terminated</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                      {formatBalance(balances[user.id] ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); openMoneyModal(user); }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium bg-[#65558F] hover:bg-[#4e4070] text-white transition-colors"
                          title="Add/Remove Money"
                        >
                          <FiDollarSign className="text-sm" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openHistoryModal(user); }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="Transaction History"
                        >
                          <FiClock className="text-sm" />
                        </button>
                        <button
                          onClick={() => openDetailModal(user)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="User Details"
                        >
                          <FiInfo className="text-sm" />
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
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{fullName(user)}</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_BADGE[user.progressionStatus] ?? STATUS_BADGE.terminated}`}>
                    {STATUS_LABELS[user.progressionStatus] ?? user.progressionStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{user.email}</p>
                {user.company && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{user.company}</p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                    {formatBalance(balances[user.id] ?? 0)}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#65558F] hover:bg-[#4e4070] text-white transition-colors"
                      onClick={(e) => { e.stopPropagation(); openMoneyModal(user); }}
                    >
                      <FiDollarSign className="text-sm" />
                      Money
                    </button>
                    <button
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      onClick={(e) => { e.stopPropagation(); openHistoryModal(user); }}
                    >
                      <FiClock className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {selectedUser && (
        <>
          <UserDetailModal
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            user={selectedUser}
            balance={balances[selectedUser.id] ?? 0}
            displayCurrency={displayCurrency}
            displayRate={displayRate}
            onStatusChange={(status) => handleStatusChange(selectedUser.id, status)}
            onProgressUpdate={(updates) => handleProgressUpdate(selectedUser.id, updates)}
            onOpenMoney={() => { setIsDetailModalOpen(false); setIsMoneyModalOpen(true); }}
            onOpenHistory={() => { setIsDetailModalOpen(false); setIsHistoryModalOpen(true); }}
          />

          <AddMoneyModal
            isOpen={isMoneyModalOpen}
            onClose={() => { setIsMoneyModalOpen(false); setSelectedUser(null); }}
            userId={selectedUser.id}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`.trim()}
            currentBalance={balances[selectedUser.id] ?? 0}
            displayCurrency={displayCurrency}
            displayRate={displayRate}
            onSuccess={() => {
              fetchBalances();
              toast.success("Transaction recorded successfully");
            }}
          />

          <TransactionHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => { setIsHistoryModalOpen(false); setSelectedUser(null); }}
            userId={selectedUser.id}
            userName={`${selectedUser.firstName} ${selectedUser.lastName}`.trim()}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;
