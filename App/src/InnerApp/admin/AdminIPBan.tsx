import React, { useEffect, useState } from "react";


const API_BASE = "http://localhost:3001"; // change this to your backend base URL

const AdminIPBan = () => {
  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [newIP, setNewIP] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("authToken");

  const fetchBannedIPs = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/banned-ips`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setBannedIPs(data.banned || []);
    } catch (err) {
      console.error("Failed to fetch banned IPs:", err);
    }
  };

  const handleBanIP = async () => {
    if (!newIP) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/admin/ban-ip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ip: newIP }),
      });

      const data = await res.json();
      setMessage(data.message || "IP banned.");
      setNewIP("");
      fetchBannedIPs();
    } catch (err) {
      console.error("Ban failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnbanIP = async (ip: string) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_BASE}/admin/unban-ip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ip }),
      });

      const data = await res.json();
      setMessage(data.message || "IP unbanned.");
      fetchBannedIPs();
    } catch (err) {
      console.error("Unban failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔒 IP Ban Management</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter IP to ban"
          value={newIP}
          onChange={(e) => setNewIP(e.target.value)}
          className="border px-2 py-1 flex-1 rounded"
        />
        <button
          onClick={handleBanIP}
          disabled={loading}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Ban IP
        </button>
      </div>

      {message && <p className="mb-2 text-green-600">{message}</p>}

      <h3 className="font-semibold mb-2">🚫 Banned IPs:</h3>
      <ul className="space-y-1">
        {bannedIPs.length === 0 && <p className="text-sm text-gray-500">No IPs banned.</p>}
        {bannedIPs.map((ip) => (
          <li
            key={ip}
            className="flex justify-between items-center bg-gray-100 px-3 py-1 rounded"
          >
            <span>{ip}</span>
            <button
              onClick={() => handleUnbanIP(ip)}
              disabled={loading}
              className="text-sm text-blue-600 hover:underline"
            >
              Unban
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminIPBan;
