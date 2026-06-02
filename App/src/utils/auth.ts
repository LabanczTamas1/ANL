// ---------------------------------------------------------------------------
// Auth utilities — standalone logout logic (no React dependencies)
// ---------------------------------------------------------------------------

/** Keys that survive a logout (non-auth, user-preference data). */
const PRESERVED_KEYS = ['darkMode', 'cookieConsent', 'cookiePreferences'] as const;

/**
 * Clear all auth-related localStorage data and redirect to /login.
 *
 * This is intentionally a plain function (not a hook) so it can be called
 * from Axios interceptors, event listeners, or any non-React context.
 *
 * Call `useLogout()` instead when you are inside a React component and
 * need PostHog tracking + React-Router navigation.
 */
export function performLogout(): void {
  // Prevent multiple simultaneous logouts (e.g. several 401s in parallel)
  if ((performLogout as any).__running) return;
  (performLogout as any).__running = true;

  try {
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

    // 4. Navigate to login (works outside React-Router)
    window.location.replace('/login');
  } finally {
    // Reset the guard after a tick so future logouts can fire if needed
    setTimeout(() => {
      (performLogout as any).__running = false;
    }, 100);
  }
}

/**
 * Wrapper around the native `fetch` that auto-triggers logout on 401.
 * Use this for authenticated API calls that don't go through `apiClient`.
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, init);
  if (response.status === 401 || response.status === 403) {
    performLogout();
  }
  return response;
}
