import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, Video, ArrowLeft, PlusCircle } from "lucide-react";

const SuccessfulBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [meetingDetails, setMeetingDetails] = useState({
    date: "",
    time: "",
    link: "",
    type: "Kick Off Meeting",
    loading: true,
    error: null
  });

  // Helper function to format time from minutes
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = mins < 10 ? `0${mins}` : mins;
    return `${formattedHours}:${formattedMinutes} ${period}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    }).format(date);
  };

  useEffect(() => {
    // Check if there's a meeting ID in the URL
    const searchParams = new URLSearchParams(location.search);
    const meetingId = searchParams.get('meetingId');
    
    if (meetingId) {
      // Fetch specific meeting by ID
      fetchMeetingById(meetingId);
      
      // Clean up the URL if desired
      window.history.replaceState({}, document.title, '/home/successful-booking');
    } else {
      // If no meeting ID, check for legacy meeting param
      const meetingParam = searchParams.get('meeting');
      
      if (meetingParam) {
        try {
          // Decode and parse the meeting data (legacy format)
          const decodedMeeting = JSON.parse(
            Buffer.from(meetingParam, 'base64').toString()
          );
          
          setMeetingDetails({
            date: formatDate(decodedMeeting.date),
            time: formatTime(decodedMeeting.time),
            link: decodedMeeting.link,
            type: decodedMeeting.type || "Kick Off Meeting",
            loading: false,
            error: null
          });
          
          // Clean up the URL
          window.history.replaceState({}, document.title, '/home/successful-booking');
        } catch (error) {
          console.error("Error parsing meeting details:", error);
          // Try fetching the latest meeting as fallback
          fetchLatestMeeting();
        }
      } else {
        // If no params, try to fetch the latest meeting
        fetchLatestMeeting();
      }
    }
  }, [location]);

  // Fetch meeting details by ID
  const fetchMeetingById = async (meetingId) => {
    try {
      setMeetingDetails(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token is missing.");
      }
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${API_BASE_URL}/api/meetings/${meetingId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch meeting details");
      }
      
      const data = await response.json();
      
      // Format the received data
      setMeetingDetails({
        date: formatDate(data.meeting.date),
        time: data.meeting.formattedTime || formatTime(data.meeting.startTime || data.meeting.at),
        link: data.meeting.meetingLink || data.meeting.link,
        type: data.meeting.meetingType || data.meeting.type || "Kick Off Meeting",
        loading: false,
        error: null
      });
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      setMeetingDetails(prev => ({
        ...prev,
        loading: false,
        error: "Unable to load meeting details. Please try again later."
      }));
    }
  };

  // Fetch latest meeting from API
  const fetchLatestMeeting = async () => {
    try {
      setMeetingDetails(prev => ({ ...prev, loading: true, error: null }));
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token is missing.");
      }
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      
      // First try the new endpoint
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/meetings/latest`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          setMeetingDetails({
            date: formatDate(data.meeting.date),
            time: data.meeting.formattedTime || formatTime(data.meeting.startTime || data.meeting.at),
            link: data.meeting.meetingLink || data.meeting.link,
            type: data.meeting.meetingType || data.meeting.type || "Kick Off Meeting",
            loading: false,
            error: null
          });
          return;
        }
      } catch (error) {
        console.warn("New endpoint failed, trying legacy endpoint");
      }
      
      // If new endpoint fails, try the legacy endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/availability/booking/latest`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch meeting details");
      }
      
      const data = await response.json();
      
      // Format the received data
      setMeetingDetails({
        date: formatDate(data.date),
        time: formatTime(data.at),
        link: data.link,
        type: data.type || "Kick Off Meeting",
        loading: false,
        error: null
      });
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      // Use fallback data if fetch fails
      setMeetingDetails({
        date: "Monday, May 5, 2025",
        time: "2:00 PM",
        link: "https://meet.google.com/abc-defg-hij",
        type: "Kick Off Meeting",
        loading: false,
        error: "Unable to load meeting details. Using fallback data."
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-4 md:mt-10 p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg transition-colors duration-200">
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-3 md:mb-4">
          Booking Successful!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
          Your appointment has been scheduled. We've sent the details to your email.
        </p>
      </div>

      {meetingDetails.loading ? (
        <div className="text-center py-8 md:py-12">
          <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-3 md:mt-4 text-gray-600 dark:text-gray-300 text-sm md:text-base">Loading meeting details...</p>
        </div>
      ) : meetingDetails.error ? (
        <div className="text-center py-6 md:py-8 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm md:text-base">{meetingDetails.error}</p>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 md:p-6 rounded-lg mb-5 md:mb-6 transition-colors duration-200">
          <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Meeting Details</h3>
          
          <div className="flex items-center mb-4">
            <div className="text-blue-600 dark:text-blue-400 min-w-6">
              <Calendar size={22} />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-700 dark:text-gray-200">Date</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{meetingDetails.date}</p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="text-blue-600 dark:text-blue-400 min-w-6">
              <Clock size={22} />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-700 dark:text-gray-200">Time</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{meetingDetails.time}</p>
            </div>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="text-blue-600 dark:text-blue-400 min-w-6">
              <Video size={22} />
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-700 dark:text-gray-200">Meeting Type</p>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{meetingDetails.type}</p>
            </div>
          </div>
          
          {meetingDetails.link && (
            <div className="mt-5 md:mt-6 flex justify-center md:justify-start">
              <a 
                href={meetingDetails.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2 rounded text-sm md:text-base transition-colors duration-200 inline-flex items-center"
              >
                <Video className="mr-2" size={16} />
                Join Google Meet
              </a>
            </div>
          )}
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-3 justify-center mt-4">
        <button
          onClick={() => navigate("/home")}
          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm md:text-base transition-colors duration-200 flex items-center justify-center"
        >
          <ArrowLeft className="mr-1" size={16} />
          Back to Home
        </button>
        <button
          onClick={() => navigate("/home/booking")}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2 rounded text-sm md:text-base transition-colors duration-200 flex items-center justify-center"
        >
          <PlusCircle className="mr-1" size={16} />
          Book Another Appointment
        </button>
      </div>
    </div>
  );
};

export default SuccessfulBooking;