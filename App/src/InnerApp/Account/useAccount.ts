import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLanguage } from "../../hooks/useLanguage";

export interface AccountDetails {
  firstname: string;
  lastname: string;
  email: string;
  username: string;
}

export interface PasswordFields {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_DETAILS: AccountDetails = {
  firstname: "",
  lastname: "",
  email: "",
  username: "",
};

const EMPTY_PASSWORDS: PasswordFields = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * Encapsulates all Account page data-fetching and mutation logic so the UI
 * components stay presentational.
 */
export function useAccount() {
  const { t } = useLanguage();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [details, setDetails] = useState<AccountDetails>(EMPTY_DETAILS);
  const [passwords, setPasswords] = useState<PasswordFields>(EMPTY_PASSWORDS);
  const [isOAuth, setIsOAuth] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const authHeader = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error(t("notAuthenticated"));
    return { Authorization: `Bearer ${token}` };
  }, [t]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await axios.get(`${API_BASE_URL}/api/v1/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setDetails({
          firstname: userData.firstName || "",
          lastname: userData.lastName || "",
          email: userData.email || "",
          username: userData.username || "",
        });
        setIsOAuth(!!(userData.provider && userData.provider !== "local"));
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(t("failedUpdate"));
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserData();
  }, [API_BASE_URL, t]);

  const updateDetail = useCallback((field: keyof AccountDetails, value: string) => {
    setDetails((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updatePassword = useCallback((field: keyof PasswordFields, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  }, []);

  const saveDetails = useCallback(async () => {
    setError("");
    setSuccess("");
    setSavingDetails(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/v1/user/modifyUserData`,
        {
          firstName: details.firstname,
          lastName: details.lastname,
          email: details.email,
          username: details.username,
        },
        { headers: authHeader() },
      );
      setSuccess(t("successMessage"));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t("failedUpdate"));
    } finally {
      setSavingDetails(false);
    }
  }, [API_BASE_URL, authHeader, details, t]);

  const changePassword = useCallback(async () => {
    setError("");
    setSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSavingPassword(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/v1/user/change-password`,
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        { headers: authHeader() },
      );
      setSuccess(t("passwordUpdated"));
      setPasswords(EMPTY_PASSWORDS);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || t("failedPassword"));
    } finally {
      setSavingPassword(false);
    }
  }, [API_BASE_URL, authHeader, passwords, t]);

  const dismissMessages = useCallback(() => {
    setError("");
    setSuccess("");
  }, []);

  return {
    details,
    passwords,
    isOAuth,
    initialLoading,
    savingDetails,
    savingPassword,
    success,
    error,
    updateDetail,
    updatePassword,
    saveDetails,
    changePassword,
    dismissMessages,
  };
}

export default useAccount;
