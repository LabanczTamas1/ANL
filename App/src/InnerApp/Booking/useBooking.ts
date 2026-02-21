import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export const useBooking = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addableTimes, setAddableTimes] = useState<number[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedDateFormated, setSelectedDateFormated] = useState("");

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

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  const parseDisplayTimeToHHMM = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 100 + mins;
  };

  const getAvailableTimeByDate = async (value: Value) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedValues([]);

    const token = localStorage.getItem("authToken");
    if (!token) {
      const errorMsg = "No authentication token found.";
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return;
    }

    try {
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      Date.prototype.getTimezoneOffset = function () {
        return +15000;
      };
      const dynamicTime = new Date(
        new Date().getTime() + new Date().getTimezoneOffset() * 60000
      );
      Date.prototype.getTimezoneOffset = originalGetTimezoneOffset;

      const dateValue = Array.isArray(value) ? value[0] : value;
      setSelectedDateFormated(formatSelectedDate(dateValue?.toString() ?? ""));
      const formattedDate = dateValue
        ? `${dateValue.getFullYear()}-${String(
            dateValue.getMonth() + 1
          ).padStart(2, "0")}-${String(dateValue.getDate()).padStart(2, "0")}`
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
      setAddableTimes(data.availableTimes || []);
      setSuccess(data.message || "Availability fetched successfully!");
      if (data.message !== undefined) {
        toast.warning(data.message || "Availability fetched successfully!");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMsg =
          err.message || "An error occurred while fetching availability.";
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const unknownError = "An unknown error occurred.";
        setError(unknownError);
        toast.error(unknownError);
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

  const handleSubmit = async (userDetails: {
    email: string;
    firstName?: string;
    lastName?: string;
    company?: string;
  }) => {
    if (selectedValues.length === 0) {
      const errorMsg =
        "Please select at least one time slot before submitting.";
      toast.error(errorMsg);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      function getCookie(name: string) {
        const match = document.cookie.match(
          new RegExp("(^| )" + name + "=([^;]+)")
        );
        return match ? match[2] : null;
      }

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const selectedTimeHHMM = parseDisplayTimeToHHMM(selectedValues[0]);

      const payload = {
        date: selectedDate,
        time: String(selectedTimeHHMM),
        email: userDetails.email,
        timezone: userTimezone,
        language: getCookie("app-language") || "english",
        fullName: `${userDetails.firstName || ""} ${userDetails.lastName || ""}`.trim(),
        company: userDetails.company || undefined,
      } as any;

      const response = await fetch(
        `${API_BASE_URL}/api/availability/booking/add-booking`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.authUrl) {
          const bookingDetails = {
            ...payload,
          };
          localStorage.setItem(
            "pendingBooking",
            JSON.stringify(bookingDetails)
          );
          window.location.href = errorData.authUrl;
          return;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save availability.");
      }

      const data = await response.json();
      setSuccess(data.message || "Availability added successfully!");
      toast.success(data.message || "Availability added successfully!");
      setSelectedValues([]);

      if (
        data.message === "Availability saved successfully" &&
        data.meetingId
      ) {
        setTimeout(() => {
          navigate(`/home/successful-booking?meetingId=${data.meetingId}`);
        }, 500);
      } else {
        setTimeout(() => {
          navigate("/home/successful-booking");
        }, 500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        const unknownError = "An unknown error occurred.";
        setError(unknownError);
        toast.error(unknownError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currentDate,
    setCurrentDate,
    isLoading,
    error,
    success,
    addableTimes,
    selectedValues,
    setSelectedValues,
    selectedDate,
    selectedDateFormated,
    fullName,
    formatSelectedDate,
    formatTime,
    getAvailableTimeByDate,
    handleSelection,
    handleSubmit,
  };
};
