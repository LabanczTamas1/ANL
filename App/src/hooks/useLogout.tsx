import { useNavigate } from "react-router-dom";
import { usePostHog } from "@posthog/react";

/**
 * A custom hook that provides a reusable logout function
 * Clears all authentication-related data from localStorage except darkMode
 * and redirects to login page
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const logout = () => {
    posthog.capture("user_logged_out");
    posthog.reset();

    // Preserve darkMode
    const darkMode = localStorage.getItem("darkMode");

    // Clear everything
    localStorage.clear();

    // Restore darkMode
    if (darkMode !== null) {
      localStorage.setItem("darkMode", darkMode);
    }

    // Navigate to login page
    navigate("/login", { replace: true });
  };

  return logout;
};
