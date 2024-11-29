import React, { useState } from "react";

interface EmailData {
  subject: string;
  recipient: string;
  body: string;
  name: string; // Added name to EmailData interface
}

const SendMail: React.FC = () => {
  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    recipient: "",
    body: "",
    name: "", // Initialize name field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve the JWT token and name from localStorage
  const token = localStorage.getItem("authToken");
  const name = localStorage.getItem("name"); // Get the name from localStorage

  // Set the name in the emailData state
  if (name) {
    emailData.name = name;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

    try {
      const response = await fetch("http://localhost:3000/api/save-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,  // Include the JWT token here
        },
        body: JSON.stringify(emailData), // Include the email data with name
      });

      if (response.ok) {
        alert("Email saved successfully!");
        setEmailData({ subject: "", recipient: "", body: "", name: "" }); // Clear form after success
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
    <div className="bg-white">
      <div className="flex flex-row items-center">
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
        <h2 className="font-[800] text-[2.375em] pl-2">Send Mail</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row justify-center items-center border-[1px] rounded-md">
          <label htmlFor="recipient" className="block font-bold text-black">
            To:
          </label>
          <input
            type="email"
            id="recipient"
            name="recipient"
            value={emailData.recipient}
            onChange={handleChange}
            className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#65558F]"
            placeholder="Enter recipient's email"
            required
          />
        </div>
        <div className="flex flex-row justify-center items-center border-[1px] rounded-md">
          <label htmlFor="subject" className="block text-sm font-bold text-gray-700">
            Subject:
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            className="w-full pl-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#65558F]"
            placeholder="Enter subject"
            required
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Email Body
          </label>
          <textarea
            id="body"
            name="body"
            value={emailData.body}
            onChange={handleChange}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your email here"
            rows={8}
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-semibold rounded-md ${
            isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Send Email"}
        </button>
      </form>
    </div>
  );
};

export default SendMail;
