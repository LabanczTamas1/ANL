import React from "react";
import TermsItem from "./TermsItem";

const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col items-center w-[1000px] m-auto mt-[100px]">
      <h1 className="text-[36px]">Privacy Policy</h1>
      <p>Effective Date: November 7, 2024</p>
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
