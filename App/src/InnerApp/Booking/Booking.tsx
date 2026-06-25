import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
const darkLogo = "/dark-logo.png";
const lightLogo = "/light-logo.png";
import { Calendar as CalendarIcon, Clock, Video, User, Building2, Mail, CheckCircle2, Lock, ArrowLeft, Sunrise, Sun, Sunset } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import { useThemePreference } from "../../hooks/useThemePreference";
import ThemeIcon from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useBooking } from "./useBooking";
import type { BookingFormData } from "./useBooking";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const Booking = () => {
  const { t } = useLanguage();
  const { darkMode, toggleTheme } = useThemePreference();
  const isLoggedIn = !!localStorage.getItem("authToken");

  const REFERRAL_OPTIONS = [
    { value: "Google Search", label: t("booking.referralGoogle") },
    { value: "LinkedIn", label: t("booking.referralLinkedin") },
    { value: "Facebook", label: t("booking.referralFacebook") },
    { value: "Instagram", label: t("booking.referralInstagram") },
    { value: "Referral / Word of mouth", label: t("booking.referralWordOfMouth") },
    { value: "Conference / Event", label: t("booking.referralConference") },
    { value: "Blog / Article", label: t("booking.referralBlog") },
    { value: "Other", label: t("booking.referralOther") },
  ];

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
  const [calendarValue, setCalendarValue] = React.useState<Date | null>(null);

  // Form fields – all required, nothing from localStorage
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [company, setCompany] = React.useState("");
  const [referralSource, setReferralSource] = React.useState("");
  const [referralSourceOther, setReferralSourceOther] = React.useState("");

  // Validation state
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  // Group available times by day part
  const groupedTimes = React.useMemo(() => {
    const morning   = addableTimes.filter(m => m < 720);          // before 12:00
    const afternoon = addableTimes.filter(m => m >= 720 && m < 1020); // 12:00–17:00
    const evening   = addableTimes.filter(m => m >= 1020);         // 17:00+
    return [
      { label: t("booking.dayMorning"),   icon: Sunrise, times: morning,   color: "from-amber-400 to-orange-400" },
      { label: t("booking.dayAfternoon"), icon: Sun,     times: afternoon, color: "from-yellow-400 to-amber-500" },
      { label: t("booking.dayEvening"),  icon: Sunset,  times: evening,   color: "from-indigo-400 to-purple-500" },
    ].filter(g => g.times.length > 0);
  }, [addableTimes]);

  // Form completion progress (for UX progress bar)
  const filledCount = React.useMemo(() => {
    let count = 0;
    if (fullName.trim()) count++;
    if (email.trim()) count++;
    if (company.trim()) count++;
    if (referralSource && (referralSource !== "Other" || referralSourceOther.trim())) count++;
    return count;
  }, [fullName, email, company, referralSource, referralSourceOther]);
  const allFilled = filledCount === 4;

  const selectedTime = selectedValues[0]
    ? formatTime(Number(selectedValues[0]))
    : "";

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = t("booking.errFullName");
    if (!email.trim()) errors.email = t("booking.errEmail");
    if (!company.trim()) errors.company = t("booking.errCompany");
    if (!referralSource) errors.referralSource = t("booking.errSelectOption");
    if (referralSource === "Other" && !referralSourceOther.trim())
      errors.referralSourceOther = t("booking.errSpecify");
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
    <div className="h-full bg-[#F4F4F8] dark:bg-surface-overlay flex justify-center items-start lg:items-stretch p-3 md:p-4 lg:p-5 relative overflow-x-hidden overflow-y-auto lg:overflow-hidden custom-scrollbar">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className={`relative z-10 flex flex-col lg:flex-row w-full h-auto lg:h-full bg-white/90 dark:bg-surface-elevated/80 backdrop-blur-xl border border-line dark:border-line-glass rounded-2xl md:rounded-3xl shadow-glass overflow-visible lg:overflow-hidden${showForm ? " lg:justify-center" : ""}`}>
        {/* Left Panel - Meeting Info */}
        <div className={`flex flex-col py-5 px-5 md:px-6 w-full lg:shrink-0 border-b lg:border-b-0 lg:border-r border-line dark:border-line-glass bg-gradient-to-br from-brand/10 to-transparent rounded-t-2xl md:rounded-t-3xl lg:rounded-none lg:overflow-y-auto lg:custom-scrollbar${showForm ? " hidden lg:flex lg:w-[440px] lg:min-w-[380px]" : " lg:w-[280px] lg:min-w-[260px]"}`}>
          <div className="flex items-center justify-between gap-2">
            <ThemeIcon
              lightIcon={<img src={darkLogo} alt="Light Logo" className="h-10 w-10 object-contain" />}
              darkIcon={<img src={lightLogo} alt="Dark Logo" className="h-10 w-10 object-contain" />}
              size="l"
              ariaLabel="ANL logo"
            />
            {!isLoggedIn && (
              <ThemeToggle
                darkMode={darkMode}
                onToggle={toggleTheme}
                labelLight={t("booking.themeLight")}
                labelDark={t("booking.themeDark")}
              />
            )}
          </div>
          
          {showForm ? (
            /* ── Form mode: 2-column compact layout ── */
            <div className="mt-3 flex flex-col gap-3 flex-1 min-h-0">
              {/* Title + description – full width */}
              <div>
                <h3 className="font-bold text-xl text-content dark:text-content-inverse mb-1">{t("meetWithTitle")}</h3>
                <p className="text-content-subtle dark:text-content-subtle-inverse text-xs leading-relaxed">{t("bookingDescription")}</p>
              </div>

              {/* Date/time – full width above the grid */}
              <div className="flex items-center gap-2 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-content dark:text-content-inverse text-xs truncate leading-tight font-medium">
                  {selectedDateFormated
                    ? `${selectedDateFormated}${selectedTime ? ` · ${selectedTime}` : ""}`
                    : t("selectDate") || "Select a date"}
                </span>
              </div>

              {/* Two-column grid: meeting details | your details */}
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                {/* Left sub-column: meeting details */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-content-subtle dark:text-content-subtle-inverse font-semibold">{t("booking.meeting")}</p>
                  <div className="flex items-center gap-2 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-teal to-brand flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-content dark:text-content-inverse text-xs">{t("meetingDuration")}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                      <Video className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-content dark:text-content-inverse text-xs">{t("googleMeet")}</span>
                  </div>
                </div>

                {/* Right sub-column: your details preview */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-wider text-content-subtle dark:text-content-subtle-inverse font-semibold">{t("booking.yourDetails")}</p>
                  {fullName ? (
                    <div className="flex items-center gap-2 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-content dark:text-content-inverse text-xs truncate">{fullName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-black/[0.02] dark:bg-surface-elevated/20 rounded-lg border border-dashed border-line/70 dark:border-line-glass/50">
                      <div className="w-7 h-7 rounded-md bg-black/[0.04] dark:bg-surface-elevated/40 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-content-subtle/40 dark:text-content-subtle-inverse/40" />
                      </div>
                      <span className="text-content-disabled text-xs italic">{t("booking.phName")}</span>
                    </div>
                  )}
                  {company ? (
                    <div className="flex items-center gap-2 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-teal to-brand flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-content dark:text-content-inverse text-xs truncate">{company}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-black/[0.02] dark:bg-surface-elevated/20 rounded-lg border border-dashed border-line/70 dark:border-line-glass/50">
                      <div className="w-7 h-7 rounded-md bg-black/[0.04] dark:bg-surface-elevated/40 flex items-center justify-center shrink-0">
                        <Building2 className="w-3.5 h-3.5 text-content-subtle/40 dark:text-content-subtle-inverse/40" />
                      </div>
                      <span className="text-content-disabled text-xs italic">{t("booking.phCompany")}</span>
                    </div>
                  )}
                  {email ? (
                    <div className="flex items-center gap-2 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-hover to-accent-teal flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-content dark:text-content-inverse text-xs truncate">{email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-black/[0.02] dark:bg-surface-elevated/20 rounded-lg border border-dashed border-line/70 dark:border-line-glass/50">
                      <div className="w-7 h-7 rounded-md bg-black/[0.04] dark:bg-surface-elevated/40 flex items-center justify-center shrink-0">
                        <Mail className="w-3.5 h-3.5 text-content-subtle/40 dark:text-content-subtle-inverse/40" />
                      </div>
                      <span className="text-content-disabled text-xs italic">{t("booking.phEmail")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Calendar mode: original single-column layout ── */
            <>
              <div className="mt-4">
                <h3 className="font-bold text-xl md:text-2xl text-content dark:text-content-inverse mb-2">{t("meetWithTitle")}</h3>
                <p className="text-content-subtle dark:text-content-subtle-inverse mb-4 text-xs md:text-sm leading-relaxed">{t("bookingDescription")}</p>
              </div>

              {/* Meeting Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2.5 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-content dark:text-content-inverse text-xs md:text-sm truncate">
                    {selectedDateFormated
                      ? `${selectedDateFormated}${selectedTime ? ` · ${selectedTime}` : ""}`
                      : t("pickADate")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-accent-teal to-brand flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-content dark:text-content-inverse text-xs md:text-sm">{t("meetingDuration")}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-content dark:text-content-inverse text-xs md:text-sm">{t("googleMeet")}</span>
                </div>
              </div>

              {/* User Info Preview */}
              {(fullName || company || email) && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] uppercase tracking-wider text-content-subtle dark:text-content-subtle-inverse font-semibold mb-1">{t("booking.yourDetails")}</h4>
                  {fullName && (
                    <div className="flex items-center gap-2 p-1.5 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center shrink-0">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-content dark:text-content-inverse text-xs truncate">{fullName}</span>
                    </div>
                  )}
                  {company && (
                    <div className="flex items-center gap-2 p-1.5 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-accent-teal to-brand flex items-center justify-center shrink-0">
                        <Building2 className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-content dark:text-content-inverse text-xs truncate">{company}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-2 p-1.5 bg-black/[0.03] dark:bg-surface-elevated/50 rounded-lg border border-line dark:border-line-glass">
                      <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-hover to-accent-teal flex items-center justify-center shrink-0">
                        <Mail className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-content dark:text-content-inverse text-xs truncate">{email}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Calendar Section */}
        {!showForm && (
          <div className="min-w-0 p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-line dark:border-line-glass flex flex-col lg:flex-1 lg:min-h-0">
            <div className="lg:flex-1 lg:min-h-0">
              <Calendar
                className="booking-calendar !bg-transparent !w-full !border-none min-h-[320px] lg:!h-full"
                minDate={new Date()}
                tileClassName={() => `
                  !rounded-xl !transition-all !duration-200
                  hover:!bg-brand/30 hover:!text-white
                  focus:!bg-brand focus:!text-white
                  !text-content dark:!text-content-inverse
                `}
                tileContent={({ date }) =>
                  date.toDateString() === new Date().toDateString()
                    ? <span className="booking-today-label">{t("booking.today")}</span>
                    : null
                }
                onChange={(value: Value) => {
                  const dateValue = Array.isArray(value) ? value[0] : value;
                  setCalendarValue(dateValue);
                  setSelectedValues([]);
                  getAvailableTimeByDate(value);
                }}
                value={calendarValue}
                activeStartDate={currentDate}
                view="month"
                onActiveStartDateChange={({ activeStartDate }) =>
                  setCurrentDate(activeStartDate || new Date())
                }
                showNeighboringMonth={true}
                navigationLabel={({ date }) => (
                  <span className="text-lg font-semibold text-content dark:text-content-inverse">
                    {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                )}
                nextLabel={<span className="text-content dark:text-content-inverse hover:text-brand-hover transition-colors">›</span>}
                prevLabel={<span className="text-content dark:text-content-inverse hover:text-brand-hover transition-colors">‹</span>}
                next2Label={null}
                prev2Label={null}
              />
            </div>
          </div>
        )}

        {/* Time Slots / Form Section */}
        <div className={`flex flex-col w-full lg:shrink-0${showForm ? " p-5 md:p-7 lg:overflow-y-auto lg:custom-scrollbar lg:w-[400px] lg:min-w-[340px]" : " p-4 md:p-5 lg:overflow-hidden lg:w-[280px] lg:min-w-[260px]"}`}>
          {!showForm && (
            <>
              <h4 className="text-base font-semibold text-content dark:text-content-inverse mb-3">
                {selectedDateFormated ? t("booking.availableTimes") : t("booking.selectADate")}
              </h4>
              <div className="space-y-4 px-1 lg:overflow-y-auto lg:flex-1 lg:min-h-0 lg:pr-2 custom-scrollbar">
                {addableTimes.length > 0 ? (
                  groupedTimes.map(({ label, icon: Icon, times, color }) => (
                    <div key={label}>
                      {/* Day-part header */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${color} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-content-subtle dark:text-content-subtle-inverse">{label}</span>
                        <div className="flex-1 h-px bg-line/60 dark:bg-line-glass/50" />
                      </div>
                      {/* Slots */}
                      <ul className="space-y-1.5">
                        {times.map((timeInMinutes) => (
                          <li key={timeInMinutes}>
                            <button
                              className={`w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                                ${selectedValues.includes(timeInMinutes.toString())
                                  ? "bg-gradient-to-r from-brand to-accent-teal text-white shadow-lg shadow-brand/30 scale-[1.02]"
                                  : "bg-black/[0.03] dark:bg-surface-elevated/50 text-content dark:text-content-inverse border border-line dark:border-line-glass hover:bg-brand/20 hover:border-brand/30"
                                }`}
                              onClick={() => handleSelection(timeInMinutes.toString())}
                            >
                              {formatTime(timeInMinutes)}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <CalendarIcon className="w-10 h-10 text-content-subtle/40 dark:text-content-subtle-inverse/40 mb-2" />
                    <p className="text-content-subtle dark:text-content-subtle-inverse text-sm">
                      {t("pickADate")}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          
          {addableTimes.length > 0 && !showForm && (
            <button
              className="mt-3 px-5 py-2.5 bg-gradient-to-r from-brand to-accent-teal text-white font-semibold rounded-xl text-sm 
                hover:shadow-lg hover:shadow-brand/30 hover:scale-[1.02] transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              onClick={() => setShowForm(true)}
              disabled={selectedValues.length === 0}
            >
              {t("continue") || "Continue"}
            </button>
          )}

          {showForm && (
            <div className="form-slide-in">
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-widest text-content-subtle dark:text-content-subtle-inverse font-semibold">{t("booking.stepIndicator")}</span>
                <span className="text-[10px] text-content-subtle dark:text-content-subtle-inverse">{t("booking.fieldsProgress", { count: String(filledCount) })}</span>
              </div>

              {/* Animated completion progress bar */}
              <div className="w-full h-1.5 bg-black/[0.05] dark:bg-surface-elevated/60 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-accent-teal transition-all duration-500 ease-out"
                  style={{ width: `${(filledCount / 4) * 100}%` }}
                />
              </div>

              <h4 className="text-lg font-bold text-content dark:text-content-inverse mb-0.5">
                {allFilled ? t("booking.readyToConfirm") : t("booking.almostThere")}
              </h4>
              <p className="text-xs text-content-subtle dark:text-content-subtle-inverse mb-4 leading-relaxed">
                {allFilled
                  ? t("booking.readyDesc")
                  : t("booking.almostDesc")}
              </p>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs text-content-subtle dark:text-content-subtle-inverse font-medium mb-1">
                    {t("booking.fullNameLabel")} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full px-3 py-2.5 bg-white dark:bg-surface-black/40 border rounded-lg text-content dark:text-white text-sm
                        placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all pr-9
                        ${formErrors.fullName ? "border-red-500" : fullName.trim() ? "border-accent-teal/60" : "border-line dark:border-line-glass"}`}
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setFormErrors((p) => ({ ...p, fullName: "" })); }}
                      type="text"
                      placeholder={t("booking.namePlaceholder")}
                    />
                    {fullName.trim() && !formErrors.fullName && (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-teal pointer-events-none" />
                    )}
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-content-subtle dark:text-content-subtle-inverse font-medium mb-1">
                    {t("booking.emailLabel")} <span className="text-red-400">*</span>{" "}
                    <span className="text-content-disabled text-[10px]">{t("booking.companyEmailHint")}</span>
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full px-3 py-2.5 bg-white dark:bg-surface-black/40 border rounded-lg text-content dark:text-white text-sm
                        placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all pr-9
                        ${formErrors.email ? "border-red-500" : email.trim() ? "border-accent-teal/60" : "border-line dark:border-line-glass"}`}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setFormErrors((p) => ({ ...p, email: "" })); }}
                      type="email"
                      placeholder={t("booking.emailPlaceholder")}
                    />
                    {email.trim() && !formErrors.email && (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-teal pointer-events-none" />
                    )}
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-xs text-content-subtle dark:text-content-subtle-inverse font-medium mb-1">
                    {t("booking.companyNameLabel")} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full px-3 py-2.5 bg-white dark:bg-surface-black/40 border rounded-lg text-content dark:text-white text-sm
                        placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all pr-9
                        ${formErrors.company ? "border-red-500" : company.trim() ? "border-accent-teal/60" : "border-line dark:border-line-glass"}`}
                      value={company}
                      onChange={(e) => { setCompany(e.target.value); setFormErrors((p) => ({ ...p, company: "" })); }}
                      type="text"
                      placeholder={t("booking.companyPlaceholder")}
                    />
                    {company.trim() && !formErrors.company && (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-teal pointer-events-none" />
                    )}
                  </div>
                  {formErrors.company && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.company}</p>
                  )}
                </div>

                {/* Where did you hear about us? */}
                <div>
                  <label className="block text-xs text-content-subtle dark:text-content-subtle-inverse font-medium mb-1">
                    {t("booking.referralLabel")} <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      className={`w-full px-3 py-2.5 bg-white dark:bg-surface-black/40 border rounded-lg text-content dark:text-white text-sm
                        focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all appearance-none pr-9
                        ${formErrors.referralSource ? "border-red-500" : referralSource ? "border-accent-teal/60" : "border-line dark:border-line-glass"}
                        ${!referralSource ? "text-content-disabled" : ""}`}
                      value={referralSource}
                      onChange={(e) => {
                        setReferralSource(e.target.value);
                        if (e.target.value !== "Other") setReferralSourceOther("");
                        setFormErrors((p) => ({ ...p, referralSource: "", referralSourceOther: "" }));
                      }}
                    >
                      <option value="" disabled>{t("booking.selectOption")}</option>
                      {REFERRAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-gray-800 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {referralSource && !formErrors.referralSource && (
                      <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-teal pointer-events-none" />
                    )}
                  </div>
                  {formErrors.referralSource && (
                    <p className="mt-1 text-xs text-red-400">{formErrors.referralSource}</p>
                  )}
                </div>

                {/* "Other" free-text input */}
                {referralSource === "Other" && (
                  <div>
                    <label className="block text-xs text-content-subtle dark:text-content-subtle-inverse font-medium mb-1">
                      {t("booking.specifyLabel")} <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        className={`w-full px-3 py-2.5 bg-white dark:bg-surface-black/40 border rounded-lg text-content dark:text-white text-sm
                          placeholder:text-content-disabled focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40 transition-all pr-9
                          ${formErrors.referralSourceOther ? "border-red-500" : referralSourceOther.trim() ? "border-accent-teal/60" : "border-line dark:border-line-glass"}`}
                        value={referralSourceOther}
                        onChange={(e) => { setReferralSourceOther(e.target.value); setFormErrors((p) => ({ ...p, referralSourceOther: "" })); }}
                        type="text"
                        placeholder={t("booking.specifyPlaceholder")}
                      />
                      {referralSourceOther.trim() && !formErrors.referralSourceOther && (
                        <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-teal pointer-events-none" />
                      )}
                    </div>
                    {formErrors.referralSourceOther && (
                      <p className="mt-1 text-xs text-red-400">{formErrors.referralSourceOther}</p>
                    )}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="mt-5 space-y-3">
                <button
                  className={`w-full py-3 font-bold rounded-xl text-sm transition-all duration-200
                    bg-gradient-to-r from-brand to-accent-teal text-white
                    hover:shadow-xl hover:shadow-brand/40 hover:scale-[1.02]
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                    ${allFilled && !isLoading ? "cta-pulse" : ""}`}
                  onClick={onSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      {t("sending") || "Confirming..."}
                    </span>
                  ) : (
                    t("submit") || "Confirm Booking"
                  )}
                </button>

                <button
                  className="w-full py-2.5 bg-transparent border border-line dark:border-line-glass text-content-subtle dark:text-content-subtle-inverse font-medium rounded-xl text-sm
                    hover:border-brand/40 hover:text-content dark:hover:text-content-inverse transition-all"
                  onClick={() => setShowForm(false)}
                >
                  <span className="flex items-center justify-center gap-1.5"><ArrowLeft className="w-4 h-4" />{t("back") || "Change date/time"}</span>
                </button>

                {/* Reassurance strip */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  <span className="flex items-center gap-1 text-[10px] text-content-subtle/70 dark:text-content-subtle-inverse/70">
                    <Lock className="w-2.5 h-2.5" /> {t("booking.secure")}
                  </span>
                  <span className="text-content-subtle/30 dark:text-content-subtle-inverse/30 text-[10px]">·</span>
                  <span className="text-[10px] text-content-subtle/70 dark:text-content-subtle-inverse/70">{t("booking.noCommitment")}</span>

                </div>
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
        theme={darkMode ? "dark" : "light"}
        transition={Bounce}
      />
      
      {/* Custom styles for calendar */}
      <style>{`
        .booking-calendar .react-calendar__navigation {
          background: transparent;
          margin-bottom: 1rem;
        }
        .booking-calendar .react-calendar__navigation button {
          color: #1f2937;
          font-size: 1.5rem;
          background: transparent;
        }
        .dark .booking-calendar .react-calendar__navigation button {
          color: white;
        }
        .booking-calendar .react-calendar__navigation button:hover {
          background: rgba(101, 85, 143, 0.12);
          border-radius: 0.75rem;
        }
        .dark .booking-calendar .react-calendar__navigation button:hover {
          background: rgba(101, 85, 143, 0.2);
        }
        .booking-calendar .react-calendar__month-view__weekdays {
          color: #6B7280;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
        }
        .dark .booking-calendar .react-calendar__month-view__weekdays {
          color: #A5A5A5;
        }
        .booking-calendar .react-calendar__month-view__weekdays abbr {
          text-decoration: none;
        }
        .booking-calendar .react-calendar__tile {
          padding: 0.6rem 0.4rem;
          background: transparent;
        }
        .booking-calendar .react-calendar__tile--now,
        .booking-calendar .react-calendar__tile--now:enabled {
          background: rgba(101, 85, 143, 0.10) !important;
          position: relative;
          padding-top: 1.1rem !important;
          border: 1px solid rgba(101, 85, 143, 0.30) !important;
        }
        .dark .booking-calendar .react-calendar__tile--now,
        .dark .booking-calendar .react-calendar__tile--now:enabled {
          background: rgba(101, 85, 143, 0.15) !important;
          border: 1px solid rgba(101, 85, 143, 0.35) !important;
        }
        .booking-calendar .react-calendar__tile--now:enabled:hover {
          background: rgba(101, 85, 143, 0.20) !important;
          position: relative;
          padding-top: 1.1rem !important;
        }
        .booking-calendar .react-calendar__tile--now:enabled:focus {
          background: rgba(101, 85, 143, 0.20) !important;
          position: relative;
          padding-top: 1.1rem !important;
        }
        .dark .booking-calendar .react-calendar__tile--now:enabled:hover,
        .dark .booking-calendar .react-calendar__tile--now:enabled:focus {
          background: rgba(101, 85, 143, 0.30) !important;
        }
        .booking-calendar .react-calendar__tile--now.react-calendar__tile--active,
        .booking-calendar .react-calendar__tile--now.react-calendar__tile--active:enabled,
        .booking-calendar .react-calendar__tile--now.react-calendar__tile--active:enabled:hover,
        .booking-calendar .react-calendar__tile--now.react-calendar__tile--active:enabled:focus {
          background: linear-gradient(135deg, #65558F 0%, #7AA49F 100%) !important;
          color: white !important;
          font-weight: 600;
          border: none !important;
        }
        .booking-today-label {
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 7px;
          font-weight: 700;
          color: #7AA49F;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          pointer-events: none;
        }
        .booking-calendar .react-calendar__tile--active,
        .booking-calendar .react-calendar__tile--active:enabled,
        .booking-calendar .react-calendar__tile--active:enabled:hover,
        .booking-calendar .react-calendar__tile--active:enabled:focus,
        .booking-calendar .react-calendar__tile--hasActive,
        .booking-calendar .react-calendar__tile--hasActive:enabled,
        .booking-calendar .react-calendar__tile--hasActive:enabled:hover,
        .booking-calendar .react-calendar__tile--hasActive:enabled:focus {
          background: linear-gradient(135deg, #65558F 0%, #7AA49F 100%) !important;
          color: white !important;
          font-weight: 600;
        }
        .booking-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #9CA3AF !important;
        }
        .dark .booking-calendar .react-calendar__month-view__days__day--neighboringMonth {
          color: #4B5563 !important;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(101, 85, 143, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(101, 85, 143, 0.6);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(101, 85, 143, 0.5);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(101, 85, 143, 0.7);
        }
        .form-slide-in {
          animation: slideUp 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(101, 85, 143, 0); }
          50%       { box-shadow: 0 0 0 8px rgba(101, 85, 143, 0.25); }
        }
        .cta-pulse {
          animation: ctaPulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Booking;
