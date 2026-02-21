import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import darkLogo from "/public/dark-logo.png";
import lightLogo from "/public/light-logo.png";
import { Calendar as CalendarIcon, Clock, Video } from "lucide-react";
import { useLanguage } from "../../hooks/useLanguage";
import ThemeIcon from "../components/Logo";
import { ToastContainer, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useBooking } from "./useBooking";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

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
    fullName,
    formatTime,
    getAvailableTimeByDate,
    handleSelection,
    handleSubmit,
  } = useBooking();

  const [showForm, setShowForm] = React.useState(false);
  const [email, setEmail] = React.useState( localStorage.getItem("email") || "" );
  const [firstName, setFirstName] = React.useState(
    localStorage.getItem("firstName") || ""
  );
  const [lastName, setLastName] = React.useState(
    localStorage.getItem("lastName") || ""
  );
  const [company, setCompany] = React.useState("");
  const selectedTime = selectedValues[0]
    ? formatTime(Number(selectedValues[0]))
    : "";
  const displayName = `${firstName || localStorage.getItem("firstName") || ""} ${lastName || localStorage.getItem("lastName") || ""}`.trim() || fullName;

  return (
    <div className="flex justify-center items-center md:h-full p-4">
      <div className="flex flex-col xl:flex-row max-w-[1500px] dark:bg-[#1F2937] justify-center border-2 rounded-lg border-gray-300 md:w-full">
        <div className="flex flex-col py-6 px-4 w-full xl:w-[30%] border-b-2 xl:border-b-0">
          <ThemeIcon
            lightIcon={<img src={darkLogo} alt="Light Logo" />}
            darkIcon={<img src={lightLogo} alt="Dark Logo" />}
            size="l"
            ariaLabel="ANL logo"
          />
          <p className="pb-3">{fullName}</p>
          <h3 className="font-bold text-lg md:text-2xl">
            {t("meetWithTitle")}
          </h3>
          <p className="text-wrap mb-3 text-sm md:text-base">
            {t("bookingDescription")}
          </p>
          <div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>
                {selectedDateFormated
                  ? `${selectedDateFormated}${selectedTime ? ` · ${selectedTime}` : ""}`
                  : "\u00A0"}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{t("meetingDuration")}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <Video className="w-5 h-5 text-blue-600" />
              <span>{t("googleMeet")}</span>
            </div>

            {(displayName || company || email) && (
              <div className="mt-2 space-y-1">
                {displayName && (
                  <div className="text-sm">
                    <span className="font-semibold">{t("name") || "Name"}:</span> {displayName}
                  </div>
                )}
                {company && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{t("company") || "Company"}:</span> {company}
                  </div>
                )}
                {email && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{t("email") || "Email"}:</span> {email}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {!showForm && (
          <div className="px-3 border-t-2 xl:border-t-0 xl:border-x-2 h-[400px] md:h-[500px] w-full xl:w-auto">
            <Calendar
              className="!bg-white p-4 !w-full !h-[400px] md:!h-[500px] !border-none dark:!bg-[#1F2937]"
              tileClassName="hover:!bg-[#d8bfd8] !h-[50%] transition duration-200 !rounded-md focus:!bg-[#65558F] focus:!text-white"
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
            />
          </div>
        )}
        <div className="flex flex-col p-3 w-full xl:w-[30%] h-full border-t-2 xl:border-t-0">
          {!showForm && (
            <ul className="overflow-y-auto h-full max-h-[300px] md:max-h-[400px]">
              {addableTimes.length > 0 ? (
                addableTimes.map((timeInMinutes, index) => (
                  <li key={index} className="w-full py-1">
                    <button
                      key={timeInMinutes}
                      className={`w-full px-3 md:px-4 py-2 rounded-lg text-black font-semibold border-2 text-sm md:text-base ${
                        selectedValues.includes(timeInMinutes.toString())
                          ? "bg-[#65558F] text-white"
                          : "bg-white hover:bg-gray-400"
                      }`}
                      onClick={() => handleSelection(timeInMinutes.toString())}
                    >
                      {formatTime(timeInMinutes)}
                    </button>
                  </li>
                ))
              ) : (
                <div className="w-full py-1 text-center text-sm md:text-base">
                  {t("pickADate")}
                </div>
              )}
            </ul>
          )}
          {addableTimes.length > 0 && !showForm && (
            <button
              className="mt-3 px-4 md:px-6 py-2 bg-[#65558F] text-white font-bold rounded-lg hover:bg-[#9c81db] disabled:bg-gray-400 w-full"
              onClick={() => setShowForm(true)}
              disabled={selectedValues.length === 0}
            >
              {t("continue") || "Continue"}
            </button>
          )}

          {showForm && (
            <div className="mt-3 p-3 bg-white rounded-lg dark:bg-gray-800">
              <div className="mb-2">
                <label className="block text-sm">{t("email") || "Email"}</label>
                <input
                  className="w-full p-2 border rounded"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                />
              </div>
              <div className="mb-2 flex space-x-2">
                <div className="flex-1">
                  <label className="block text-sm">{t("firstName") || "First name"}</label>
                  <input
                    className="w-full p-2 border rounded"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    type="text"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm">{t("lastName") || "Last name"}</label>
                  <input
                    className="w-full p-2 border rounded"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    type="text"
                  />
                </div>
              </div>
              <div className="mb-2">
                <label className="block text-sm">{t("company") || "Company"}</label>
                <input
                  className="w-full p-2 border rounded"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  type="text"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 px-4 py-2 bg-[#65558F] text-white font-bold rounded-lg hover:bg-[#9c81db] disabled:bg-gray-400"
                  onClick={() =>
                    handleSubmit({
                      email,
                      firstName,
                      lastName,
                      company,
                    })
                  }
                  disabled={!email || isLoading}
                >
                  {isLoading ? t("sending") || "Sending..." : t("submit")}
                </button>
                <button
                  className="flex-1 px-4 py-2 border rounded-lg"
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
        theme="light"
        transition={Bounce}
      />
    </div>
  );
};

export default Booking;
