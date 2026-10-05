import React from "react";
import { Key, Info } from "lucide-react";
import { Alert, Button, Card, Heading, PasswordInput } from "@design-system/components";
import { useLanguage } from "../../../hooks/useLanguage";
import type { PasswordFields } from "../useAccount";

export interface PasswordFormProps {
  passwords: PasswordFields;
  isOAuth: boolean;
  saving: boolean;
  onChange: (field: keyof PasswordFields, value: string) => void;
  onSubmit: () => void;
}

/**
 * Organism: change-password form (or an OAuth notice for social-login users).
 */
const PasswordForm: React.FC<PasswordFormProps> = ({
  passwords,
  isOAuth,
  saving,
  onChange,
  onSubmit,
}) => {
  const { t } = useLanguage();

  const mismatch =
    passwords.confirmPassword.length > 0 &&
    passwords.newPassword !== passwords.confirmPassword;

  const canSubmit =
    !saving &&
    !mismatch &&
    passwords.currentPassword.length > 0 &&
    passwords.newPassword.length > 0 &&
    passwords.confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card padding="lg" as="section">
      <Heading level={2} className="mb-6 flex items-center gap-2">
        <Key size={22} className="text-brand dark:text-brand-focus" />
        {t("changePassword")}
      </Heading>

      {isOAuth ? (
        <Alert tone="info" className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 shrink-0" />
          <span>{t("oauthMessage")}</span>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <PasswordInput
            label={t("currentPassword")}
            value={passwords.currentPassword}
            placeholder={t("enterCurrentPassword")}
            autoComplete="current-password"
            onChange={(e) => onChange("currentPassword", e.target.value)}
          />
          <PasswordInput
            label={t("newPassword")}
            value={passwords.newPassword}
            placeholder={t("enterNewPassword")}
            autoComplete="new-password"
            onChange={(e) => onChange("newPassword", e.target.value)}
          />
          <PasswordInput
            label={t("confirmNewPassword")}
            value={passwords.confirmPassword}
            placeholder={t("confirmPassword")}
            autoComplete="new-password"
            error={mismatch ? t("passwordMismatch") : undefined}
            onChange={(e) => onChange("confirmPassword", e.target.value)}
          />

          <Button type="submit" fullWidth loading={saving} disabled={!canSubmit}>
            {saving ? t("updating") : t("updatePassword")}
          </Button>
        </form>
      )}
    </Card>
  );
};

export default PasswordForm;
