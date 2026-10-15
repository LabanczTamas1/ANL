// Shared helper for re-opening the cookie consent banner so users can
// withdraw or change their consent at any time (GDPR Art. 7(3)).

export const COOKIE_SETTINGS_EVENT = 'open-cookie-settings';

/** Dispatches an event that the CookieConsentBanner listens for to re-open. */
export function openCookieSettings(): void {
  window.dispatchEvent(new CustomEvent(COOKIE_SETTINGS_EVENT));
}
