import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import FlashMessage from '../../FlashMessage';

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
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [selectedValues, setSelectedValues] = useState<string[]>([]); // Array for multiple selections
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Helper function to format time from minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert 24-hour to 12-hour
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  const getAvailableTimeByDate = async (value: Value) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setSelectedValues([]); // Reset selected times when the date changes

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No authentication token found.');
      setFlashMessage({
        message: 'No authentication token found.',
        type: 'error',
      });
      setIsLoading(false);
      return;
    }

    try {
        console.log(value);
      const dateValue = Array.isArray(value) ? value[0] : value;
      const formattedDate = dateValue ? dateValue.toISOString().split('T')[0] : '';
      console.log(formattedDate);

      const response = await fetch(
        `${API_BASE_URL}/api/availability/add-availability/${formattedDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch availability.');
      }

      const data = await response.json();
      console.log(data);
      setAddableTimes(data.unavailableTimes || []); // Assuming the response data has availableTimes
      setSuccess(data.message || 'Availability fetched successfully!');
      setFlashMessage({
        message: data.message || 'Availability fetched successfully!',
        type: 'success',
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        const errorMsg =
          err.message || 'An error occurred while fetching availability.';
        setError(errorMsg);
        setFlashMessage({
          message: errorMsg,
          type: 'error',
        });
      } else {
        const unknownError = 'An unknown error occurred.';
        setError(unknownError);
        setFlashMessage({
          message: unknownError,
          type: 'error',
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
        message: 'Please select at least one time slot before submitting.',
        type: 'error',
      });
      return;
    }
    console.log("woooooow", currentDate, selectedValues);
  
    try {
      setIsLoading(true); // Start loading
      setError(null);
      setSuccess(null);
  
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token is missing.');
      }

      const localDate = currentDate.toLocaleDateString('en-CA'); // 'en-CA' gives ISO format (YYYY-MM-DD)
  
      const response = await fetch(
        `http://localhost:3000/api/availability/add-availability-to-the-database`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: localDate, // Send selected date
            times: selectedValues, // Send selected times
          }),
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save availability.');
      }
  
      const data = await response.json();
      setSuccess(data.message || 'Availability added successfully!');
      setFlashMessage({
        message: data.message || 'Availability added successfully!',
        type: 'success',
      });
      setSelectedValues([]); // Reset selected values after successful submission
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        setFlashMessage({
          message: err.message,
          type: 'error',
        });
      } else {
        const unknownError = 'An unknown error occurred.';
        setError(unknownError);
        setFlashMessage({
          message: unknownError,
          type: 'error',
        });
      }
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  

  return (
    <div>
      <Calendar
  className="!bg-[#65558F] p-4 w-1/2 h-[33%]"
  tileClassName="hover:!bg-[#d8bfd8] transition duration-200 !rounded-md"
  onChange={(value: Value) => {
    setSelectedValues([]); // Reset selected values when the date changes
    setCurrentDate(value instanceof Date ? value : new Date()); // Set currentDate as the selected date
    getAvailableTimeByDate(value); // Fetch available times for the selected date
  }}
  value={currentDate} // Ensure value is bound to currentDate
  view="month"
  onActiveStartDateChange={({ activeStartDate }) =>
    setCurrentDate(activeStartDate || new Date()) // Ensure currentDate reflects the selected date
  }
  showNeighboringMonth={true}
/>
      <div>
        <ul>
          {addableTimes.length > 0 ? (
            addableTimes.map((timeInMinutes, index) => (
              <li key={index}>
                <button
                  key={timeInMinutes}
                  className={`px-4 py-2 rounded-lg text-white font-semibold ${
                    selectedValues.includes(timeInMinutes.toString())
                      ? 'bg-blue-500'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => handleSelection(timeInMinutes.toString())}
                >
                  {formatTime(timeInMinutes)}
                </button>
              </li>
            ))
          ) : (
            <li>Pick a date</li>
          )}
        </ul>
      </div>
      <button
        className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        onClick={handleSubmit}
        disabled={selectedValues.length === 0}
      >
        Submit
      </button>
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

export default AddAvailability;
