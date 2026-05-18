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

    // Preserve values that should survive logout
    const darkMode = localStorage.getItem("darkMode");
    const cookieConsent = localStorage.getItem("cookieConsent");
    const cookiePreferences = localStorage.getItem("cookiePreferences");

    // Clear everything
    localStorage.clear();

    // Restore preserved values
    if (darkMode !== null) {
      localStorage.setItem("darkMode", darkMode);
    }
    if (cookieConsent !== null) {
      localStorage.setItem("cookieConsent", cookieConsent);
    }
    if (cookiePreferences !== null) {
      localStorage.setItem("cookiePreferences", cookiePreferences);
    }

    // Re-apply PostHog opt state from preserved consent
    if (cookieConsent === "true") {
      const prefs = cookiePreferences ? JSON.parse(cookiePreferences) : null;
      if (!prefs || prefs.analytics === true) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }

    // Navigate to login page
    navigate("/login", { replace: true });
  };

  return logout;
};
