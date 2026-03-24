import React, { useState, useEffect } from "react";
import Slider from "@mui/material/Slider";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Calendar as CalendarIcon,
  AlertTriangle,
  X,
} from "lucide-react";
import darkLogo from "/public/dark-logo.png";
import lightLogo from "/public/light-logo.png";
import ThemeIcon from "../components/Logo";
import GradientButton from "../components/GradientButton";
import { ToastContainer, Bounce, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const checkForChanges = (current: DayAvailability[], original: DayAvailability[]) => {
    if (current.length !== original.length) return true;
    for (let i = 0; i < current.length; i++) {
      if (
        current[i].openingTime !== original[i].openingTime ||
        current[i].closingTime !== original[i].closingTime ||
        current[i].isDayOff !== original[i].isDayOff
      ) return true;
    }
    return false;
  };

  const handleChange = (day: string, newValue: number[], index: number) => {
    setAvailability((prev) => {
      const updated = prev.map((entry) =>
        entry.day === day
          ? { ...entry, day: daysOfWeek[index], openingTime: formatTime(newValue[0]), closingTime: formatTime(newValue[1]) }
          : entry
      );
      setHasUnsavedChanges(checkForChanges(updated, originalAvailability));
      return updated;
    });
  };

  const toggleDayOff = (day: string) => {
    setAvailability((prev) => {
      const updated = prev.map((entry) =>
        entry.day === day ? { ...entry, isDayOff: !entry.isDayOff } : entry
      );
      setHasUnsavedChanges(checkForChanges(updated, originalAvailability));
      return updated;
    });
  };

  const saveAvailability = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("No authentication token found.");
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
      toast.success(data.message || "Availability saved successfully!");
      setOriginalAvailability(JSON.parse(JSON.stringify(availability)));
      setHasUnsavedChanges(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetChanges = () => {
    setAvailability(JSON.parse(JSON.stringify(originalAvailability)));
    setHasUnsavedChanges(false);
  };

  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast.error("No authentication token found.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/availability/standard-availability`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch availability.");
        }

        const data: Record<string, { openingTime?: string; closingTime?: string; isDayOff?: boolean }> =
          await response.json();

        const formattedAvailability = Object.entries(data).map(([, details], index) => ({
          day: daysOfWeek[index],
          openingTime: details.openingTime || "09:00",
          closingTime: details.closingTime || "17:00",
          isDayOff: details.isDayOff || false,
        }));

        setAvailability(formattedAvailability);
        setOriginalAvailability(JSON.parse(JSON.stringify(formattedAvailability)));
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Close mobile modal on outside click
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMobileModal]);

  return (
    <div className="h-full bg-surface-overlay flex flex-col relative overflow-y-auto custom-scrollbar">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col items-center w-full p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="w-full max-w-4xl flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ThemeIcon
              lightIcon={<img src={darkLogo} alt="Light Logo" className="h-8 w-8" />}
              darkIcon={<img src={lightLogo} alt="Dark Logo" className="h-8 w-8" />}
              size="m"
              ariaLabel="ANL logo"
            />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-content-inverse">
                Manage Availability
              </h1>
              <p className="text-xs text-content-subtle-inverse">Set your standard weekly schedule</p>
            </div>
          </div>

          {/* Desktop Custom Availability links */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/home/booking/availability/add-availability"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                bg-surface-elevated/50 border border-line-glass text-content-inverse
                hover:bg-brand/20 hover:border-brand/30 transition-all duration-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Custom
            </Link>
            <Link
              to="/home/booking/availability/delete-availability"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                bg-surface-elevated/50 border border-line-glass text-content-inverse
                hover:bg-status-error/20 hover:border-status-error/30 transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Custom
            </Link>
          </div>
        </div>

        {/* Unsaved changes banner */}
        {hasUnsavedChanges && (
          <div className="w-full max-w-4xl mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-status-warning/10 border border-status-warning/30 unsaved-slide-in">
            <AlertTriangle className="w-4 h-4 text-status-warning shrink-0" />
            <p className="text-xs text-status-warning flex-1">
              You have unsaved changes. Save or discard them below.
            </p>
            <button
              onClick={resetChanges}
              className="p-1 rounded-md hover:bg-status-warning/20 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-status-warning" />
            </button>
          </div>
        )}

        {/* Availability cards */}
        <div className="w-full max-w-4xl space-y-3">
          {availability.map((dayAvailability, index) => (
            <div
              key={dayAvailability.day}
              className={`p-4 md:p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 availability-card
                ${dayAvailability.isDayOff
                  ? "bg-status-error/5 border-status-error/20"
                  : "bg-surface-elevated/50 border-line-glass"
                }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                {/* Day name */}
                <div className="flex items-center justify-between sm:w-32 shrink-0">
                  <h3 className="text-sm font-semibold text-content-inverse">
                    {dayAvailability.day}
                  </h3>
                  <div className={`text-[10px] font-medium px-2 py-0.5 rounded-full
                    ${dayAvailability.isDayOff
                      ? "bg-status-error/20 text-status-error"
                      : "bg-brand/20 text-brand-hover"
                    }`}
                  >
                    {dayAvailability.isDayOff
                      ? "Day Off"
                      : `${dayAvailability.openingTime} – ${dayAvailability.closingTime}`}
                  </div>
                </div>

                {/* Slider */}
                <div className="flex-1 px-2">
                  <Slider
                    value={[
                      parseTime(dayAvailability.openingTime),
                      parseTime(dayAvailability.closingTime),
                    ]}
                    onChange={(_event, newValue) =>
                      handleChange(dayAvailability.day, newValue as number[], index)
                    }
                    onMouseDown={() => setIsDragging(dayAvailability.day)}
                    onTouchStart={() => setIsDragging(dayAvailability.day)}
                    onChangeCommitted={() => setIsDragging(null)}
                    valueLabelDisplay={isDragging === dayAvailability.day ? "on" : "off"}
                    min={0}
                    max={1440}
                    step={15}
                    valueLabelFormat={(value) => formatTime(value)}
                    disabled={dayAvailability.isDayOff}
                    sx={{
                      color: dayAvailability.isDayOff ? "#EF4444" : "#65558F",
                      height: 6,
                      "& .MuiSlider-track": { border: "none", borderRadius: 3 },
                      "& .MuiSlider-rail": { opacity: 0.15 },
                      "& .MuiSlider-thumb": {
                        height: 18,
                        width: 18,
                        backgroundColor: "#fff",
                        border: dayAvailability.isDayOff ? "2px solid #EF4444" : "2px solid #65558F",
                        "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                          boxShadow: dayAvailability.isDayOff
                            ? "0 0 0 6px rgba(239, 68, 68, 0.16)"
                            : "0 0 0 6px rgba(101, 85, 143, 0.16)",
                        },
                      },
                      "& .MuiSlider-valueLabel": {
                        lineHeight: 1.2, fontSize: 11,
                        background: dayAvailability.isDayOff ? "#EF4444" : "#65558F",
                        padding: "3px 6px", borderRadius: "6px",
                      },
                    }}
                  />
                </div>

                {/* Day off toggle */}
                <button
                  onClick={() => toggleDayOff(dayAvailability.day)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${dayAvailability.isDayOff
                      ? "bg-status-success/20 text-status-success hover:bg-status-success/30 border border-status-success/30"
                      : "bg-status-error/20 text-status-error hover:bg-status-error/30 border border-status-error/30"
                    }`}
                >
                  {dayAvailability.isDayOff ? "Enable" : "Day Off"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Save / Cancel buttons */}
        <div className="w-full max-w-4xl flex gap-3 mt-6">
          <GradientButton
            fullWidth
            loading={isLoading}
            loadingText="Saving..."
            disabled={!hasUnsavedChanges}
            onClick={saveAvailability}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Save className="w-4 h-4" />
              Save Availability
            </span>
          </GradientButton>
          {hasUnsavedChanges && (
            <GradientButton
              variant="secondary"
              onClick={resetChanges}
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" />
                Reset
              </span>
            </GradientButton>
          )}
        </div>
      </div>

      {/* Mobile Floating Bubble */}
      <div
        id="custom-availability-bubble"
        className="lg:hidden fixed bottom-6 right-6 z-40"
        onClick={() => setShowMobileModal(!showMobileModal)}
      >
        <button className="flex items-center gap-2 bg-gradient-to-r from-brand to-accent-teal text-white rounded-full py-3 px-4 shadow-lg shadow-brand/30 hover:scale-105 transition-all duration-200">
          <CalendarIcon className="w-5 h-5" />
          <span className="font-medium text-sm">Custom</span>
        </button>
      </div>

      {/* Mobile Modal */}
      {showMobileModal && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-6">
          <div
            id="custom-availability-modal"
            className="bg-surface-elevated border border-line-glass w-full max-w-md rounded-t-2xl p-5 mobile-modal-slide-up"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-content-inverse">Custom Availability</h2>
              <button
                onClick={() => setShowMobileModal(false)}
                className="p-1.5 rounded-lg hover:bg-surface-elevated/80 border border-line-glass transition-colors"
              >
                <X className="w-5 h-5 text-content-subtle-inverse" />
              </button>
            </div>

            <div className="space-y-3">
              <Link
                to="/home/booking/availability/add-availability"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                  bg-gradient-to-r from-brand to-accent-teal text-white font-medium text-sm
                  hover:shadow-lg hover:shadow-brand/30 transition-all"
                onClick={() => setShowMobileModal(false)}
              >
                <Plus className="w-5 h-5" />
                Add Custom Availability
              </Link>
              <Link
                to="/home/booking/availability/delete-availability"
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                  bg-surface-elevated/50 border border-line-glass text-content-inverse font-medium text-sm
                  hover:bg-status-error/10 hover:border-status-error/30 transition-all"
                onClick={() => setShowMobileModal(false)}
              >
                <Trash2 className="w-5 h-5" />
                Delete Custom Availability
              </Link>
            </div>
          </div>
        </div>
      )}

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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(101,85,143,0.5); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(101,85,143,0.7); }

        .availability-card {
          animation: card-fade-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .availability-card:nth-child(1) { animation-delay: 0.05s; }
        .availability-card:nth-child(2) { animation-delay: 0.1s;  }
        .availability-card:nth-child(3) { animation-delay: 0.15s; }
        .availability-card:nth-child(4) { animation-delay: 0.2s;  }
        .availability-card:nth-child(5) { animation-delay: 0.25s; }
        .availability-card:nth-child(6) { animation-delay: 0.3s;  }
        .availability-card:nth-child(7) { animation-delay: 0.35s; }

        @keyframes card-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .unsaved-slide-in {
          animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mobile-modal-slide-up {
          animation: mobileSlideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes mobileSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Availability;