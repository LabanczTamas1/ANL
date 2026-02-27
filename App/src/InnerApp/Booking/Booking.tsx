import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import darkLogo from "/public/dark-logo.png";
import lightLogo from "/public/light-logo.png";
import { Calendar as CalendarIcon, Clock, Video, User, Building2, Mail, Info } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import ThemeIcon from "../components/Logo";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useBooking } from "./useBooking";
import type { BookingFormData } from "./useBooking";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const REFERRAL_OPTIONS = [
  "Google Search",
  "LinkedIn",
  "Facebook",
  "Instagram",
  "Referral / Word of mouth",
  "Conference / Event",
  "Blog / Article",
  "Other",
];

const Booking = () => {
  const { t } = useLanguage();
  const {
    currentDate,
    setCurrentDate,
    isLoading,
    addableTimes,
    selectedValues,
    setSelectedValues,
    selectedDateFormated,
    formatTime,
    getAvailableTimeByDate,
    handleSelection,
    handleSubmit,
  } = useBooking();

  const [showForm, setShowForm] = React.useState(false);

  // Form fields – all required, nothing from localStorage
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [referralSource, setReferralSource] = React.useState("");
  const [referralSourceOther, setReferralSourceOther] = React.useState("");

  // Validation state
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const selectedTime = selectedValues[0]
    ? formatTime(Number(selectedValues[0]))
    : "";

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    if (!company.trim()) errors.company = "Company name is required.";
    if (!referralSource) errors.referralSource = "Please select an option.";
    if (referralSource === "Other" && !referralSourceOther.trim())
      errors.referralSourceOther = "Please specify where you heard about us.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = () => {
    if (!validateForm()) return;
    const formData: BookingFormData = {
      fullName,
      email,
      company,
      referralSource,
      referralSourceOther,
    };
    handleSubmit(formData);
  };

  return (
    <div className="min-h-screen bg-surface-overlay flex justify-center items-center p-4 md:p-8 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col xl:flex-row max-w-[1400px] w-full bg-surface-elevated/80 backdrop-blur-xl border border-line-glass rounded-3xl shadow-glass overflow-hidden">
        {/* Left Panel - Meeting Info */}
        <div className="flex flex-col py-8 px-6 md:px-8 w-full xl:w-[320px] border-b xl:border-b-0 xl:border-r border-line-glass bg-gradient-to-br from-brand/10 to-transparent">
          <ThemeIcon
            lightIcon={<img src={darkLogo} alt="Light Logo" className="h-12 w-12" />}
            darkIcon={<img src={lightLogo} alt="Dark Logo" className="h-12 w-12" />}
            size="l"
            ariaLabel="ANL logo"
          />
          
          <div className="mt-6">
            <h3 className="font-bold text-2xl md:text-3xl text-content-inverse mb-3">
              {t("meetWithTitle")}
            </h3>
            <p className="text-content-subtle-inverse mb-6 text-sm md:text-base leading-relaxed">
              {t("bookingDescription")}
            </p>
          </div>

          {/* Meeting Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl border border-line-glass">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-content-inverse text-sm md:text-base">
                {selectedDateFormated
                  ? `${selectedDateFormated}${selectedTime ? ` · ${selectedTime}` : ""}`
                  : t("selectDate") || "Select a date"}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl border border-line-glass">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-teal to-brand flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-content-inverse text-sm md:text-base">{t("meetingDuration")}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl border border-line-glass">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <span className="text-content-inverse text-sm md:text-base">{t("googleMeet")}</span>
            </div>
          </div>

          {/* User Info Preview – shows as they fill in the form */}
          {(fullName || company || email) && (
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider text-content-subtle-inverse font-semibold">Your Details</h4>
              {fullName && (
                <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl border border-line-glass">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-content-inverse text-sm md:text-base">{fullName}</span>
                </div>
              )}
              {company && (
                <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl border border-line-glass">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-teal to-brand flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-content-inverse text-sm md:text-base">{company}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-3 p-3 bg-surface-elevated/50 rounded-xl border border-line-glass">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-hover to-accent-teal flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-content-inverse text-sm md:text-base">{email}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Calendar Section */}
        {!showForm && (
          <div className="flex-1 p-4 md:p-6 border-b xl:border-b-0 xl:border-r border-line-glass">
            <div className="h-full">
              <Calendar
                className="booking-calendar !bg-transparent !w-full !h-full !border-none"
                tileClassName={({ date }) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return `
                    !rounded-xl !transition-all !duration-200
                    hover:!bg-brand/30 hover:!text-white
                    focus:!bg-brand focus:!text-white
                    ${isToday ? '!bg-accent-teal/20 !text-accent-teal !font-bold' : '!text-content-inverse'}
                  `;
                }}
                onChange={(value: Value) => {
                  setSelectedValues([]);
                  getAvailableTimeByDate(value);
                }}
                value={currentDate}
                view="month"
                onActiveStartDateChange={({ activeStartDate }) =>
                  setCurrentDate(activeStartDate || new Date())
                }
                showNeighboringMonth={true}
                navigationLabel={({ date }) => (
                  <span className="text-lg font-semibold text-content-inverse">
                    {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
                nextLabel={<span className="text-content-inverse hover:text-brand-hover transition-colors">›</span>}
                prevLabel={<span className="text-content-inverse hover:text-brand-hover transition-colors">‹</span>}
                next2Label={null}
                prev2Label={null}
              />
            </div>
          </div>
        )}

        {/* Time Slots / Form Section */}
        <div className="flex flex-col p-4 md:p-6 w-full xl:w-[320px]">
          {!showForm && (
            <>
              <h4 className="text-lg font-semibold text-content-inverse mb-4">
                {selectedDateFormated ? "Available Times" : "Select a Date"}
              </h4>
              <ul className="overflow-y-auto flex-1 max-h-[300px] md:max-h-[400px] space-y-2 pr-2 custom-scrollbar">
                {addableTimes.length > 0 ? (
                  addableTimes.map((timeInMinutes, index) => (
                    <li key={index}>
                      <button
                        key={timeInMinutes}
                        className={`w-full px-4 py-3 rounded-xl font-medium text-sm md:text-base transition-all duration-200
                          ${selectedValues.includes(timeInMinutes.toString())
                            ? "bg-gradient-to-r from-brand to-accent-teal text-white shadow-lg shadow-brand/30 scale-[1.02]"
                            : "bg-surface-elevated/50 text-content-inverse border border-line-glass hover:bg-brand/20 hover:border-brand/30"
                          }`}
                        onClick={() => handleSelection(timeInMinutes.toString())}
                      >
                        {formatTime(timeInMinutes)}
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center">
                    <CalendarIcon className="w-12 h-12 text-content-subtle-inverse/40 mb-3" />
                    <p className="text-content-subtle-inverse text-sm">
                      {t("pickADate")}
                    </p>
                  </div>
                )}
              </ul>
            </>
          )}
          
          {addableTimes.length > 0 && !showForm && (
            <button
              className="mt-4 px-6 py-3 bg-gradient-to-r from-brand to-accent-teal text-white font-semibold rounded-xl 
                hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              onClick={() => setShowForm(true)}
              disabled={selectedValues.length === 0}
            >
              {t("continue") || "Continue"}
            </button>
          )}

          {showForm && (
            <div className="flex-1 overflow-y-auto max-h-[500px] custom-scrollbar pr-1">
              <h4 className="text-lg font-semibold text-content-inverse mb-4">Your Information</h4>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm text-content-subtle-inverse font-medium mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 bg-surface-black/40 border rounded-xl text-white
                      placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all
                      ${formErrors.fullName ? "border-red-500" : "border-line-glass"}`}
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setFormErrors((p) => ({ ...p, fullName: "" })); }}
                    type="text"
                    placeholder="John Doe"
                  />
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email (company email) */}
                <div>
                  <label className="block text-sm text-content-subtle-inverse font-medium mb-2">
                    Email <span className="text-red-400">*</span>{" "}
                    <span className="text-content-disabled text-xs">(company email)</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 bg-surface-black/40 border rounded-xl text-white
                      placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all
                      ${formErrors.email ? "border-red-500" : "border-line-glass"}`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFormErrors((p) => ({ ...p, email: "" })); }}
                    type="email"
                    placeholder="john@company.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm text-content-subtle-inverse font-medium mb-2">
                    Company Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    className={`w-full px-4 py-3 bg-surface-black/40 border rounded-xl text-white
                      placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all
                      ${formErrors.company ? "border-red-500" : "border-line-glass"}`}
                    value={company}
                    onChange={(e) => { setCompany(e.target.value); setFormErrors((p) => ({ ...p, company: "" })); }}
                    type="text"
                    placeholder="Acme Inc."
                  />
                  {formErrors.company && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.company}</p>
                  )}
                </div>

                {/* Where did you hear about us? */}
                <div>
                  <label className="block text-sm text-content-subtle-inverse font-medium mb-2">
                    Where did you hear about us? <span className="text-red-400">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-3 bg-surface-black/40 border rounded-xl text-white
                      focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all appearance-none
                      ${formErrors.referralSource ? "border-red-500" : "border-line-glass"}
                      ${!referralSource ? "text-content-disabled" : ""}`}
                    value={referralSource}
                    onChange={(e) => {
                      setReferralSource(e.target.value);
                      if (e.target.value !== "Other") setReferralSourceOther("");
                      setFormErrors((p) => ({ ...p, referralSource: "", referralSourceOther: "" }));
                    }}
                  >
                    <option value="" disabled>Select an option...</option>
                    {REFERRAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-gray-800 text-white">
                        {opt}
                      </option>
                    ))}
                  </select>
                  {formErrors.referralSource && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.referralSource}</p>
                  )}
                </div>

                {/* "Other" free-text input */}
                {referralSource === "Other" && (
                  <div>
                    <label className="block text-sm text-content-subtle-inverse font-medium mb-2">
                      Please specify <span className="text-red-400">*</span>
                    </label>
                    <input
                      className={`w-full px-4 py-3 bg-surface-black/40 border rounded-xl text-white
                        placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all
                        ${formErrors.referralSourceOther ? "border-red-500" : "border-line-glass"}`}
                      value={referralSourceOther}
                      onChange={(e) => { setReferralSourceOther(e.target.value); setFormErrors((p) => ({ ...p, referralSourceOther: "" })); }}
                      type="text"
                      placeholder="How did you find us?"
                    />
                    {formErrors.referralSourceOther && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.referralSourceOther}</p>
                    )}
                  </div>
                )}

                {/* Info note */}
                <div className="flex items-start gap-2 p-3 bg-brand/10 rounded-xl border border-brand/20">
                  <Info className="w-4 h-4 text-brand-hover mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-content-subtle-inverse leading-relaxed">
                    All fields are required. We'll send meeting details to the email you provide.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-brand to-accent-teal text-white font-semibold rounded-xl 
                    hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02] transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  onClick={onSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? t("sending") || "Sending..." : t("submit") || "Book Meeting"}
                </button>
                <button
                  className="px-6 py-3 bg-surface-elevated/50 border border-line-glass text-content-inverse font-medium rounded-xl
                    hover:bg-surface-elevated hover:border-brand/30 transition-all"
                  onClick={() => setShowForm(false)}
                >
                  {t("back") || "Back"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />
      
      {/* Custom styles for calendar */}
      <style>{`
        .booking-calendar .react-calendar__navigation {
          background: transparent;
          margin-bottom: 1rem;
        }
        .booking-calendar .react-calendar__navigation button {
          color: white;
          font-size: 1.5rem;
          background: transparent;
        }
        .booking-calendar .react-calendar__navigation button:hover {
          background: rgba(101, 85, 143, 0.2);
          border-radius: 0.75rem;
        }
        .booking-calendar .react-calendar__month-view__weekdays {
          color: #A5A5A5;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        .booking-calendar .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }
        .booking-calendar .react-calendar__tile {
          padding: 1rem 0.5rem;
          background: transparent;
        }
        .booking-calendar .react-calendar__tile--now {
          background: rgba(122, 164, 159, 0.2) !important;
        }
        .booking-calendar .react-calendar__tile--active {
          background: linear-gradient(135deg, #65558F 0%, #7AA49F 100%) !important;
          color: white !important;
        }
        .booking-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #4B5563 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(101, 85, 143, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(101, 85, 143, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Booking;
