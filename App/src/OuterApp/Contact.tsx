import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ContactForm from "./ContactForm";
import CookieConsentBanner from "./Informations.tsx/CookieConsentBanner";
import { useLanguage } from "../hooks/useLanguage";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

interface DayAvailability {
  day: string;
  openingTime: string;
  closingTime: string;
  isDayOff: string;
}

const DEFAULT_HOURS: DayAvailability[] = [
  { day: "Monday", openingTime: "09:00", closingTime: "17:00", isDayOff: "false" },
  { day: "Tuesday", openingTime: "09:00", closingTime: "17:00", isDayOff: "false" },
  { day: "Wednesday", openingTime: "09:00", closingTime: "17:00", isDayOff: "false" },
  { day: "Thursday", openingTime: "09:00", closingTime: "17:00", isDayOff: "false" },
  { day: "Friday", openingTime: "09:00", closingTime: "17:00", isDayOff: "false" },
  { day: "Saturday", openingTime: "09:00", closingTime: "17:00", isDayOff: "true" },
  { day: "Sunday", openingTime: "09:00", closingTime: "17:00", isDayOff: "true" },
];

const formatTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const staticCards = [
  {
    icon: FaMapMarkerAlt,
    title: "Our Office",
    lines: ["Example Street", "Targu Mures, 501234", "Romania"],
  },
  {
    icon: FaPhoneAlt,
    title: "Phone",
    lines: ["+40 123 456 789"],
    href: "tel:+40123456789",
  },
  {
    icon: FaEnvelope,
    title: "Email",
    lines: ["email@gmail.com"],
    href: "mailto:email@gmail.com",
  },
];

const Contact = () => {
  const { language, translations } = useLanguage();
  const t = translations[language];
  const [hours, setHours] = useState<DayAvailability[]>(DEFAULT_HOURS);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

    // Fetch public availability data — fall back silently to defaults
    const fetchHours = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/availability/standard-availability`
        );
        if (!res.ok) throw new Error("not available");
        const data: DayAvailability[] = await res.json();
        if (Array.isArray(data) && data.length > 0) setHours(data);
      } catch {
        // keep defaults
      }
    };
    fetchHours();
  }, []);

  return (
    <div className="bg-surface-overlay relative min-h-screen flex flex-col overflow-hidden">
      <Helmet>
        <title>Contact Us | ANL</title>
        <meta
          name="description"
          content="Get in touch with the ANL team. We'd love to hear from you."
        />
      </Helmet>

      {/* Background ambient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-brand/20 rounded-full blur-[140px] animate-pulse" />
        <div
          className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] bg-accent-teal/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-[60%] left-[50%] w-[300px] h-[300px] bg-brand/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "3s" }}
        />
      </div>

      <Navbar />

      {/* Hero header */}
      <section className="relative z-10 pt-32 pb-8 px-6 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand/20 rounded-full text-brand-hover text-sm font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-hover opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-hover" />
          </span>
          We&apos;re here to help
        </span>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
          {t.contactUs || "Get in Touch"}
        </h1>
        <p className="text-lg text-content-muted max-w-xl mx-auto">
          Whether you have a question, a project idea, or just want to say hello
          &mdash; our team is ready to assist you.
        </p>
      </section>

      {/* Main content grid */}
      <section className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left column — info cards */}
        <div className="flex flex-col gap-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staticCards.map(({ icon: Icon, title, lines, href }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-line-glass bg-glass backdrop-blur-md p-6 transition-all duration-normal hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/20 text-brand-hover mb-4 transition-colors duration-fast group-hover:bg-brand/30">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-1">
                  {title}
                </h3>
                {lines.map((line, i) =>
                  href && i === 0 ? (
                    <a
                      key={i}
                      href={href}
                      className="block text-content-muted text-sm hover:text-brand-hover transition-colors duration-fast"
                    >
                      {line}
                    </a>
                  ) : (
                    <p key={i} className="text-content-muted text-sm">
                      {line}
                    </p>
                  )
                )}
              </div>
            ))}

            {/* Working Hours card — dynamic */}
            <div className="group relative rounded-2xl border border-line-glass bg-glass backdrop-blur-md p-6 transition-all duration-normal hover:border-brand/40 hover:shadow-lg hover:shadow-brand/10">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand/20 text-brand-hover mb-4 transition-colors duration-fast group-hover:bg-brand/30">
                <FaClock className="w-5 h-5" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">
                Flexible Hours
              </h3>
              <p className="text-brand-hover text-xs font-medium mb-2">
                We adapt to your schedule
              </p>
              <div className="space-y-0.5">
                {hours.map((d) => (
                  <div key={d.day} className="flex justify-between text-sm">
                    <span className="text-content-muted">
                      {d.day.slice(0, 3)}
                    </span>
                    <span
                      className={
                        d.isDayOff === "true"
                          ? "text-content-disabled italic"
                          : "text-content-subtle-inverse"
                      }
                    >
                      {d.isDayOff === "true"
                        ? "Closed"
                        : `${formatTime(d.openingTime)} – ${formatTime(d.closingTime)}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map embed */}
          <div className="rounded-2xl border border-line-glass bg-glass backdrop-blur-md overflow-hidden h-64 lg:h-80">
            <iframe
              title="Office location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d43893.06847818464!2d24.533262!3d46.545669!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x474bb663175f4531%3A0xc58032e47b99c5e7!2sT%C3%A2rgu%20Mure%C8%99!5e0!3m2!1sen!2sro!4v1700000000000!5m2!1sen!2sro"
              className="w-full h-full border-0 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-slow"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* Right column — contact form */}
        <div className="pt-4">
          <ContactForm />
        </div>
      </section>

      <Footer darkMode={true} />
      <CookieConsentBanner />
    </div>
  );
};

export default Contact;
