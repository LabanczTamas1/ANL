import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { Link } from "react-router-dom";
import FlashMessage from "../../FlashMessage"; // Import the FlashMessage component

interface DayAvailability {
  day: string;
  openingTime: string;
  closingTime: string;
  isDayOff: boolean;
}

const Availability = () => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [flashMessage, setFlashMessage] = useState<{
    message: string;
    type: "success" | "error" | "info" | "warning";
  } | null>(null);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleChange = (day: string, newValue: number[], index: number) => {
    setAvailability((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              day: daysOfWeek[index],
              openingTime: formatTime(newValue[0]),
              closingTime: formatTime(newValue[1]),
            }
          : entry
      )
    );
  };

  const handleDragStart = (day: string) => {
    setIsDragging(day);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
  };

  const toggleDayOff = (day: string) => {
    setAvailability((prev) =>
      prev.map((entry) =>
        entry.day === day
          ? { ...entry, isDayOff: !entry.isDayOff }
          : entry
      )
    );
  };

  const saveAvailability = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
      const response = await fetch(
        `${API_BASE_URL}/api/availability/standard-availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ availableTimes: availability }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save availability.");
      }

      const data = await response.json();
      setSuccess(data.message || "Availability saved successfully!");
      setFlashMessage({
        message: data.message || "Availability saved successfully!",
        type: "success",
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMsg = err.message || "An error occurred while saving availability.";
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

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("authToken");

      if (!token) {
        const noTokenMessage = "No authentication token found.";
        setError(noTokenMessage);
        setFlashMessage({
          message: noTokenMessage,
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/availability/standard-availability`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch availability.");
        }

        const data: Record<string, { openingTime?: string; closingTime?: string; isDayOff?: boolean }> =
          await response.json();

        const formattedAvailability = Object.entries(data).map(([day, details], index) => ({
          day: daysOfWeek[index],
          openingTime: details.openingTime || "09:00",
          closingTime: details.closingTime || "17:00",
          isDayOff: details.isDayOff || false,
        }));

        setAvailability(formattedAvailability);
      } catch (err: unknown) {
        if (err instanceof Error) {
          const fetchError = err.message || "An error occurred while fetching availability.";
          setError(fetchError);
          setFlashMessage({
            message: fetchError,
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

    fetchAvailability();
  }, []);

  return (
    <div>
      {flashMessage && (
        <FlashMessage
        key={`${flashMessage.message}-${Date.now()}`} // Unique key for each instance
        message={flashMessage.message}
        type={flashMessage.type}
        duration={2000}
      />
      )}

      <div className="flex flex-row justify-around">
        <div className="flex flex-col items-center gap-6">
          <h2 className="font-bold text-[38px]">Standard availability</h2>
          {availability.map((dayAvailability, index) => (
            <div key={index} className="mb-6">
              <div className="flex flex-row justify-between">
                <h4 className="text-xl font-semibold">{dayAvailability.day}</h4>
                <div className="text-lg font-medium">
                  {dayAvailability.openingTime} - {dayAvailability.closingTime}
                </div>
              </div>
              <div className="w-[400px]">
                <Slider
                  value={[
                    parseTime(dayAvailability.openingTime),
                    parseTime(dayAvailability.closingTime),
                  ]}
                  onChange={(_event, newValue) =>
                    handleChange(dayAvailability.day, newValue as number[], index)
                  }
                  onMouseDown={() => handleDragStart(dayAvailability.day)}
                  onTouchStart={() => handleDragStart(dayAvailability.day)}
                  onChangeCommitted={handleDragEnd}
                  valueLabelDisplay={isDragging === dayAvailability.day ? "on" : "off"}
                  min={0}
                  max={1440}
                  step={15}
                  valueLabelFormat={(value) => formatTime(value)}
                  getAriaLabel={() => `${dayAvailability.day} time range`}
                  sx={{
                    color: "#65558F",
                    "& .MuiSlider-thumb": {
                      "&:hover, &.Mui-focusVisible, &.Mui-active": {
                        boxShadow: "0 0 0 8px rgba(101, 85, 143, 0.16)",
                      },
                    },
                  }}
                  disabled={dayAvailability.isDayOff}
                />
              </div>
              <button
                onClick={() => toggleDayOff(dayAvailability.day)}
                className={`mt-2 border-2 px-4 py-2 rounded ${
                  dayAvailability.isDayOff ? "bg-red-500 text-white" : "bg-green-500 text-white"
                }`}
              >
                {dayAvailability.isDayOff ? "Mark as Available" : "Mark as Day Off"}
              </button>
            </div>
          ))}
          <button
            onClick={saveAvailability}
            disabled={isLoading}
            className={`border-2 border-[#1D2431] bg-[#65558F] w-full h-[50px] text-white 
                hover:bg-[#4a3c6b] active:bg-[#392b4e] focus:outline-none focus:ring-2 focus:ring-[#65558F]
                transition-all duration-300 ease-in-out ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
          >
            {isLoading ? "Saving..." : "Save Availability"}
          </button>
        </div>
        <div className="flex flex-col items-center p-4">
      <h1 className="text-lg font-semibold mb-4">Custom availability</h1>
      <div className="space-y-4 w-full max-w-sm">
        <Link
          to="/home/booking/availability/add-availability"
          className="flex items-center justify-center w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition"
        >
          <span className="mr-2">+</span>Add availability
        </Link>
        <Link
          to="/home/booking/availability/delete-availability"
          className="flex items-center justify-center w-full bg-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-purple-700 transition"
        >
          <span className="mr-2">🗑️</span>Delete availability
        </Link>
      </div>
    </div>
      </div>
    </div>
  );
};

export default Availability;
