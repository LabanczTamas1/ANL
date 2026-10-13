import React, { useMemo } from "react";
import RecipientInput from "./components/RecipientInput";
import LinkModal from "./components/LinkModal";
import { useSendMail, User } from "../hooks/useSendMail";
import { useLanguage } from "../hooks/useLanguage";
import { Alert, Button, Card, Heading } from "@design-system/components";

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

  const fieldRow =
    "flex flex-col sm:flex-row sm:items-center border border-line dark:border-line-dark rounded-lg bg-surface-light dark:bg-surface-elevated px-3 py-2 focus-within:ring-2 focus-within:ring-brand focus-within:border-brand transition-colors";
  const inlineLabel =
    "block text-sm font-semibold text-content dark:text-content-subtle-inverse mb-1 sm:mb-0 sm:mr-2 shrink-0";
  const inlineInput =
    "w-full bg-transparent text-sm text-content dark:text-content-inverse placeholder-content-muted focus:outline-none";

  return (
    <Card as="section" padding="md" className="shadow-card">
      {/* Header */}
      <div className="flex flex-row items-center gap-2 mb-6">
        <svg className="shrink-0 text-content dark:text-content-inverse" width="30" height="30" viewBox="0 0 33 33" fill="none" aria-hidden="true">
          <path d="M5.5 27.5C4.74375 27.5 4.09635 27.2307 3.55781 26.6922C3.01927 26.1536 2.75 25.5063 2.75 24.75V8.25C2.75 7.49375 3.01927 6.84635 3.55781 6.30781C4.09635 5.76927 4.74375 5.5 5.5 5.5H27.5C28.2563 5.5 28.9036 5.76927 29.4422 6.30781C29.9807 6.84635 30.25 7.49375 30.25 8.25V24.75C30.25 25.5063 29.9807 26.1536 29.4422 26.6922C28.9036 27.2307 28.2563 27.5 27.5 27.5H5.5ZM16.5 17.875L5.5 11V24.75H27.5V11L16.5 17.875ZM16.5 15.125L27.5 8.25H5.5L16.5 15.125ZM5.5 11V8.25V24.75V11Z" fill="currentColor" />
        </svg>
        <Heading level={2}>{t('sendMail.title')}</Heading>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient */}
        <div className="relative">
          <div className={fieldRow}>
            <label className={inlineLabel}>{t('sendMail.to')}</label>
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
        <div className={fieldRow}>
          <label className={inlineLabel}>{t('sendMail.subject')}</label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className={inlineInput}
            placeholder={t('sendMail.subjectPlaceholder')}
            required
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-1">
            <label className="block text-sm font-semibold text-content dark:text-content-subtle-inverse">{t('sendMail.body')}</label>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkModal(true)} className="text-brand dark:text-brand-focus hover:bg-brand/10">
              {t('sendMail.addLink')}
            </Button>
          </div>
          <textarea
            ref={textAreaRef}
            name="body"
            value={emailData.body}
            onChange={handleChange}
            onClick={handleTextAreaClick}
            className="w-full p-3 border border-line dark:border-line-dark rounded-lg bg-surface-light dark:bg-surface-elevated text-sm text-content dark:text-content-inverse placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-colors"
            rows={8}
            placeholder={t('sendMail.bodyPlaceholder')}
            required
          />
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? t('sendMail.sending') : t('sendMail.send')}
        </Button>
      </form>

      <LinkModal show={showLinkModal} linkData={linkData} setLinkData={handleLinkChange} onInsert={insertLink} onClose={() => setShowLinkModal(false)} />
    </Card>
  );
};

export default SendMail;
