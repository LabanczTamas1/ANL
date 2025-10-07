import React from "react";
import { User } from "../../Types/types";

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
  return isOwner ? (
    <div className="relative w-full">
      <input
        type="text"
        value={recipientInput}
        onChange={onChange}
        onFocus={onFocus}
        className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search by email or username"
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredUsers.map((user, index) => (
            <div
              key={index}
              className={`p-2 hover:bg-gray-100 cursor-pointer flex justify-between ${
                user.email === companyMail.email ? "bg-[#EDEBFA] border-l-4 border-[#65558F]" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <span className={user.email === companyMail.email ? "font-semibold text-[#65558F]" : "text-gray-800"}>
                {user.email}
              </span>
              <span className={user.email === companyMail.email ? "text-[#65558F]" : "text-gray-600"}>
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
      className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter recipient's email"
      required
    />
  );
};

export default RecipientInput;
