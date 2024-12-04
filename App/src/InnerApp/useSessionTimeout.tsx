import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Clear session storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("expiresAt");

    // Navigate to the home page
    navigate("/");
  };

  return logout;
};

const useSessionTimeout = () => {
  const logout = useLogout();

  useEffect(() => {
    const expiresAt = localStorage.getItem("expiresAt");
    console.log(expiresAt);

    if (expiresAt) {
      const sessionTimeout = new Date(expiresAt).getTime() - Date.now();
        console.log(sessionTimeout);
      if (sessionTimeout > 0) {
        // Schedule auto-logout when the session expires
        const timeoutId = setTimeout(() => {
          logout();
        }, sessionTimeout);

        // Cleanup on unmount or session update
        return () => clearTimeout(timeoutId);
      } else {
        // If session already expired, log out immediately
        logout();
      }
    }
  }, [logout]);
};

export default useSessionTimeout;
