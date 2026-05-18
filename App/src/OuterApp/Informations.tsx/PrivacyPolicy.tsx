import React from "react";
import TermsItem from "./TermsItem";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto pt-28 pb-16 px-4 sm:px-6 md:px-8 text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">Privacy Policy</h1>
      <p className="text-center text-sm sm:text-base mb-8 text-gray-400">Effective Date: May 18, 2026</p>
      <main className="space-y-4">
        <TermsItem
          title="1. Who We Are (Data Controller)"
          information="ANL Ads & Leads ('we', 'us', 'our') operates the website anladsandleads.com and the associated web application. We are the data controller for all personal data collected through this platform. For any privacy-related inquiries, contact us at: info@anladsandleads.com"
          explanation="As the data controller, we determine the purposes and means of processing your personal data and are responsible for ensuring it is handled in accordance with applicable law, including the EU General Data Protection Regulation (GDPR)."
        />
        <TermsItem
          title="2. What Personal Data We Collect"
          information="We collect the following categories of personal data:

Account Information: Name, email address, profile information, and authentication data (including data received via Google OAuth when you sign in with Google).

Usage Data: Pages visited, features used, buttons clicked, session duration, referrer URLs, and navigation paths within the application.

Session Recordings: We record your browser sessions within the logged-in application. This includes mouse movements, clicks, scrolls, keyboard input (excluding passwords and sensitive form fields which are masked), and on-screen content visible during your session.

Technical Data: IP address, browser type and version, operating system, screen resolution, device type, and timezone.

Performance Metrics: Core Web Vitals (LCP, FCP, CLS, TTFB, INP) to measure application performance.

Communication Data: Any messages or information you submit via the contact form or email."
          explanation="We collect only the data necessary to provide and improve our services. Session recordings help us diagnose usability issues, identify bugs, and understand how users interact with the application."
        />
        <TermsItem
          title="3. Legal Basis for Processing (GDPR Article 6)"
          information="We process your personal data under the following legal bases:

Contractual Necessity (Art. 6(1)(b)): Processing your account information and authentication data to provide the services you signed up for.

Consent (Art. 6(1)(a)): Analytics, session recordings, and non-essential cookies are processed only after you provide explicit consent via our cookie consent banner. You may withdraw consent at any time.

Legitimate Interests (Art. 6(1)(f)): Basic security monitoring and fraud prevention, where our interests do not override your fundamental rights.

Legal Obligation (Art. 6(1)(c)): Where required by applicable law."
          explanation="GDPR requires us to have a valid legal basis for every type of data processing. Consent-based processing means you can always opt out."
        />
        <TermsItem
          title="4. Analytics and Session Recording (PostHog)"
          information="We use PostHog (posthog.com), an analytics platform, to:

• Track user interactions and feature usage (event analytics)
• Record browser sessions (session replay) — capturing mouse movements, clicks, scrolls, and visible page content
• Measure Core Web Vitals and application performance
• Understand user journeys and diagnose issues

PostHog processes data on our behalf as a data processor under a Data Processing Agreement. Session recordings are stored on PostHog's infrastructure. Sensitive input fields (passwords, payment fields) are automatically masked and never captured.

PostHog's privacy policy: https://posthog.com/privacy

Data collected by PostHog: session identifiers, device/browser info, interaction events, and a recording of the session. PostHog may set cookies prefixed with 'ph_' or 'posthog-' in your browser."
          explanation="Session recordings are one of the most effective tools for understanding real user behaviour and fixing UX issues. No financial or sensitive personal information is captured in recordings."
        />
        <TermsItem
          title="5. Google OAuth"
          information="If you choose to sign in using Google, we receive from Google your name, email address, and profile picture as permitted by Google's OAuth scope. We do not receive your Google password. Your use of Google Sign-In is also subject to Google's Privacy Policy (https://policies.google.com/privacy). We store only the minimum information needed to create and maintain your account."
        />
        <TermsItem
          title="6. How We Use Your Data"
          information="We use your personal data to:

• Provide, maintain, and improve the platform
• Authenticate your identity and manage your account
• Analyse usage patterns to improve user experience
• Replay sessions to identify and fix bugs and usability issues
• Monitor application performance and resolve technical issues
• Send transactional emails (e.g. booking confirmations, password reset)
• Respond to your inquiries and support requests
• Comply with legal obligations"
        />
        <TermsItem
          title="7. Data Retention"
          information="Account data: Retained for as long as your account is active. Deleted within 30 days of account deletion request.

Analytics events: Retained for up to 12 months by PostHog, after which they are aggregated or deleted.

Session recordings: Retained for up to 3 months on PostHog's infrastructure.

Application logs: Retained for up to 90 days via Seq (our structured logging platform, running internally).

Contact form submissions: Retained for up to 2 years for correspondence purposes."
          explanation="We keep data only as long as necessary for the purpose it was collected, or as required by law."
        />
        <TermsItem
          title="8. Third-Party Processors"
          information="We share data with the following third-party processors, each bound by a Data Processing Agreement:

PostHog Inc. — Analytics and session recording (EU Cloud or US, subject to Standard Contractual Clauses)
Google LLC — Authentication (Google OAuth), Google Meet
Hetzner Online GmbH — Cloud hosting infrastructure (EU, Germany)
PostgreSQL database, Redis — Running on our Hetzner VPS; data does not leave our server except as described above.

We do not sell your personal data to third parties."
        />
        <TermsItem
          title="9. Your Rights Under GDPR"
          information="If you are located in the EEA, UK, or Switzerland, you have the following rights:

Right of Access (Art. 15): Request a copy of the personal data we hold about you.
Right to Rectification (Art. 16): Correct inaccurate or incomplete data.
Right to Erasure (Art. 17): Request deletion of your data ('right to be forgotten').
Right to Restriction (Art. 18): Restrict how we process your data.
Right to Data Portability (Art. 20): Receive your data in a machine-readable format.
Right to Object (Art. 21): Object to processing based on legitimate interests.
Right to Withdraw Consent: Withdraw analytics/recording consent at any time via your browser cookie settings.

To exercise any of these rights, email us at: info@anladsandleads.com. We will respond within 30 days. You also have the right to lodge a complaint with your local data protection authority."
          explanation="GDPR gives EEA residents strong rights over their personal data. We take these obligations seriously."
        />
        <TermsItem
          title="10. Cookies"
          information="We use cookies and similar technologies. For a full breakdown of the cookies we use, including PostHog cookies and session recording identifiers, please see our Cookie Policy."
        />
        <TermsItem
          title="11. Security"
          information="We implement appropriate technical and organisational measures to protect your personal data, including HTTPS/TLS encryption in transit (via Caddy), hashed passwords, JWT-based authentication, and access controls on our infrastructure. However, no internet transmission is completely secure."
        />
        <TermsItem
          title="12. Changes to This Policy"
          information="We may update this Privacy Policy periodically. We will notify you of material changes by updating the 'Effective Date' at the top of this page. Continued use of the platform after changes constitutes acceptance of the updated policy."
        />
        <TermsItem
          title="13. Contact Us"
          information="For any questions, requests, or concerns about this Privacy Policy or how we handle your data:

Email: info@anladsandleads.com
Website: https://anladsandleads.com/contact"
        />
      </main>
    </div>
  );
};

export default PrivacyPolicy;
      <main className="space-y-4">
      <TermsItem
          title="1. Introduction"
          information="By using our services, you acknowledge and agree to these Terms and Conditions, as well as our Privacy Policy and any applicable guidelines. These terms govern your use of the website and any related services."
          explanation="Users are responsible for providing accurate information, maintaining the security of their accounts, and using the website responsibly. They must follow all laws and avoid engaging in harmful activities."
        />
        <TermsItem
          title="2. Acceptance of Terms"
          information="You agree to provide accurate and truthful information when using our website. You are responsible for maintaining the confidentiality of your account, username, and password. You agree to use the website only for lawful purposes and in compliance with all applicable local, state, and federal laws. You must not use the website in any manner that could harm, disable, or interfere with the website’s functionality or other users’ access."
          explanation="Users are responsible for providing accurate information, maintaining the security of their accounts, and using the website responsibly. They must follow all laws and avoid engaging in harmful activities."
        />
        <TermsItem
          title="3. User Responsibilities"
          information="You agree to provide accurate and truthful information when using our website. You are responsible for maintaining the confidentiality of your account, username, and password. You agree to use the website only for lawful purposes and in compliance with all applicable local, state, and federal laws. You must not use the website in any manner that could harm, disable, or interfere with the website’s functionality or other users’ access."
          explanation="Users are responsible for providing accurate information, maintaining the security of their accounts, and using the website responsibly. They must follow all laws and avoid engaging in harmful activities."
        />
        <TermsItem
          title="4. Privacy Policy"
          information="We are committed to protecting your privacy. Our Privacy Policy explains how we collect, use, and share your personal information. By using our website, you consent to the practices described in the Privacy Policy."
        />
        <TermsItem
          title="5. Intellectual Property"
          information="All content on this website, including but not limited to text, images, logos, and videos, is owned by the website owner or its licensors and is protected by copyright laws. You may not use any of the content for commercial purposes without explicit permission."
        />
        <TermsItem
          title="6. Limitation of Liability"
          information="The website and services are provided “as is,” without any warranties or guarantees of any kind. We are not liable for any damages, losses, or inconveniences resulting from the use or inability to use our services."
        />
        <TermsItem
          title="7. Termination"
          information="We may suspend or terminate your access to our services at any time if you violate these terms or engage in illegal activity."
        />
        <TermsItem
          title="8. Modifications to Terms"
          information="We reserve the right to modify or update these Terms and Conditions at any time. Any changes will be posted on this page, and the effective date will be updated accordingly. It is your responsibility to review these terms periodically."
        />
        <TermsItem
          title="9. Governing Law"
          information="These terms are governed by the laws of the jurisdiction in which we operate. Any disputes will be resolved in the courts of that jurisdiction."
        />
        <TermsItem
          title="10. Contact Us"
          information="If you have any questions or concerns about these terms, please contact us at:
          Email: support@ourwebsite.com
          Phone: 1-800-123-4567"
        />
      </main>
    </div>
  );
};

export default PrivacyPolicy;
