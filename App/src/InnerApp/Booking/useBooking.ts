import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface AvailabilityResponse {
  availableTimes?: Array<number | string>;
  rawMinutes?: number[];
  message?: string;
  error?: string;
}

interface BookingResponse {
  message?: string;
  meetingId?: string;
  authUrl?: string;
  error?: string;
}

export interface BookingFormData {
  fullName: string;
  email: string;
  company: string;
  referralSource: string;
  referralSourceOther: string;
}

export type UseBookingReturn = {
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  addableTimes: number[];
  selectedValues: string[];
  setSelectedValues: (v: string[]) => void;
  selectedDate: string;
  selectedDateFormated: string;
  formatSelectedDate: (s: string) => string;
  formatTime: (m: number) => string;
  getAvailableTimeByDate: (v: Value) => Promise<void>;
  handleSelection: (v: string) => void;
  handleSubmit: (formData: BookingFormData) => Promise<void>;
};

export const useBooking = (): UseBookingReturn => {
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

  const formatSelectedDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
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

  const parseDisplayTimeToMinutes = (timeStr: string): number => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return NaN;
    let hours = parseInt(match[1], 10);
    const mins = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + mins;
  };

  const getAvailableTimeByDate = async (value: Value) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedValues([]);

    // JWT auth checks removed: backend no longer requires client-side token.

    try {
      const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
      (Date.prototype as any).getTimezoneOffset = function () {
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
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch availability.");
      }

      const data: AvailabilityResponse = await response.json();

      // Normalize times to minutes (numbers). Prefer rawMinutes if provided,
      // otherwise convert availableTimes entries (which may be strings like "9:00 AM").
      let normalizedTimes: number[] = [];
      if (Array.isArray((data as any).rawMinutes) && (data as any).rawMinutes.length > 0) {
        normalizedTimes = (data as any).rawMinutes.filter((n: any) => typeof n === "number");
      } else if (Array.isArray(data.availableTimes)) {
        normalizedTimes = data.availableTimes
          .map((t) => (typeof t === "number" ? t : parseDisplayTimeToMinutes(String(t))))
          .filter((n) => !Number.isNaN(n));
      }

      setAddableTimes(normalizedTimes);
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
    // Normalize any display time ("9:00 AM") into minutes string ("540").
    let normalizedValue = value;
    if (typeof value === "string" && (value.includes(":") || /AM|PM/i.test(value))) {
      const mins = parseDisplayTimeToMinutes(value);
      if (!Number.isNaN(mins)) {
        normalizedValue = String(mins);
      }
    }

    console.debug("handleSelection normalizedValue:", normalizedValue);

    setSelectedValues((prev) => {
      if (prev[0] === normalizedValue) {
        return [];
      } else {
        return [normalizedValue];
      }
    });
  };

  const handleSubmit = async (formData: BookingFormData) => {
    if (selectedValues.length === 0) {
      const errorMsg =
        "Please select at least one time slot before submitting.";
      toast.error(errorMsg);
      return;
    }

    // Client-side validation – all fields required
    if (!formData.fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return;
    }
    if (!formData.company.trim()) {
      toast.error("Company name is required.");
      return;
    }
    if (!formData.referralSource.trim()) {
      toast.error("Please select where you heard about us.");
      return;
    }
    if (
      formData.referralSource === "Other" &&
      !formData.referralSourceOther.trim()
    ) {
      toast.error("Please specify where you heard about us.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const selectedTimeMinutes = Number(selectedValues[0]);

      const payload = {
        date: selectedDate,
        time: String(
          Number.isFinite(selectedTimeMinutes) ? selectedTimeMinutes : 0
        ),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        company: formData.company.trim(),
        referralSource: formData.referralSource.trim(),
        referralSourceOther:
          formData.referralSource === "Other"
            ? formData.referralSourceOther.trim()
            : undefined,
        timezone: userTimezone,
      };

      console.debug("Booking payload:", payload);

      const response = await fetch(
        `${API_BASE_URL}/api/availability/booking/add-booking`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (response.status === 401) {
        const errorData: BookingResponse = await response.json();
        if (errorData.authUrl) {
          localStorage.setItem("pendingBooking", JSON.stringify(payload));
          window.location.href = errorData.authUrl;
          return;
        }
      }

      if (!response.ok) {
        const errorData: BookingResponse = await response.json();
        throw new Error(errorData.error || "Failed to save booking.");
      }

      const data: BookingResponse = await response.json();
      setSuccess(data.message || "Booking created successfully!");
      toast.success(data.message || "Booking created successfully!");
      setSelectedValues([]);

      if (data.meetingId) {
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
    formatSelectedDate,
    formatTime,
    getAvailableTimeByDate,
    handleSelection,
    handleSubmit,
  };
};
