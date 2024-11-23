import React, { useState } from 'react';

const ContactForm: React.FC = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    message: '',
  });

  type FormField = keyof typeof formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
    console.log('Form Data:', formData);
    alert('Message sent successfully!');
  };

  return (
    <div className="flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-8 rounded-lg w-[400px]">
        <h1 className="text-center text-2xl font-bold mb-6">Send message</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="fullName">
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
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" htmlFor="message">
            Write your message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Write your message"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-[100px]"
          ></textarea>
        </div>
        
        <button
          type="submit"
          className="w-full bg-purple-600 text-white font-medium py-2 rounded-lg hover:bg-purple-700 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
