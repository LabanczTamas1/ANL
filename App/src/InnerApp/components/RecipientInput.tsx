import React from "react";
import { User } from "../../Types/types";
import { useLanguage } from "../../hooks/useLanguage";

interface Props {
  isOwner: boolean;
  recipientInput: string;
  showDropdown: boolean;
  filteredUsers: User[];
  companyMail: User;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectUser: (user: User) => void;
  onFocus: () => void;
}

const RecipientInput: React.FC<Props> = ({
  isOwner,
  recipientInput,
  showDropdown,
  filteredUsers,
  companyMail,
  onChange,
  onSelectUser,
  onFocus,
}) => {
  const { t } = useLanguage();
  return isOwner ? (
    <div className="relative w-full">
      <input
        type="text"
        value={recipientInput}
        onChange={onChange}
        onFocus={onFocus}
        className="w-full pl-1 rounded-sm bg-transparent text-content dark:text-content-inverse placeholder-content-muted focus:outline-none"
        placeholder={t("recipient.searchPlaceholder")}
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-dropdown w-full mt-1 bg-surface-light dark:bg-surface-elevated border border-line dark:border-line-dark rounded-xl shadow-elevated max-h-60 overflow-auto">
          {filteredUsers.map((user, index) => (
            <div
              key={index}
              className={`p-2 hover:bg-brand/5 dark:hover:bg-brand/20 cursor-pointer flex justify-between transition-colors ${
                user.email === companyMail.email ? "bg-brand/10 dark:bg-brand/20 border-l-4 border-brand" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <span className={user.email === companyMail.email ? "font-semibold text-brand dark:text-brand-focus" : "text-content dark:text-content-subtle-inverse"}>
                {user.email}
              </span>
              <span className={user.email === companyMail.email ? "text-brand dark:text-brand-focus" : "text-content-muted"}>
                {user.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  ) : (
    <input
      type="email"
      value={recipientInput}
      onChange={onChange}
      className="w-full pl-1 rounded-sm bg-transparent text-content dark:text-content-inverse placeholder-content-muted focus:outline-none"
      placeholder={t("recipient.emailPlaceholder")}
      required
    />
  );
};

export default RecipientInput;
