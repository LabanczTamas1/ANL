import React from "react";
import TermsItem from "./TermsItem";

const CookiePolicy = () => {
  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto pt-28 pb-16 px-4 sm:px-6 md:px-8 text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
        Cookie Policy
      </h1>
      <p className="text-center text-sm sm:text-base mb-8 text-gray-400">
        Effective Date: May 18, 2026
      </p>
      <main className="space-y-6">
        <TermsItem
          title="1. What Are Cookies"
          information="Cookies are small text files placed on your device when you visit our website. They allow us to recognise your device, remember preferences, maintain your session, and understand how you use the platform. Similar technologies include localStorage and sessionStorage, which we also use for session management."
          explanation="Cookies are essential to modern web applications. We only use them for the purposes described in this policy."
        />
        <TermsItem
          title="2. Our Legal Basis for Cookies"
          information="Under the ePrivacy Directive and GDPR, we distinguish between:

Strictly Necessary Cookies: Required for the platform to function. These do not require your consent.

Non-Essential Cookies (Analytics, Session Recording): Only placed after you click 'Accept All' on our cookie consent banner. You may withdraw consent at any time by clearing your browser cookies or adjusting your browser settings."
          explanation="We ask for your consent before placing any non-essential cookie. Declining will not prevent you from using the core functionality of the platform."
        />
        <TermsItem
          title="3. Strictly Necessary Cookies"
          information="These cookies are essential and cannot be disabled:

authToken (localStorage)
Purpose: Stores your JWT authentication token to keep you logged in.
Duration: Session / until logout.
First party.

cookieConsent (localStorage)
Purpose: Remembers your cookie consent choice (accepted/declined).
Duration: Persistent (1 year).
First party.

app-language (cookie)
Purpose: Remembers your selected language preference (English, Magyar, Română).
Duration: 365 days.
First party."
        />
        <TermsItem
          title="4. Analytics Cookies (PostHog) — Requires Consent"
          information="We use PostHog to understand how users interact with the platform. PostHog sets the following cookies when you accept analytics cookies:

ph_<project_token>_posthog (localStorage / cookie)
Purpose: Stores your anonymous PostHog distinct ID, session information, and feature flags. Used to track your journey across pages and attribute events to a single anonymous user.
Duration: 1 year.
Third party: PostHog Inc.

posthog-session-replay (localStorage)
Purpose: Enables session recording — capturing mouse movements, clicks, scrolls, and visible page content within the logged-in app. Sensitive fields (passwords, payment inputs) are automatically masked.
Duration: Session.
Third party: PostHog Inc.

Note: PostHog may also store additional localStorage keys prefixed with 'ph_' for feature flag and survey state. These are all subject to consent."
          explanation="Session recordings let us watch anonymised replays of how users interact with the product, helping us find and fix UX issues quickly. No passwords or sensitive information are ever recorded."
        />
        <TermsItem
          title="5. Performance Cookies (Web Vitals) — Requires Consent"
          information="We send Core Web Vitals metrics (LCP, FCP, CLS, TTFB, INP) to PostHog when you accept analytics cookies. These measure your real experience of page load speed and interactivity. No additional cookies are set — this data piggybacks on the PostHog analytics cookie."
        />
        <TermsItem
          title="6. Authentication Cookies (Google OAuth)"
          information="If you choose to sign in with Google, Google may set authentication-related cookies in your browser as part of the OAuth 2.0 flow. These are third-party cookies set by Google and governed by Google's Cookie Policy (https://policies.google.com/technologies/cookies). We do not control these cookies."
        />
        <TermsItem
          title="7. Managing Your Cookie Preferences"
          information="You can manage cookies in the following ways:

Cookie Consent Banner: When you first visit, accept or decline non-essential cookies. Your choice is saved in localStorage under 'cookieConsent'.

Browser Settings: Most browsers allow you to block or delete cookies. Consult your browser's help section:
• Chrome: Settings → Privacy and Security → Cookies
• Firefox: Settings → Privacy & Security → Cookies and Site Data
• Safari: Preferences → Privacy → Manage Website Data
• Edge: Settings → Cookies and site permissions

Opt-Out of PostHog: Visit https://posthog.com/privacy to learn about PostHog's opt-out mechanisms.

Note: Disabling strictly necessary cookies (e.g. authToken) will prevent you from logging in."
        />
        <TermsItem
          title="8. Full Cookie List"
          information="Strictly Necessary:
• authToken — JWT auth session (localStorage, first party)
• cookieConsent — consent record (localStorage, first party, 1 year)
• app-language — language preference (cookie, first party, 365 days)

Analytics & Session Recording (consent required):
• ph_<token>_posthog — PostHog analytics ID (localStorage/cookie, PostHog, 1 year)
• PostHog localStorage keys (ph_*) — feature flags, session state (PostHog, session)

Third-Party (Google OAuth, set by Google):
• Google authentication cookies — governed by Google's policy"
        />
        <TermsItem
          title="9. Data Retention"
          information="Session cookies: Deleted when you close your browser.
Persistent cookies (app-language, cookieConsent): Up to 1 year.
PostHog analytics data: Up to 12 months (events) / 3 months (session recordings).
See our Privacy Policy for full data retention details."
        />
        <TermsItem
          title="10. Updates to This Policy"
          information="We may update this Cookie Policy when we add or remove technologies. The 'Effective Date' at the top will reflect the latest revision. We recommend reviewing this page periodically."
        />
        <TermsItem
          title="11. Contact Us"
          information="For questions about our use of cookies:
Email: info@anladsandleads.com
Website: https://anladsandleads.com/contact"
        />
      </main>
    </div>
  );
};

export default CookiePolicy;
