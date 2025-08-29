import React from "react";
import TermsItem from "./TermsItem";

const CookiePolicy = () => {
  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto mt-12 px-4 sm:px-6 md:px-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">
        Cookie Policy
      </h1>
      <p className="text-center text-sm sm:text-base mb-8">
        Effective Date: November 7, 2024
      </p>
      <main className="space-y-6">
        <TermsItem
          title="1. What Are Cookies"
          information="Cookies are small text files that are stored on your device when you visit our website. They help us recognize your device and remember certain information about your visit, such as your preferences and actions on our site."
          explanation="Cookies are essential for the modern web experience, allowing websites to remember user preferences and provide personalized experiences without requiring users to re-enter information repeatedly."
        />
        <TermsItem
          title="2. Types of Cookies We Use"
          information="We use several types of cookies on our website: Essential cookies, Preference cookies, Analytics cookies, Marketing cookies."
          explanation="Different cookies serve different purposes. Some are necessary for the website to function properly, while others enhance your experience or help us improve our services based on how you use the site."
        />
        <TermsItem
          title="3. How We Use Cookies"
          information="We use cookies to ensure proper website functionality, remember preferences, analyze usage, personalize content, and measure marketing effectiveness."
          explanation="Cookies help us provide a better user experience by remembering your preferences, analyzing site traffic patterns, and enabling personalized features."
        />
        <TermsItem
          title="4. Third-Party Cookies"
          information="Our website may use cookies from third-party services such as Google Analytics, social media platforms, and advertising networks."
        />
        <TermsItem
          title="5. Your Cookie Choices"
          information="Most web browsers allow you to control cookies through their settings. Blocking all cookies may limit website functionality."
        />
        <TermsItem
          title="6. Cookie Consent"
          information="When you first visit our website, you will see a cookie consent banner. Accepting or declining sets your cookie preferences."
        />
        <TermsItem
          title="7. Data Retention"
          information="Session cookies are temporary, deleted when you close your browser. Persistent cookies remain for a set period depending on their purpose."
        />
        <TermsItem
          title="8. Updates to This Policy"
          information="We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated effective date."
        />
        <TermsItem
          title="9. Cookie List"
          information="Essential Cookies: _session, auth_token, csrf_token
Preference Cookies: theme_preference, language_setting, display_mode
Analytics Cookies: _ga, _gid, _gat (Google Analytics)
Marketing Cookies: _fbp (Facebook), _pin_unauth (Pinterest)"
        />
        <TermsItem
          title="10. Contact Us"
          information="If you have any questions about our use of cookies, contact us at: Email: privacy@ourwebsite.com Phone: 1-800-123-4567"
        />
      </main>
    </div>
  );
};

export default CookiePolicy;
