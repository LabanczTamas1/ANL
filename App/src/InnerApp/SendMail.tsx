import React, { useMemo } from "react";
import RecipientInput from "./components/RecipientInput";
import LinkModal from "./components/LinkModal";
import { useSendMail, User } from "../hooks/useSendMail";

const SendMail: React.FC = () => {
  const isOwner = true;
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");

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
    <div className="bg-white p-6 rounded-md shadow-md">
      {/* Header */}
      <div className="flex flex-row items-center mb-6">
        <svg className="mt-2" width="33" height="33" viewBox="0 0 33 33" fill="none">
          {/* SVG PATH */}
        </svg>
        <h2 className="font-bold text-4xl pl-2">Send Mail</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex flex-row justify-center items-center border border-gray-300 rounded-md">
            <label className="block font-bold text-black mr-2 p-2">To:</label>
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
        <div className="flex flex-row justify-center items-center border border-gray-300 rounded-md p-2">
          <label className="block font-bold text-black mr-2">Subject:</label>
          <input
            type="text"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subject"
            required
          />
        </div>

        {/* Body */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">Email Body</label>
            <button type="button" onClick={() => setShowLinkModal(true)} className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm">
              Add Link
            </button>
          </div>
          <textarea
            ref={textAreaRef}
            name="body"
            value={emailData.body}
            onChange={handleChange}
            onClick={handleTextAreaClick}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={8}
            required
          />
        </div>

        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-semibold rounded-md ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#65558F] hover:bg-blue-600"}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Email"}
        </button>
      </form>

      <LinkModal show={showLinkModal} linkData={linkData} setLinkData={handleLinkChange} onInsert={insertLink} onClose={() => setShowLinkModal(false)} />
    </div>
  );
};

export default SendMail;
