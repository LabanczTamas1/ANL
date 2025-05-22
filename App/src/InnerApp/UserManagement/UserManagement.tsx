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

  // Check screen size for responsive design
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Fetch users data from API
  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No token found");
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/allUsersProgress`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Users:", data.allUserData);
      setUsers(data.allUserData || []); 
      setError(null);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      setUsers([]); 
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Modal controls
  const openMoneyModal = (user: User) => {
    setSelectedUser(user);
    setIsMoneyModalOpen(true);
  };

  const closeMoneyModal = () => {
    setIsMoneyModalOpen(false);
    setSelectedUser(null);
  };
  
  const openDetailModal = (user: User) => {
    setSelectedUser({...user}); // Create a copy to avoid reference issues
    setIsDetailModalOpen(true);
  };
  
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const handleGroupChange = (value: string) => {
    setGroupBy(value);
  };

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

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      // Refresh the users list
      await fetchUsers();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding user:", error);
      setError("Failed to add user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = async (userId: string, step: number) => {
    try {
      // Find the user to update
      const userToUpdate = users.find((user) => user.id === userId);
      if (!userToUpdate) return;

      // Create update object with only necessary fields
      const updateData = { 
        id: userId,
        name: userToUpdate.name,
        step: step 
      };
      
      // Call the API to update the user
      await handleUserUpdate(updateData);
    } catch (error) {
      console.error("Error updating step:", error);
      setError("Failed to update step. Please try again.");
      // Revert the optimistic update by refetching
      fetchUsers();
    }
  };

  const handleAddMoney = async (userId: string, amount: number) => {
    try {
      // Find the user to update
      const userToUpdate = users.find((user) => user.id === userId);
      if (!userToUpdate) return;

      // Create update object with only necessary fields
      const updateData = { 
        id: userId,
        name: userToUpdate.name,
        spends: userToUpdate.spends + amount 
      };
      
      // Call the API to update the user
      await handleUserUpdate(updateData);
      closeMoneyModal();
    } catch (error) {
      console.error("Error adding money:", error);
      setError("Failed to add money. Please try again.");
      // Revert the optimistic update by refetching
      fetchUsers();
    }
  };

  const fetchExchangeRate = useCallback(async (targetCurrency: string) => {
    if (targetCurrency.toLowerCase() === "ron") {
      setExchangeRate(1); // No conversion needed for RON
      return;
    }

    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/RON`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch exchange rate");
      }
      
      const data = await response.json();
      const rate = data.rates[targetCurrency.toUpperCase()];
      console.log("Exchange rate for", targetCurrency, ":", rate);
      
      if (!rate) {
        throw new Error("Invalid currency");
      }
      
      setExchangeRate(rate);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      setError("Failed to fetch exchange rate. Using default.");
      setExchangeRate(1); // Fallback to 1 if error
    }
  }, []);

  const handleCurrencyChange = (currencyType: string) => {
    setCurrency(currencyType);
    fetchExchangeRate(currencyType);
  };

  const convertSpends = (amount: number) => {
    return (amount * exchangeRate).toFixed(2);
  };

  const handleStatusChange = async (userId: string, status: string) => {
    // Find the user to update
    const userToUpdate = users.find((user) => user.id === userId);
    if (!userToUpdate) return;

    // Create update object with only necessary fields
    const updateData = { 
      id: userId,
      name: userToUpdate.name,
      status: status 
    };
    
    // Call the API to update the user
    await handleUserUpdate(updateData);
  };
  
  // Unified update function that handles all types of user updates
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
      // Find the current user data
      const currentUser = users.find(user => user.id === updatedUserData.id);
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Optimistically update the UI first with merged data
      const mergedUserData = { ...currentUser, ...updatedUserData };
      
      setUsers((prevUsers) =>
        prevUsers.map((user) => 
          user.id === updatedUserData.id ? mergedUserData : user
        )
      );
      
      // If we're updating the currently selected user in details view
      if (selectedUser && selectedUser.id === updatedUserData.id) {
        setSelectedUser(mergedUserData);
      }

      // Send update to server
      const response = await fetch(`${API_BASE_URL}/api/modifyUserData`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUserData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update user data: ${response.status}`);
      }

      // Handle the response data
      const data = await response.json();
      console.log("Update response:", data);
      
      // FIX: Only update the specific modified user in the users array
      // instead of replacing the entire users array
      if (data.updatedUser) {
        setUsers((prevUsers) => 
          prevUsers.map((user) => 
            user.id === data.updatedUser.id ? data.updatedUser : user
          )
        );
        
        // Update selected user if needed
        if (selectedUser && selectedUser.id === data.updatedUser.id) {
          setSelectedUser(data.updatedUser);
        }
      }
      
      setError(null);
    } catch (error) {
      console.error("Error updating user data:", error);
      // Revert the optimistic update by refetching
      fetchUsers();
      setError("Failed to update user. Please try again.");
    }
  };

  // Filter users safely
  const filteredUsers = users && users.length > 0 
    ? users.filter((user) => user.status === groupBy || groupBy === "all")
    : [];

  return (
    <div className="p-4 md:p-8 h-full">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">User Management</h1>
      
      {/* Show any error messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            className="underline text-sm" 
            onClick={() => setError(null)}
          >
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
      
      {/* Show loading state */}
      {loading ? (
        <div className="p-4 flex justify-center items-center">
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="max-h-[60vh] overflow-y-auto">
            {isMobile ? (
              // Mobile card view
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
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 
                          user.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          user.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
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
              // Desktop table view
              <table className="min-w-full w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-100 border-b sticky top-0 z-10">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Company</th>
                    <th className="text-left p-4">Progress (Steps)</th>
                    <th className="text-left p-4">User status</th>
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
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className="border border-gray-300 p-1 rounded"
                          >
                            <option value="new">New</option>
                            <option value="active">Active</option>
                            <option value="failed">Deal failed</option>
                            <option value="terminated">Terminated</option>
                          </select>
                        </td>
                        <td className="p-4">
                          {convertSpends(user.spends)}
                        </td>
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
      
      {/* Update AddMoneyModal to use userId instead of username */}
      <AddMoneyModal
        isOpen={isMoneyModalOpen}
        onClose={closeMoneyModal}
        onAddMoney={(amount) => {
          if (selectedUser) {
            handleAddMoney(selectedUser.id, amount);
          }
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
          convertedSpends={selectedUser ? convertSpends(selectedUser.spends) : "0"}
          onStepClick={(_, step) => handleStepClick(selectedUser.id, step)}
          onStatusChange={(updatedUser) => handleStatusChange(selectedUser.id, updatedUser.status)}
          onAddMoney={(amount) => {
            handleAddMoney(selectedUser.id, amount);
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;