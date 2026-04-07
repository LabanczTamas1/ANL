import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:3001/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send the message. Please try again later.");
      }

      setSuccess(true);
      setFormData({ fullName: "", email: "", message: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full px-4 py-3 rounded-xl bg-surface-elevated border border-line-glass text-white placeholder-content-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-fast";

  return (
    <div className="rounded-2xl border border-line-glass bg-glass backdrop-blur-md p-8 md:p-10">
      {/* Form header */}
      <h2 className="text-2xl font-bold text-white mb-2">Send Us a Message</h2>
      <p className="text-content-muted text-sm mb-8">
        Fill out the form below and we&apos;ll get back to you as soon as
        possible.
      </p>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-status-error/10 border border-status-error/30 text-status-error text-sm">
          <span className="shrink-0">&#x26A0;</span>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 px-4 py-3 mb-6 rounded-xl bg-status-success/10 border border-status-success/30 text-status-success text-sm">
          <span className="shrink-0">&#x2714;</span>
          Message sent successfully! We&apos;ll be in touch soon.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-content-subtle-inverse mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-content-subtle-inverse mb-2"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            className={inputClasses}
            required
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-content-subtle-inverse mb-2"
          >
            Your Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us about your project or question..."
            value={formData.message}
            onChange={handleChange}
            rows={5}
            className={`${inputClasses} resize-none`}
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-brand to-accent-teal rounded-xl text-white font-semibold text-base overflow-hidden transition-all duration-normal hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {/* Shine effect */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <FaPaperPlane className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          <span>{isLoading ? "Sending..." : "Send Message"}</span>
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
