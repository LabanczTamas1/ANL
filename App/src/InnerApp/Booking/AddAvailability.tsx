import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import FlashMessage from "../../FlashMessage";
import { Calendar as CalendarIcon, Clock, Video } from "lucide-react";
import darkLogo from "/public/dark-logo.png";

const AddAvailability = () => {
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];

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
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
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
      console.log(value);
      const dateValue = Array.isArray(value) ? value[0] : value;
      const formattedDate = dateValue
        ? dateValue.toISOString().split("T")[0]
        : "";
      console.log(formattedDate);

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
      console.log(data);
      setAddableTimes(data.unavailableTimes || []); // Assuming the response data has availableTimes
      setSuccess(data.message || "Availability fetched successfully!");
      setFlashMessage({
        message: data.message || "Availability fetched successfully!",
        type: "success",
      });
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
      if (prev.includes(value)) {
        // Remove the value if it's already selected
        return prev.filter((item) => item !== value);
      } else {
        // Add the value if it's not selected
        return [...prev, value];
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
    console.log("woooooow", currentDate, selectedValues);

    try {
      setIsLoading(true); // Start loading
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const localDate = currentDate.toLocaleDateString("en-CA"); // 'en-CA' gives ISO format (YYYY-MM-DD)

      const response = await fetch(
        `http://localhost:3001/api/availability/add-availability-to-the-database`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: localDate, // Send selected date
            times: selectedValues, // Send selected times
          }),
        }
      );

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
          <h3 className="font-bold text-lg md:text-2xl">Add avaibility</h3>
          <p className="text-wrap mb-3 text-sm md:text-base">
          You may add any availability date that is not part of the current standard availability or was previously deleted.
          </p>
          <div>
            <div className="flex items-center space-x-2 text-sm md:text-base">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Add 1 hour from each selected entry.</span>
            </div>
          </div>
        </div>
        <div className="px-3 border-x-2 h-[400px] md:h-[500px] w-full md:w-auto">
          <Calendar
            className="!bg-white p-4 !w-full !h-[400px] md:!h-[500px] !border-none dark:!bg-[#121212]"
            tileClassName="hover:!bg-[#d8bfd8] !h-[50%] transition duration-200 !rounded-md focus:!bg-[#65558F] focus:!text-white"
            onChange={(value: Value) => {
              setSelectedValues([]); // Reset selected values when the date changes
              setCurrentDate(value instanceof Date ? value : new Date()); // Set currentDate as the selected date
              getAvailableTimeByDate(value); // Fetch available times for the selected date
            }}
            value={currentDate} // Ensure value is bound to currentDate
            view="month"
            onActiveStartDateChange={
              ({ activeStartDate }) => setCurrentDate(activeStartDate || new Date()) // Ensure currentDate reflects the selected date
            }
            showNeighboringMonth={true}
          />
        </div>
        <div className="flex flex-col p-3 border-black w-full md:w-[30%] h-full">
          <div className="text-sm md:text-base">{"\u00A0"}</div>
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
              <div className="w-full py-1 text-center text-sm md:text-base">Pick a date</div>
            )}
          </ul>
          {addableTimes.length > 0 && (
            <button
              className="mt-3 px-4 md:px-6 py-2 bg-[#65558F] text-white font-bold rounded-lg hover:bg-[#9c81db] disabled:bg-gray-400 w-full"
              onClick={handleSubmit}
              disabled={selectedValues.length === 0}
            >
              Submit
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
}

export default AddAvailability;
