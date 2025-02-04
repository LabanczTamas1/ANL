import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3001/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send the message. Please try again later.');
      }

      setSuccess(true);
      setFormData({ fullName: '', email: '', message: '' }); // Reset the form
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-white/5 backdrop-blur-md text-white rounded-lg shadow-md flex flex-col items-center justify-around text-center m-4 border-4 border-gray-400">
      <form onSubmit={handleSubmit} className="p-8 rounded-lg w-[90vw] lg:w-[35vw] lg:max-w-[450px]">
        <h1 className="text-center text-2xl font-bold mb-6">Send message for Us</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">Message sent successfully!</p>}

        <div className="mb-4 text-black">
          <label className="block text-sm text-left font-medium text-white mb-2" htmlFor="fullName">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-left font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-left font-medium mb-2" htmlFor="message">
            Write your message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Write your message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-purple-500 h-[100px]"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          className={`w-full text-white font-medium py-2 rounded-lg transition ${
            isLoading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
          }`}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;