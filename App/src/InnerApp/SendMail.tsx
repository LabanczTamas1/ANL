import React, { useState, useEffect, useRef } from "react";

interface EmailData {
  subject: string;
  recipient: string;
  body: string;
  name: string;
}

interface User {
  email: string;
  username: string;
}

interface LinkData {
  url: string;
  text: string;
}

const SendMail: React.FC = () => {
  // Mock user data - this would normally come from an API

  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    recipient: "",
    body: "",
    name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientInput, setRecipientInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState<User[]>([]);  // Initialize with empty array instead of undefined
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);  // Initialize with empty array
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOwner = true; // This would be determined by user role check
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const token = localStorage.getItem("authToken");
  const companyMail: User = {email: "deid.unideb@gmail.com", username: "Ads and Leads"}

  useEffect(() => {
    // Function to fetch admin emails
    const fetchAdminEmails = async (): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/emails`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        
        console.log('Admin emails:', data.emails);
        const userObjects = data.emails.map((item: any) => ({
          email: item.email,
          username: item.username,
          // Add any other properties you need
        }));
        // Store just the fetched users in users state (without companyMail)
        setUsers(userObjects);
        // Set filteredUsers with companyMail and all fetched users
        setFilteredUsers([companyMail, ...userObjects]);
      } catch (error) {
        console.error('Failed to fetch admin emails:', error);
      }
    };
  
    fetchAdminEmails();
  }, [token]);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState<LinkData>({
    url: "",
    text: "",
  });
  const modalRef = useRef<HTMLDivElement>(null);

  // Text area ref to handle cursor position
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  // Retrieve the JWT token and name from localStorage
  
  const name = localStorage.getItem("name");

  useEffect(() => {
    // Set the name from localStorage if available
    if (name) {
      setEmailData(prev => ({ ...prev, name }));
    }

    // Add click event listener to close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowLinkModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [name]);

  // Update filtered users when input changes
  useEffect(() => {
    if (recipientInput && users.length > 0) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(recipientInput.toLowerCase()) || 
        user.username.toLowerCase().includes(recipientInput.toLowerCase())
      );
      // Always ensure companyMail is included at the beginning of filtered results
      setFilteredUsers([companyMail, ...filtered]);
    } else if (users.length > 0) {
      // If no input but we have users, show companyMail and all users
      setFilteredUsers([companyMail, ...users]);
    } else {
      // Even if there are no other users, always include companyMail
      setFilteredUsers([companyMail]);
    }
  }, [recipientInput, users, companyMail]);
  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "body" && textAreaRef.current) {
      setCursorPosition(textAreaRef.current.selectionStart);
    }
    
    setEmailData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleRecipientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientInput(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectUser = (user: User) => {
    setEmailData(prevData => ({
      ...prevData,
      recipient: user.email,
    }));
    setRecipientInput(`${user.email}`);
    setShowDropdown(false);
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  // Track cursor position on text area click
  const handleTextAreaClick = () => {
    if (textAreaRef.current) {
      setCursorPosition(textAreaRef.current.selectionStart);
    }
  };

  // Handle link data changes
  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinkData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open link insertion modal
  const handleAddLink = () => {
    setLinkData({ url: "", text: "" });
    setShowLinkModal(true);
  };

  // Insert link at cursor position or at the end
  const insertLink = () => {
    if (!linkData.url) {
      return;
    }

    // Format the link with the text or use the URL as text if none provided
    const linkText = linkData.text || linkData.url;
    const formattedLink = `[${linkText}](${linkData.url})`;
    
    // Get the current body text
    let currentBody = emailData.body;
    
    // If we have a cursor position, insert at that position, otherwise append to the end
    if (cursorPosition !== null) {
      currentBody = 
        currentBody.substring(0, cursorPosition) + 
        formattedLink + 
        currentBody.substring(cursorPosition);
    } else {
      // If no cursor position, add to the end with a newline if needed
      if (currentBody && !currentBody.endsWith('\n') && !currentBody.endsWith(' ')) {
        currentBody += ' ';
      }
      currentBody += formattedLink;
    }
    
    // Update the email body
    setEmailData(prev => ({
      ...prev,
      body: currentBody,
    }));
    
    // Close the modal
    setShowLinkModal(false);
    
    // Focus back on the textarea and update cursor position after the inserted link
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPosition = cursorPosition !== null ? cursorPosition + formattedLink.length : currentBody.length;
        textAreaRef.current.setSelectionRange(newPosition, newPosition);
        setCursorPosition(newPosition);
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Reset previous error

    if (!token) {
      setError("Authentication token is missing.");
      setIsSubmitting(false);
      return;
    }

    // Make sure to use the recipient from the input field if we're in owner mode
    const submissionData = {
      ...emailData,
      recipient: isOwner ? recipientInput : emailData.recipient
    };

    try {
      // Using the configured API base URL
      const response = await fetch(`${API_BASE_URL}/api/save-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        alert("Email saved successfully!");
        setEmailData({ subject: "", recipient: "", body: "", name: "" });
        setRecipientInput("");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save the email. Please try again.");
      }
    } catch (error) {
      console.error("Error saving email:", error);
      setError("An error occurred while saving the email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <div className="flex flex-row items-center mb-6">
        <svg
          className="mt-2"
          width="33"
          height="33"
          viewBox="0 0 33 33"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 27.5C4.74375 27.5 4.09635 27.2307 3.55781 26.6922C3.01927 26.1536 2.75 25.5063 2.75 24.75V8.25C2.75 7.49375 3.01927 6.84635 3.55781 6.30781C4.09635 5.76927 4.74375 5.5 5.5 5.5H27.5C28.2563 5.5 28.9036 5.76927 29.4422 6.30781C29.9807 6.84635 30.25 7.49375 30.25 8.25V24.75C30.25 25.5063 29.9807 26.1536 29.4422 26.6922C28.9036 27.2307 28.2563 27.5 27.5 27.5H5.5ZM16.5 17.875L5.5 11V24.75H27.5V11L16.5 17.875ZM16.5 15.125L27.5 8.25H5.5L16.5 15.125ZM5.5 11V8.25V24.75V11Z"
            fill="#1D1B20"
          />
        </svg>
        <h2 className="font-bold text-4xl pl-2">Send Mail</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="flex flex-row justify-center items-center border border-gray-300 rounded-md">
            <label htmlFor="recipient" className="block font-bold text-black mr-2 p-2">
              To:
            </label>
            {isOwner ? (
              <div className="relative w-full">
                <input
                  type="text"
                  id="recipient"
                  value={recipientInput}
                  onChange={handleRecipientInputChange}
                  onFocus={handleFocus}
                  className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search by email or username"
                  autoComplete="off"
                />
                {showDropdown && (
                  <div 
                    ref={dropdownRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                  >
                    {filteredUsers.length > 0 ? (
  filteredUsers.map((user, index) => (
    <div
      key={index}
      className={`p-2 hover:bg-gray-100 cursor-pointer flex justify-between ${
        user.email === companyMail.email ? 'bg-[#EDEBFA] border-l-4 border-[#65558F]' : ''
      }`}
      onClick={() => handleSelectUser(user)}
    >
      <span className={`${user.email === companyMail.email ? 'font-semibold text-[#65558F]' : 'text-gray-800'}`}>
        {user.email}
      </span>
      <span className={`${user.email === companyMail.email ? 'text-[#65558F]' : 'text-gray-600'}`}>
        {user.username}
      </span>
    </div>
  ))
) : (
  <div className="p-2 text-gray-500">No matching users found</div>
)}
                  </div>
                )}
              </div>
            ) : (
              <input
                type="email"
                id="recipient"
                name="recipient"
                value={emailData.recipient}
                onChange={handleChange}
                className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter recipient's email"
                required
              />
            )}
          </div>
        </div>
        <div className="flex flex-row justify-center items-center border border-gray-300 rounded-md p-2">
          <label htmlFor="subject" className="block font-bold text-black mr-2">
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter subject"
            required
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Email Body
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddLink}
                className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
                  />
                </svg>
                Add Link
              </button>
            </div>
          </div>
          <textarea
            ref={textAreaRef}
            id="body"
            name="body"
            value={emailData.body}
            onChange={handleChange}
            onClick={handleTextAreaClick}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your email here"
            rows={8}
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-semibold rounded-md ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#65558F] hover:bg-blue-600"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Email"}
        </button>
      </form>

      {/* Link insertion modal */}
      {/* Link insertion modal */}
{showLinkModal && (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
    <div
      ref={modalRef}
      className="relative bg-white p-4 rounded-md shadow-lg w-full max-w-md"
    >
      <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
      <button
    type="button"
    onClick={() => {
      setLinkData({
        url: "http://localhost:5173/onboarding",
        text: "Onboarding",
      });
    }}
    className="absolute top-4 right-4 flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md text-sm"
  >
    Onboarding Link
  </button>
      <div className="space-y-3">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={linkData.url}
            onChange={handleLinkChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-1">
            Display Text (optional)
          </label>
          <input
            type="text"
            id="text"
            name="text"
            value={linkData.text}
            onChange={handleLinkChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Click here"
          />
        </div>
        {/* Auto-fill onboarding link button */}
        <div>
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={() => setShowLinkModal(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={insertLink}
            className="px-4 py-2 bg-[#65558F] hover:bg-blue-600 rounded-md text-white"
            disabled={!linkData.url}
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SendMail;