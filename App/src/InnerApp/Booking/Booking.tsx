import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import FlashMessage from "../../FlashMessage";
import { useNavigate } from "react-router-dom";
import darkLogo from "/public/dark-logo.png";
import { Calendar as CalendarIcon, Clock, Video } from "lucide-react";
import { useLanguage } from '../../hooks/useLanguage';

const Booking = () => {
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  
  const { t } = useLanguage();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addableTimes, setAddableTimes] = useState<number[]>([]);
  const [flashMessage, setFlashMessage] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateFormated, setSelectedDateFormated] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const firstName = localStorage.getItem("firstName") || "";
  const lastName = localStorage.getItem("lastName") || "";
  const fullName = `${firstName} ${lastName}`.trim();

  const formatSelectedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Helper function to format time from minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert 24-hour to 12-hour
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  const getAvailableTimeByDate = async (value: Value) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedValues([]); // Reset selected times when the date changes

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found.");
      setFlashMessage({
        message: "No authentication token found.",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      console.log(
        `[${new Date().toISOString().split("T")[0]}, UTC${
          -new Date().getTimezoneOffset() / 60 >= 0 ? "+" : ""
        }${-new Date().getTimezoneOffset() / 60}, ${new Date()
          .toISOString()
          .split("T")[1]
          .slice(0, 5)}]`
      );
      console.log(
        `[${new Date().toISOString().split("T")[0]}, UTC${
          -new Date().getTimezoneOffset() / 60 >= 0 ? "+" : ""
        }${-new Date().getTimezoneOffset() / 60}, ${new Date()
          .getHours()
          .toString()
          .padStart(2, "0")}:${new Date()
          .getMinutes()
          .toString()
          .padStart(2, "0")}]`
      );

      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;

      // Override the method for testing
      Date.prototype.getTimezoneOffset = function () {
        return +15000;
      };

      const dynamicTime = new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60000
      );
      console.log(
        `[${dynamicTime.toISOString().split("T")[0]}, UTC${
          -dynamicTime.getTimezoneOffset() / 60 >= 0 ? "+" : ""
        }${-dynamicTime.getTimezoneOffset() / 60}, ${dynamicTime
          .getHours()
          .toString()
          .padStart(2, "0")}:${dynamicTime
          .getMinutes()
          .toString()
          .padStart(2, "0")}]`
      );

      // Restore the original method after testing
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;

      const dateValue = Array.isArray(value) ? value[0] : value;
      setSelectedDateFormated(formatSelectedDate(dateValue?.toString() ?? ""));
      console.log("before format:", dateValue);
      const formattedDate = dateValue
  ? `${dateValue.getFullYear()}-${String(dateValue.getMonth() + 1).padStart(2, '0')}-${String(dateValue.getDate()).padStart(2, '0')}`
  : "";
      setSelectedDate(formattedDate);

      const currentTime = `[${new Date().toISOString().split("T")[0]}, UTC${
        -new Date().getTimezoneOffset() / 60 >= 0 ? "+" : ""
      }${-new Date().getTimezoneOffset() / 60}, ${new Date()
        .getHours()
        .toString()
        .padStart(2, "0")}:${new Date()
        .getMinutes()
        .toString()
        .padStart(2, "0")}]`;

        console.log(currentTime);

      const response = await fetch(
        `${API_BASE_URL}/api/availability/show-available-times/${formattedDate}?current_time=${encodeURIComponent(
          currentTime
        )}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch availability.");
      }

      const data = await response.json();
      setAddableTimes(data.availableTimes || []); // Assuming the response data has availableTimes
      setSuccess(data.message || "Availability fetched successfully!");
      console.log(data.message);
      if (data.message !== undefined) {
        setFlashMessage({
          message: data.message || "Availability fetched successfully!",
          type: "warning",
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMsg =
          err.message || "An error occurred while fetching availability.";
        setError(errorMsg);
        setFlashMessage({
          message: errorMsg,
          type: "error",
        });
      } else {
        const unknownError = "An unknown error occurred.";
        setError(unknownError);
        setFlashMessage({
          message: unknownError,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelection = (value: string) => {
    setSelectedValues((prev) => {
      if (prev[0] === value) {
        return [];
      } else {
        return [value];
      }
    });
  };
  

  const handleSubmit = async () => {
    if (selectedValues.length === 0) {
      setFlashMessage({
        message: "Please select at least one time slot before submitting.",
        type: "error",
      });
      return;
    }
    
    console.log(currentDate, selectedValues);
    
    try {
      setIsLoading(true); // Start loading
      setError(null);
      setSuccess(null);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token is missing.");
      }
      console.log(selectedValues);

      function getCookie(name: string) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      }
      
      
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(
        `${API_BASE_URL}/api/availability/booking/add-booking`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Include authorization token if required
            "Content-Type": "application/json", // Indicate JSON payload
          },
          body: JSON.stringify({
            date: selectedDate, // Send selected date
            times: selectedValues, // Send selected times
            email: "deid.unideb@gmail.com", // Send email
            timezone: userTimezone, // Send user's timezone
            language: getCookie('app-language') || 'english',
          }),
          credentials: "include", // Include credentials (cookies or session information)
        }
      );
      
      if (response.status === 401) {
        const errorData = await response.json();
        // If authentication is required, redirect to Google OAuth
        if (errorData.authUrl) {
          // Store booking details in localStorage before redirecting
          const bookingDetails = {
            date: selectedDate,
            times: selectedValues,
            email: "deid.unideb@gmail.com",
            timezone: userTimezone
          };
          localStorage.setItem("pendingBooking", JSON.stringify(bookingDetails));
          
          window.location.href = errorData.authUrl; // Redirect to Google OAuth URL
          return;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save availability.");
      }
      
      const data = await response.json();
      setSuccess(data.message || "Availability added successfully!");
      setFlashMessage({
        message: data.message || "Availability added successfully!",
        type: "success",
      });
      setSelectedValues([]); // Reset selected values after successful submission
      
      // Navigate to successful booking page with meeting ID
      if (data.message === "Availability saved successfully" && data.meetingId) {
        setTimeout(() => {
          navigate(`/home/successful-booking?meetingId=${data.meetingId}`);
        }, 500);
      } else {
        // Fallback to the original behavior if no meetingId is provided
        setTimeout(() => {
          navigate("/home/successful-booking");
        }, 500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setFlashMessage({
          message: err.message,
          type: "error",
        });
      } else {
        const unknownError = "An unknown error occurred.";
        setError(unknownError);
        setFlashMessage({
          message: unknownError,
          type: "error",
        });
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  

  return (
    <div className="flex justify-center items-center md:h-full p-4">
      <div className="flex flex-col md:flex-row max-w-[1500px] justify-center border-2 rounded-lg border-gray-300 md:w-full">
        <div className="flex flex-col py-6 px-4 w-full md:w-[30%]">
          <img src={darkLogo} alt="Logo" className="h-8 w-16" />
          <p className="pb-3">{fullName}</p>
          <h3 className="font-bold text-lg md:text-2xl">{t('meetWithTitle')}</h3>
          <p className="text-wrap mb-3 text-sm md:text-base">
            {t('bookingDescription')}
          </p>
          <div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>{selectedDateFormated || "\u00A0"}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>{t('meetingDuration')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <Video className="w-5 h-5 text-blue-600" />
              <span>{t('googleMeet')}</span>
            </div>
          </div>
        </div>
        <div className="px-3 border-x-2 h-[400px] md:h-[500px] w-full md:w-auto">
          <Calendar
            className="!bg-white p-4 !w-full !h-[400px] md:!h-[500px] !border-none dark:!bg-[#121212]"
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
        <div className="flex flex-col p-3 border-black w-full md:w-[30%] h-full">
          <div className="text-sm md:text-base">{selectedDateFormated || "\u00A0"}</div>
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
              <div className="w-full py-1 text-center text-sm md:text-base">{t('pickADate')}</div>
            )}
          </ul>
          {addableTimes.length > 0 && (
            <button
              className="mt-3 px-4 md:px-6 py-2 bg-[#65558F] text-white font-bold rounded-lg hover:bg-[#9c81db] disabled:bg-gray-400 w-full"
              onClick={handleSubmit}
              disabled={selectedValues.length === 0}
            >
              {t('submit')}
            </button>
          )}
        </div>
      </div>
      {flashMessage && (
        <FlashMessage
          key={`${flashMessage.message}-${Date.now()}`}
          message={flashMessage.message}
          type={flashMessage.type}
          duration={2000}
        />
      )}
    </div>
  );
  
};

export default Booking;
