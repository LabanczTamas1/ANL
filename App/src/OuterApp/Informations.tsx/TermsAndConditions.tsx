import React from "react";
import TermsItem from "./TermsItem";

const TermsAndConditions = () => {
  return (
    <div className="flex flex-col items-center w-[1000px] m-auto mt-[100px]">
      <h1 className="text-[36px]">Terms And Conditions</h1>
      <p>Effective Date: November 7, 2024</p>
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
