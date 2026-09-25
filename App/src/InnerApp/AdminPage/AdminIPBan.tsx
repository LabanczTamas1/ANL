import React, { useEffect, useState } from "react";
import { FiShield, FiSlash } from "react-icons/fi";
import { useLanguage } from "../../hooks/useLanguage";
import {
  Alert,
  Button,
  Heading,
  Input,
  Text,
} from "@design-system/components";


const API_BASE = "http://localhost:3001"; // change this to your backend base URL

const AdminIPBan = () => {
  const { t } = useLanguage();
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
      setMessage(data.message || t("admin.ipBanned"));
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
      setMessage(data.message || t("admin.ipUnbanned"));
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
      <Heading level={3} className="mb-4 flex items-center gap-2">
        <FiShield aria-hidden="true" /> {t("admin.ipBanTitle")}
      </Heading>

      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder={t("admin.enterIpToBan")}
          value={newIP}
          onChange={(e) => setNewIP(e.target.value)}
          containerClassName="flex-1"
        />
        <Button variant="danger" onClick={handleBanIP} loading={loading}>
          {t("admin.banIp")}
        </Button>
      </div>

      {message && (
        <Alert tone="success" className="mb-2">
          {message}
        </Alert>
      )}

      <Heading level={4} className="mb-2 flex items-center gap-2">
        <FiSlash aria-hidden="true" /> {t("admin.bannedIpsHeading")}
      </Heading>
      <ul className="space-y-1">
        {bannedIPs.length === 0 && (
          <Text tone="muted" size="sm">
            {t("admin.noIpsBanned")}
          </Text>
        )}
        {bannedIPs.map((ip) => (
          <li
            key={ip}
            className="flex justify-between items-center bg-black/[0.04] dark:bg-white/5 px-3 py-1.5 rounded-lg"
          >
            <span className="text-content dark:text-content-inverse font-mono text-sm">{ip}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUnbanIP(ip)}
              disabled={loading}
              className="text-brand dark:text-brand-focus"
            >
              {t("admin.unban")}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminIPBan;
