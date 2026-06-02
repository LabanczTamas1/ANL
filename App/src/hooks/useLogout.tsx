import { useNavigate } from "react-router-dom";
import { usePostHog } from "@posthog/react";

/** Keys that survive a logout (non-auth, user-preference data). */
const PRESERVED_KEYS = ["darkMode", "cookieConsent", "cookiePreferences"] as const;

/**
 * A custom hook that provides a reusable logout function.
 * Clears all authentication-related data from localStorage,
 * resets PostHog, and redirects to the login page via React Router.
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const posthog = usePostHog();

  const logout = () => {
    posthog.capture("user_logged_out");
    posthog.reset();

    // 1. Preserve non-auth values
    const preserved = PRESERVED_KEYS.reduce<Record<string, string | null>>(
      (acc, key) => {
        acc[key] = localStorage.getItem(key);
        return acc;
      },
      {},
    );

    // 2. Wipe everything
    localStorage.clear();
    sessionStorage.clear();

    // 3. Restore preserved values
    for (const [key, value] of Object.entries(preserved)) {
      if (value !== null) localStorage.setItem(key, value);
    }

    // 4. Re-apply PostHog opt state from preserved consent
    const cookieConsent = preserved.cookieConsent;
    if (cookieConsent === "true") {
      const prefs = preserved.cookiePreferences
        ? JSON.parse(preserved.cookiePreferences)
        : null;
      if (!prefs || prefs.analytics === true) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    }

    // 5. Navigate to login page (React Router — no full reload)
    navigate("/login", { replace: true });
  };

  return logout;
};
