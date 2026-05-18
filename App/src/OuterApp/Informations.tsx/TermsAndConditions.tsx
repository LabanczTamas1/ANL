import React from "react";
import TermsItem from "./TermsItem";

const TermsAndConditions = () => {
  return (
    <div className="flex flex-col items-center max-w-[1000px] w-full mx-auto pt-28 pb-16 px-4 sm:px-6 md:px-8 text-white">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2">Terms and Conditions</h1>
      <p className="text-center text-sm sm:text-base mb-8 text-gray-400">Effective Date: May 18, 2026</p>
      <main className="space-y-4">
        <TermsItem
          title="1. Introduction"
          information="These Terms and Conditions ('Terms') govern your access to and use of the ANL Ads & Leads platform ('the Platform') operated by ANL Ads & Leads ('we', 'us', 'our') at anladsandleads.com. By creating an account or using the Platform, you confirm that you have read, understood, and agreed to these Terms. If you do not agree, do not use the Platform."
          explanation="These Terms form a binding agreement between you and ANL Ads & Leads."
        />
        <TermsItem
          title="2. Eligibility"
          information="You must be at least 16 years of age to use this Platform. By using the Platform, you represent that you meet this requirement. If you are using the Platform on behalf of a business, you represent that you have authority to bind that business to these Terms."
        />
        <TermsItem
          title="3. Account Registration"
          information="To access certain features you must create an account. You agree to:

• Provide accurate, complete, and current information during registration.
• Maintain the confidentiality of your login credentials.
• Notify us immediately of any unauthorised use of your account at info@anladsandleads.com.
• Not share your account with others.

You are responsible for all activity that occurs under your account. We offer Google OAuth as a sign-in option; by using it, you also agree to Google's Terms of Service."
          explanation="Keeping your credentials secure protects both you and the integrity of the platform."
        />
        <TermsItem
          title="4. Acceptable Use"
          information="You agree not to:

• Use the Platform for any unlawful purpose or in violation of applicable laws.
• Attempt to gain unauthorised access to any part of the Platform, its servers, or connected systems.
• Transmit malware, viruses, or malicious code.
• Scrape, crawl, or extract data from the Platform without our written permission.
• Harass, abuse, or harm other users.
• Impersonate any person or entity.
• Use the Platform to send unsolicited bulk communications (spam).
• Reverse-engineer, decompile, or disassemble any part of the Platform."
          explanation="These rules protect all users and the security of the platform."
        />
        <TermsItem
          title="5. Analytics and Session Recording Disclosure"
          information="The Platform uses PostHog, a third-party analytics service, to:

• Track how features are used (event analytics).
• Record your browser session within the logged-in application, including mouse movements, clicks, scrolls, and on-screen content (session replay).
• Measure page performance (Core Web Vitals).

Session recordings help us identify and fix usability issues and bugs. Sensitive inputs (passwords, payment fields) are masked and never captured. Analytics and session recording are activated only upon your explicit consent via the cookie consent banner. You may withdraw consent at any time.

By accepting our cookie policy, you consent to the processing of your usage data and session recordings as described in our Privacy Policy."
          explanation="Transparency about session recording is required by GDPR. We only record sessions to improve the product and only with your prior consent."
        />
        <TermsItem
          title="6. Intellectual Property"
          information="All content, trademarks, logos, design elements, and software on the Platform are owned by or licensed to ANL Ads & Leads. You may not copy, reproduce, distribute, modify, or create derivative works from any part of the Platform without our express written consent. Nothing in these Terms transfers any intellectual property rights to you."
        />
        <TermsItem
          title="7. Privacy and Data Protection"
          information="Your use of the Platform is subject to our Privacy Policy (https://anladsandleads.com/information/privacy-policy) and Cookie Policy (https://anladsandleads.com/information/cookie-policy), both incorporated into these Terms by reference. We process personal data in accordance with the EU General Data Protection Regulation (GDPR) and applicable national data protection laws."
        />
        <TermsItem
          title="8. Meeting Bookings"
          information="The Platform allows you to book meetings with the ANL team. Bookings are subject to availability. We reserve the right to cancel or reschedule bookings with reasonable notice. Booking confirmation emails are transactional communications and are not subject to marketing opt-out."
        />
        <TermsItem
          title="9. Limitation of Liability"
          information="To the maximum extent permitted by law:

• The Platform is provided 'as is' without warranties of any kind, express or implied.
• We do not warrant that the Platform will be error-free, uninterrupted, or free from security vulnerabilities.
• We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Platform.
• Our total liability to you for any claim arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim, or €100, whichever is greater.

Nothing in these Terms excludes liability for death or personal injury caused by negligence, or for fraud or fraudulent misrepresentation."
        />
        <TermsItem
          title="10. Termination"
          information="We may suspend or terminate your account and access to the Platform at any time, with or without notice, if you violate these Terms or if we have reason to believe your account poses a security risk. You may close your account at any time by contacting us at info@anladsandleads.com. Upon termination, your right to use the Platform ceases immediately."
        />
        <TermsItem
          title="11. Changes to These Terms"
          information="We may update these Terms from time to time. We will update the 'Effective Date' above and, for material changes, notify you by email or via a notice on the Platform. Your continued use of the Platform after the effective date of any revision constitutes your acceptance of the updated Terms."
        />
        <TermsItem
          title="12. Governing Law and Disputes"
          information="These Terms are governed by the laws of Hungary. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of the competent courts of Hungary. If you are a consumer in the EEA, you also retain any mandatory protections provided by the laws of your country of residence."
        />
        <TermsItem
          title="13. Contact Information"
          information="If you have questions about these Terms, please contact us:

Email: info@anladsandleads.com
Website: https://anladsandleads.com/contact"
        />
      </main>
    </div>
  );
};

export default TermsAndConditions;
      <main className="space-y-4">
        <TermsItem
          title="1. Introduction"
          information="These Terms and Conditions govern your use of our website and services. By accessing or using our platform, you agree to comply with these terms."
          explanation="Understanding our terms ensures a safe and transparent experience for all users, outlining rights and responsibilities while using our services."
        />
        <TermsItem
          title="2. User Responsibilities"
          information="Users must provide accurate information, comply with applicable laws, and refrain from engaging in harmful or fraudulent activities on our platform."
          explanation="Ensuring compliance with these rules helps maintain a trustworthy and secure environment for all users."
        />
        <TermsItem
          title="3. Account Registration"
          information="To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your login credentials."
          explanation="Protecting your account details helps prevent unauthorized access and ensures your personal data remains secure."
        />
        <TermsItem
          title="4. Prohibited Activities"
          information="Users must not engage in hacking, spamming, harassment, or other activities that violate legal and ethical guidelines."
          explanation="Maintaining a respectful and lawful platform benefits all users and protects the integrity of our services."
        />
        <TermsItem
          title="5. Intellectual Property"
          information="All content, trademarks, and materials on this website are owned by or licensed to us. Unauthorized use, reproduction, or distribution is prohibited."
          explanation="Respecting intellectual property rights ensures fairness and legal compliance for all parties involved."
        />
        <TermsItem
          title="6. Limitation of Liability"
          information="We are not responsible for any indirect, incidental, or consequential damages resulting from your use of our services."
          explanation="Understanding liability limitations helps users set realistic expectations regarding our responsibilities."
        />
        <TermsItem
          title="7. Termination of Access"
          information="We reserve the right to suspend or terminate your access if you violate these terms or engage in harmful activities."
          explanation="Enforcing access restrictions protects our platform and its users from malicious behavior."
        />
        <TermsItem
          title="8. Privacy Policy"
          information="Your use of our services is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal data."
          explanation="Reviewing our Privacy Policy helps you understand how we handle your information responsibly."
        />
        <TermsItem
          title="9. Modifications to Terms"
          information="We may update these Terms and Conditions periodically. Continued use of our services after modifications constitutes acceptance of the revised terms."
          explanation="Staying informed about updates ensures compliance with the latest terms and policies."
        />
        <TermsItem
          title="10. Contact Information"
          information="If you have any questions regarding these Terms and Conditions, please contact us at:
          Email: support@ourwebsite.com
          Phone: 1-800-123-4567"
        />
      </main>
    </div>
  );
};

export default TermsAndConditions;
