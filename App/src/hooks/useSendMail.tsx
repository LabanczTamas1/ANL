import { useState, useEffect, useRef } from "react";

export interface EmailData {
  subject: string;
  recipient: string;
  body: string;
  name: string;
}

export interface User {
  email: string;
  username: string;
}

export interface LinkData {
  url: string;
  text: string;
}

export const useSendMail = (
  isOwner: boolean,
  companyMail: User,
  API_BASE_URL: string,
  token: string | null
) => {
  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    recipient: "",
    body: "",
    name: "",
  });
  const [recipientInput, setRecipientInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([companyMail]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkData, setLinkData] = useState<LinkData>({ url: "", text: "" });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // Fetch users only once or when API_BASE_URL/token changes
  useEffect(() => {
    const fetchAdminEmails = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE_URL}/admin/emails`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        const userObjects = data.emails.map((item: any) => ({
          email: item.email,
          username: item.username,
        }));
        setUsers(userObjects);
        setFilteredUsers([companyMail, ...userObjects]);
      } catch (err) {
        console.error("Failed to fetch admin emails:", err);
      }
    };
    fetchAdminEmails();
  }, [API_BASE_URL, token, companyMail]);

  // Filter users based on input
  useEffect(() => {
    if (recipientInput && users.length > 0) {
      const filtered = users.filter(
        (u) =>
          u.email.toLowerCase().includes(recipientInput.toLowerCase()) ||
          u.username.toLowerCase().includes(recipientInput.toLowerCase())
      );
      setFilteredUsers([companyMail, ...filtered]);
    } else {
      setFilteredUsers([companyMail, ...users]);
    }
  }, [recipientInput, users, companyMail]);

  // Set name from localStorage
  useEffect(() => {
    const name = localStorage.getItem("username");
    if (name) setEmailData((prev) => ({ ...prev, name }));
  }, []);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "body" && textAreaRef.current) cursorPositionRef.current = textAreaRef.current.selectionStart;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRecipientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientInput(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectUser = (user: User) => {
    setEmailData((prev) => ({ ...prev, recipient: user.email }));
    setRecipientInput(user.email);
    setShowDropdown(false);
  };

  const handleFocus = () => setShowDropdown(true);
  const handleTextAreaClick = () => {
    if (textAreaRef.current) cursorPositionRef.current = textAreaRef.current.selectionStart;
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLinkData((prev) => ({ ...prev, [name]: value }));
  };

  const insertLink = () => {
    if (!linkData.url) return;
    const linkText = linkData.text || linkData.url;
    const formattedLink = `[${linkText}](${linkData.url})`;
    let body = emailData.body;

    if (cursorPositionRef.current !== null) {
      body = body.slice(0, cursorPositionRef.current) + formattedLink + body.slice(cursorPositionRef.current);
    } else {
      if (body && !body.endsWith(" ") && !body.endsWith("\n")) body += " ";
      body += formattedLink;
    }

    setEmailData((prev) => ({ ...prev, body }));
    setShowLinkModal(false);

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        const newPos = (cursorPositionRef.current ?? body.length) + formattedLink.length;
        textAreaRef.current.setSelectionRange(newPos, newPos);
        cursorPositionRef.current = newPos;
      }
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!token) {
      setError("Authentication token is missing.");
      setIsSubmitting(false);
      return;
    }

    const submissionData = { ...emailData, recipient: isOwner ? recipientInput : emailData.recipient };

    try {
      const res = await fetch(`${API_BASE_URL}/api/save-email`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save email");
      } else {
        alert("Email saved successfully!");
        setEmailData({ subject: "", recipient: "", body: "", name: "" });
        setRecipientInput("");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while saving the email");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    emailData,
    recipientInput,
    showDropdown,
    filteredUsers,
    isSubmitting,
    error,
    showLinkModal,
    linkData,
    textAreaRef,
    handleChange,
    handleRecipientInputChange,
    handleSelectUser,
    handleFocus,
    handleTextAreaClick,
    handleLinkChange,
    insertLink,
    setShowLinkModal,
    handleSubmit,
  };
};
