import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "darkMode";

const getSystemPrefersDark = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const getInitialDarkMode = () => {
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved !== null ? saved === "true" : getSystemPrefersDark();
};

/**
 * Shared theme controller.
 *
 * - Reads the persisted `darkMode` preference (set anywhere in the ANL app).
 * - Falls back to the OS / browser `prefers-color-scheme` when no preference
 *   has been stored yet — important for the logged-out booking flow where no
 *   other component sets the theme.
 * - Keeps the `dark` class on <html> in sync with the active mode.
 * - Tracks live OS changes while the user has not made an explicit choice.
 */
export const useThemePreference = () => {
  const [darkMode, setDarkMode] = useState<boolean>(getInitialDarkMode);

  // Apply + persist whenever the mode changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem(STORAGE_KEY, darkMode.toString());
  }, [darkMode]);

  // Follow the OS preference until the user makes an explicit choice elsewhere.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(STORAGE_KEY) === null) setDarkMode(e.matches);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Sync across tabs / other controllers that change the stored preference.
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setDarkMode(e.newValue === "true");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleTheme = useCallback(() => setDarkMode((prev) => !prev), []);

  return { darkMode, setDarkMode, toggleTheme };
};

export default useThemePreference;
