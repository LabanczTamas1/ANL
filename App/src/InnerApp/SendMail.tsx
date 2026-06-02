import React, { useMemo } from "react";
import RecipientInput from "./components/RecipientInput";
import LinkModal from "./components/LinkModal";
import { useSendMail, User } from "../hooks/useSendMail";
import { useLanguage } from "../hooks/useLanguage";

const SendMail: React.FC = () => {
  const isOwner = true;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");
  const { t } = useLanguage();

  // Memoize companyMail to prevent infinite fetch loop
  const companyMail: User = useMemo(() => ({
    email: "deid.unideb@gmail.com",
    username: "Ads and Leads"
  }), []);

  const {
    emailData, recipientInput, showDropdown, filteredUsers, isSubmitting, error,
    showLinkModal, linkData, textAreaRef,
    handleChange, handleRecipientInputChange, handleSelectUser, handleFocus,
    handleTextAreaClick, handleLinkChange, insertLink, setShowLinkModal, handleSubmit,
  } = useSendMail(isOwner, companyMail, API_BASE_URL, token);

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-4 sm:p-6 rounded-md shadow-md">
      {/* Header */}
      <div className="flex flex-row items-center mb-4 sm:mb-6">
        <svg className="mt-2 shrink-0 text-gray-900 dark:text-white" width="33" height="33" viewBox="0 0 33 33" fill="none">
          <path d="M5.5 27.5C4.74375 27.5 4.09635 27.2307 3.55781 26.6922C3.01927 26.1536 2.75 25.5063 2.75 24.75V8.25C2.75 7.49375 3.01927 6.84635 3.55781 6.30781C4.09635 5.76927 4.74375 5.5 5.5 5.5H27.5C28.2563 5.5 28.9036 5.76927 29.4422 6.30781C29.9807 6.84635 30.25 7.49375 30.25 8.25V24.75C30.25 25.5063 29.9807 26.1536 29.4422 26.6922C28.9036 27.2307 28.2563 27.5 27.5 27.5H5.5ZM16.5 17.875L5.5 11V24.75H27.5V11L16.5 17.875ZM16.5 15.125L27.5 8.25H5.5L16.5 15.125ZM5.5 11V8.25V24.75V11Z" fill="currentColor" />
        </svg>
        <h2 className="font-bold text-2xl sm:text-4xl pl-2 text-gray-900 dark:text-white">{t('sendMail.title')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2a2a2a]">
            <label className="block font-bold text-gray-900 dark:text-gray-200 px-2 py-1 sm:py-2 sm:mr-2 shrink-0">{t('sendMail.to')}</label>
            <RecipientInput
              isOwner={isOwner}
              recipientInput={recipientInput}
              showDropdown={showDropdown}
              filteredUsers={filteredUsers}
              companyMail={companyMail}
              onChange={handleRecipientInputChange}
              onSelectUser={handleSelectUser}
              onFocus={handleFocus}
            />
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col sm:flex-row sm:items-center border border-gray-300 dark:border-gray-700 rounded-md p-2 bg-white dark:bg-[#2a2a2a]">
          <label className="block font-bold text-gray-900 dark:text-gray-200 mb-1 sm:mb-0 sm:mr-2 shrink-0">{t('sendMail.subject')}</label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className="w-full pl-1 rounded-sm bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('sendMail.subjectPlaceholder')}
            required
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('sendMail.body')}</label>
            <button type="button" onClick={() => setShowLinkModal(true)} className="flex items-center px-3 py-1 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] border border-gray-300 dark:border-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300 w-fit">
              {t('sendMail.addLink')}
            </button>
          </div>
          <textarea
            ref={textAreaRef}
            name="body"
            value={emailData.body}
            onChange={handleChange}
            onClick={handleTextAreaClick}
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            required
          />
        </div>

        {error && <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>}
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-semibold rounded-md transition-colors ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#65558F] hover:bg-opacity-90"}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? t('sendMail.sending') : t('sendMail.send')}
        </button>
      </form>

      <LinkModal show={showLinkModal} linkData={linkData} setLinkData={handleLinkChange} onInsert={insertLink} onClose={() => setShowLinkModal(false)} />
    </div>
  );
};

export default SendMail;
