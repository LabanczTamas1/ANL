import React, { useState, useEffect, useRef } from "react";
import Slider from "@mui/material/Slider";
import { Link } from "react-router-dom";
import FlashMessage from "../../FlashMessage";

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
  const [originalAvailability, setOriginalAvailability] = useState<DayAvailability[]>([]);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  // Compare current availability with original to check for changes
  const checkForChanges = (current: DayAvailability[], original: DayAvailability[]) => {
    if (current.length !== original.length) return true;
    
    for (let i = 0; i < current.length; i++) {
      const curr = current[i];
      const orig = original[i];
      
      if (
        curr.openingTime !== orig.openingTime ||
        curr.closingTime !== orig.closingTime ||
        curr.isDayOff !== orig.isDayOff
      ) {
        return true;
      }
    }
    
    return false;
  };

  const handleChange = (day: string, newValue: number[], index: number) => {
    setAvailability((prev) => {
      const updated = prev.map((entry) =>
        entry.day === day
          ? {
              ...entry,
              day: daysOfWeek[index],
              openingTime: formatTime(newValue[0]),
              closingTime: formatTime(newValue[1]),
            }
          : entry
      );
      
      // Check if the updated state differs from original
      const hasChanges = checkForChanges(updated, originalAvailability);
      setHasUnsavedChanges(hasChanges);
      
      return updated;
    });
  };

  const handleDragStart = (day: string) => {
    setIsDragging(day);
  };

  const handleDragEnd = () => {
    setIsDragging(null);
  };

  const toggleDayOff = (day: string) => {
    setAvailability((prev) => {
      const updated = prev.map((entry) =>
        entry.day === day
          ? { ...entry, isDayOff: !entry.isDayOff }
          : entry
      );
      
      // Check if the updated state differs from original
      const hasChanges = checkForChanges(updated, originalAvailability);
      setHasUnsavedChanges(hasChanges);
      
      return updated;
    });
  };

  const toggleMobileModal = () => {
    setShowMobileModal(!showMobileModal);
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
      
      // Update original availability to match current
      setOriginalAvailability([...availability]);
      setHasUnsavedChanges(false);
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

  // Reset changes to original values
  const resetChanges = () => {
    setAvailability([...originalAvailability]);
    setHasUnsavedChanges(false);
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
        // Store original availability for comparison
        setOriginalAvailability(JSON.parse(JSON.stringify(formattedAvailability)));
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

  // Close modal when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById("custom-availability-modal");
      const bubble = document.getElementById("custom-availability-bubble");
      
      if (
        showMobileModal &&
        modal &&
        bubble &&
        !modal.contains(event.target as Node) &&
        !bubble.contains(event.target as Node)
      ) {
        setShowMobileModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileModal]);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 relative">
      {flashMessage && (
        <FlashMessage
          key={`${flashMessage.message}-${Date.now()}`}
          message={flashMessage.message}
          type={flashMessage.type}
          duration={2000}
        />
      )}
      <div className="hidden 2xl:block">
        <div className="fixed top-30 right-8 w-80 z-50">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 pb-2 border-b border-gray-200">
              Custom Availability 
            </h2>

            <div className="space-y-4">
              <Link
                to="/home/booking/availability/add-availability"
                className="flex items-center justify-center w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Availability
              </Link>

              <Link
                to="/home/booking/availability/delete-availability"
                className="flex items-center justify-center w-full bg-white border border-purple-600 text-purple-600 font-medium py-3 px-4 rounded-lg hover:bg-purple-50 transition-all shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Delete Availability
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Manage Your Availability</h1>

        <div className="flex flex-col lg:flex-row gap-8 relative">
          {/* Standard Availability Section - Centered */}
          <div className="flex-1 bg-white rounded-xl shadow-md p-6 md:mx-auto md:max-w-3xl">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 pb-2 border-b border-gray-200 text-center">
              Standard Availability
            </h2>
            
            {/* Unsaved Changes Notification */}
            {hasUnsavedChanges && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md animate-fade-in">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      You have unsaved changes. Please save your changes using the button below.
                    </p>
                  </div>
                  <div className="ml-auto pl-3">
                    <div className="-mx-1.5 -my-1.5">
                      <button
                        onClick={resetChanges}
                        className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-8">
              {availability.map((dayAvailability, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg transition-all ${
                    dayAvailability.isDayOff 
                      ? "bg-red-50 border border-red-200" 
                      : "bg-purple-50 border border-purple-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">
                      {dayAvailability.day}
                    </h3>
                    <div className="text-md font-medium px-3 py-1 rounded-full bg-white shadow-sm">
                      {dayAvailability.isDayOff 
                        ? "Day Off" 
                        : `${dayAvailability.openingTime} - ${dayAvailability.closingTime}`}
                    </div>
                  </div>
                  
                  <div className="px-2 py-4">
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
                        color: dayAvailability.isDayOff ? "#ef4444" : "#8b5cf6",
                        height: 8,
                        "& .MuiSlider-track": {
                          border: "none",
                        },
                        "& .MuiSlider-thumb": {
                          height: 24,
                          width: 24,
                          backgroundColor: "#fff",
                          border: dayAvailability.isDayOff ? "2px solid #ef4444" : "2px solid #8b5cf6",
                          "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                            boxShadow: dayAvailability.isDayOff 
                              ? "0 0 0 8px rgba(239, 68, 68, 0.16)" 
                              : "0 0 0 8px rgba(139, 92, 246, 0.16)",
                          },
                        },
                        "& .MuiSlider-valueLabel": {
                          lineHeight: 1.2,
                          fontSize: 12,
                          background: dayAvailability.isDayOff ? "#ef4444" : "#8b5cf6",
                          padding: "4px 8px",
                          borderRadius: "4px",
                        },
                      }}
                      disabled={dayAvailability.isDayOff}
                    />
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => toggleDayOff(dayAvailability.day)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all 
                        ${dayAvailability.isDayOff 
                          ? "bg-green-500 hover:bg-green-600 text-white" 
                          : "bg-red-500 hover:bg-red-600 text-white"
                        }`}
                    >
                      {dayAvailability.isDayOff ? "Mark as Available" : "Mark as Day Off"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={saveAvailability}
                disabled={isLoading || !hasUnsavedChanges}
                className={`flex-1 py-3 rounded-lg font-medium text-white shadow-md transition-all
                  ${isLoading 
                    ? "bg-purple-400 cursor-not-allowed" 
                    : hasUnsavedChanges
                      ? "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
                      : "bg-purple-300 cursor-not-allowed"
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Availability"
                )}
              </button>
              
              {hasUnsavedChanges && (
                <button
                  onClick={resetChanges}
                  disabled={isLoading}
                  className="sm:w-1/3 py-3 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Mobile Floating Bubble */}
          <div 
            id="custom-availability-bubble"
            className="lg:hidden fixed bottom-6 right-6 z-40"
            onClick={toggleMobileModal}
          >
            <button 
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full py-3 px-4 shadow-lg"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <span className="font-medium">Custom availability</span>
            </button>
          </div>

          {/* Mobile Custom Availability Modal */}
          {showMobileModal && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center pb-6">
              <div 
                id="custom-availability-modal"
                className="bg-white w-full max-w-md rounded-t-xl p-6 animate-slide-up"
                style={{
                  maxHeight: "80vh",
                  overflowY: "auto"
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-purple-800">Custom Availability</h2>
                  <button 
                    onClick={toggleMobileModal}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <Link
                    to="/home/booking/availability/add-availability"
                    className="flex items-center w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-purple-700 transition-all"
                    onClick={toggleMobileModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Custom Availability
                  </Link>
                  
                  <Link
                    to="/home/booking/availability/delete-availability"
                    className="flex items-center w-full bg-white border border-purple-600 text-purple-600 font-medium py-3 px-4 rounded-lg hover:bg-purple-50 transition-all"
                    onClick={toggleMobileModal}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Delete Custom Availability
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation for Modal and Notification */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Availability;