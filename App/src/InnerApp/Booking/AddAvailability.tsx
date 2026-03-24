import React, { useState } from "react";
import "react-calendar/dist/Calendar.css";
import { Clock, Plus } from "lucide-react";
import darkLogo from "/public/dark-logo.png";
import lightLogo from "/public/light-logo.png";
import ThemeIcon from "../components/Logo";
import BookingPageLayout from "../components/BookingPageLayout";
import BookingCalendar from "../components/BookingCalendar";
import TimeSlotList from "../components/TimeSlotList";
import GlassInfoCard from "../components/GlassInfoCard";
import GradientButton from "../components/GradientButton";
import { ToastContainer, Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

const AddAvailability = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarValue, setCalendarValue] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addableTimes, setAddableTimes] = useState<number[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedDateFormatted, setSelectedDateFormatted] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  const formatSelectedDate = (date: Date): string =>
    new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);

  const getAvailableTimeByDate = async (value: Value) => {
    setIsLoading(true);
    setSelectedValues([]);

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No authentication token found.");
      setIsLoading(false);
      return;
    }

    try {
      const dateValue = Array.isArray(value) ? value[0] : value;
      if (dateValue) setSelectedDateFormatted(formatSelectedDate(dateValue));
      const formattedDate = dateValue ? dateValue.toISOString().split("T")[0] : "";

      const response = await fetch(
        `${API_BASE_URL}/api/availability/add-availability/${formattedDate}`,
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
      setAddableTimes(data.unavailableTimes || []);
      if (data.message) toast.info(data.message);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelection = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleSubmit = async () => {
    if (selectedValues.length === 0) {
      toast.error("Please select at least one time slot before submitting.");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Authentication token is missing.");

      const localDate = currentDate.toLocaleDateString("en-CA");

      const response = await fetch(
        `${API_BASE_URL}/api/availability/add-availability-to-the-database`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date: localDate, times: selectedValues }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save availability.");
      }

      const data = await response.json();
      toast.success(data.message || "Availability added successfully!");
      setSelectedValues([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BookingPageLayout>
      {/* Left Panel - Info */}
      <div className="flex flex-col py-5 px-5 md:px-6 w-full lg:w-[280px] lg:min-w-[260px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-line-glass bg-gradient-to-br from-brand/10 to-transparent lg:overflow-y-auto lg:custom-scrollbar">
        <ThemeIcon
          lightIcon={<img src={darkLogo} alt="Light Logo" className="h-10 w-10" />}
          darkIcon={<img src={lightLogo} alt="Dark Logo" className="h-10 w-10" />}
          size="l"
          ariaLabel="ANL logo"
        />

        <div className="mt-4">
          <h3 className="font-bold text-xl md:text-2xl text-content-inverse mb-2">
            Add Availability
          </h3>
          <p className="text-content-subtle-inverse mb-4 text-xs md:text-sm leading-relaxed">
            Add time slots that are not part of the current standard availability or were previously deleted.
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <GlassInfoCard
            icon={<Clock className="w-4 h-4 text-white" />}
            gradient="from-accent-teal to-brand"
          >
            Add 1 hour per selected entry
          </GlassInfoCard>
          <GlassInfoCard
            icon={<Plus className="w-4 h-4 text-white" />}
            gradient="from-status-success to-accent-teal"
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} slot${selectedValues.length > 1 ? "s" : ""} selected`
              : "Select slots to add"}
          </GlassInfoCard>
          {selectedDateFormatted && (
            <GlassInfoCard
              icon={<Clock className="w-4 h-4 text-white" />}
              gradient="from-brand to-accent-teal"
            >
              {selectedDateFormatted}
            </GlassInfoCard>
          )}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="min-w-0 p-4 md:p-6 border-b lg:border-b-0 lg:border-r border-line-glass flex flex-col lg:flex-1 lg:min-h-0">
        <div className="lg:flex-1 lg:min-h-0">
          <BookingCalendar
            value={calendarValue}
            activeStartDate={currentDate}
            onChange={(value: Value) => {
              const dateValue = Array.isArray(value) ? value[0] : value;
              setCalendarValue(dateValue);
              if (dateValue) setCurrentDate(dateValue);
              setSelectedValues([]);
              getAvailableTimeByDate(value);
            }}
            onActiveStartDateChange={(d) => setCurrentDate(d)}
          />
        </div>
      </div>

      {/* Time Slots Section */}
      <div className="flex flex-col w-full lg:w-[280px] lg:min-w-[260px] lg:shrink-0 p-4 md:p-5 lg:overflow-hidden">
        <TimeSlotList
          times={addableTimes}
          selectedValues={selectedValues}
          multiSelect
          onSelect={handleSelection}
          formatTime={formatTime}
          emptyLabel="Pick a date to see addable slots"
          title="Addable Time Slots"
        />

        {addableTimes.length > 0 && (
          <GradientButton
            className="mt-3"
            fullWidth
            loading={isLoading}
            loadingText="Adding..."
            disabled={selectedValues.length === 0}
            onClick={handleSubmit}
          >
            Add Selected ({selectedValues.length})
          </GradientButton>
        )}
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
    </BookingPageLayout>
  );
};

export default AddAvailability;
