import React, { useEffect } from "react";
import { Alert, Spinner } from "@design-system/components";
import { useLanguage } from "../../hooks/useLanguage";
import { useAccount } from "./useAccount";
import ProfileHeader from "./components/ProfileHeader";
import AccountDetailsForm from "./components/AccountDetailsForm";
import PasswordForm from "./components/PasswordForm";

/**
 * Account page — composes profile header, account-details form and
 * change-password form from atomic design-system components.
 */
const Account: React.FC = () => {
  const { t } = useLanguage();
  const {
    details,
    passwords,
    isOAuth,
    initialLoading,
    savingDetails,
    savingPassword,
    success,
    error,
    updateDetail,
    updatePassword,
    saveDetails,
    changePassword,
    dismissMessages,
  } = useAccount();

  // Auto-dismiss feedback after a short delay.
  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(dismissMessages, 5000);
    return () => clearTimeout(timer);
  }, [success, error, dismissMessages]);

  if (initialLoading) {
    return (
      <div className="flex h-full items-center justify-center py-24 text-brand">
        <Spinner size="xl" label={t("saving")} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <ProfileHeader
        firstName={details.firstname}
        lastName={details.lastname}
        subtitle={t("manageAccount")}
      />

      {(success || error) && (
        <div className="mt-6" role="status">
          <Alert tone={error ? "error" : "success"}>{error || success}</Alert>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        <AccountDetailsForm
          details={details}
          saving={savingDetails}
          onChange={updateDetail}
          onSubmit={saveDetails}
        />
        <PasswordForm
          passwords={passwords}
          isOAuth={isOAuth}
          saving={savingPassword}
          onChange={updatePassword}
          onSubmit={changePassword}
        />
      </div>
    </div>
  );
};

export default Account;
