import React from "react";
import TermsItem from "./TermsItem";

const CookiePolicy = () => {
  return (
    <div className="flex flex-col items-center w-[1000px] m-auto mt-[100px]">
      <h1 className="text-[36px]">Cookie Policy</h1>
      <p>Effective Date: November 7, 2024</p>
      <main className="space-y-4">
        <TermsItem
          title="1. What Are Cookies"
          information="Cookies are small text files that are stored on your device when you visit our website. They help us recognize your device and remember certain information about your visit, such as your preferences and actions on our site."
          explanation="Cookies are essential for the modern web experience, allowing websites to remember user preferences and provide personalized experiences without requiring users to re-enter information repeatedly."
        />
        <TermsItem
          title="2. Types of Cookies We Use"
          information="We use several types of cookies on our website: (1) Essential cookies: Required for basic website functionality. (2) Preference cookies: Remember your settings and preferences. (3) Analytics cookies: Help us understand how visitors interact with our website. (4) Marketing cookies: Used to track visitors across websites to display relevant advertisements."
          explanation="Different cookies serve different purposes. Some are necessary for the website to function properly, while others enhance your experience or help us improve our services based on how you use the site."
        />
        <TermsItem
          title="3. How We Use Cookies"
          information="We use cookies to: (1) Ensure the website functions properly. (2) Remember your preferences and settings. (3) Analyze how you use our website to improve its performance and design. (4) Personalize your experience and deliver content relevant to your interests. (5) Measure the effectiveness of our marketing campaigns."
          explanation="Cookies help us provide a better user experience by remembering your preferences, analyzing site traffic patterns, and enabling personalized features that make navigation more intuitive."
        />
        <TermsItem
          title="4. Third-Party Cookies"
          information="Our website may use cookies from third-party services such as Google Analytics, social media platforms, and advertising networks. These third parties may use cookies, web beacons, and similar technologies to collect information about your use of our website and other websites."
        />
        <TermsItem
          title="5. Your Cookie Choices"
          information="Most web browsers allow you to control cookies through their settings. You can typically delete cookies from your browser history, block cookies entirely, or set preferences for certain websites. However, blocking all cookies may impact your experience and limit certain functionalities of our website."
        />
        <TermsItem
          title="6. Cookie Consent"
          information="When you first visit our website, you will be presented with a cookie consent banner. By clicking 'Accept All,' you consent to the use of all cookies described in this policy. You can also choose to decline non-essential cookies by clicking 'Decline' or adjust your preferences through our cookie settings."
        />
        <TermsItem
          title="7. Data Retention"
          information="Different cookies have different lifespans. Session cookies are temporary and are deleted when you close your browser. Persistent cookies remain on your device for a set period, which can range from days to months, depending on the cookie's purpose."
        />
        <TermsItem
          title="8. Updates to This Policy"
          information="We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically."
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
          information="If you have any questions or concerns about our use of cookies, please contact us at:
          Email: privacy@ourwebsite.com
          Phone: 1-800-123-4567"
        />
      </main>
    </div>
  );
};

export default CookiePolicy;