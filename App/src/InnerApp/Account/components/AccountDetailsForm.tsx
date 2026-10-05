import React from "react";
import { User, Mail, AtSign, Save } from "lucide-react";
import { Button, Card, FormField, Heading } from "@design-system/components";
import { useLanguage } from "../../../hooks/useLanguage";
import type { AccountDetails } from "../useAccount";

export interface AccountDetailsFormProps {
  details: AccountDetails;
  saving: boolean;
  onChange: (field: keyof AccountDetails, value: string) => void;
  onSubmit: () => void;
}

/**
 * Organism: editable account details form.
 */
const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({
  details,
  saving,
  onChange,
  onSubmit,
}) => {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Card padding="lg" as="section">
      <Heading level={2} className="mb-6">
        {t("accountDetails")}
      </Heading>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            label={t("firstName")}
            icon={<User size={18} />}
            value={details.firstname}
            autoComplete="given-name"
            onChange={(e) => onChange("firstname", e.target.value)}
          />
          <FormField
            label={t("lastName")}
            icon={<User size={18} />}
            value={details.lastname}
            autoComplete="family-name"
            onChange={(e) => onChange("lastname", e.target.value)}
          />
          <FormField
            label={t("email")}
            icon={<Mail size={18} />}
            type="email"
            value={details.email}
            autoComplete="email"
            onChange={(e) => onChange("email", e.target.value)}
          />
          <FormField
            label={t("username")}
            icon={<AtSign size={18} />}
            value={details.username}
            autoComplete="username"
            onChange={(e) => onChange("username", e.target.value)}
          />
        </div>

        <Button type="submit" loading={saving} leftIcon={<Save size={18} />}>
          {saving ? t("saving") : t("saveChanges")}
        </Button>
      </form>
    </Card>
  );
};

export default AccountDetailsForm;
