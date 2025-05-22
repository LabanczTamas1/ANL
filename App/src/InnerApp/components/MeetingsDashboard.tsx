import React, { useState, useEffect } from "react";
import { Calendar, Trash2, AlertCircle, X, ExternalLink, RefreshCw } from "lucide-react";
import { useLanguage } from '../../hooks/useLanguage';

const MeetingsDashboard = () => {
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const purpleColor = "#65558F";

  useEffect(() => {
    // Fetch meetings when component mounts
    fetchMeetings();
  }, [retryCount]);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get auth token
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/meeting`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Handle non-JSON responses
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`);
      }

      // Parse JSON response
      const data = await response.json();
      
      // Check for API error message
      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.statusText}`);
      }

      setMeetings(data.meetings || []);
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
      if (err.name === "SyntaxError") {
        setError("Server returned an invalid response. Please try again later.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
  };

  const handleBookMeeting = () => {
    // Navigate to booking page
    window.location.href = "/home/booking";
  };

  const openDeleteModal = (meeting) => {
    setMeetingToDelete(meeting);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setMeetingToDelete(null);
  };

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return;

    try {
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error("Authentication required. Please log in again.");
      }
      
      const response = await fetch(`${API_BASE_URL}/api/meetings/${meetingToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      // Try to parse response as JSON if possible
      let errorMessage;
      try {
        const data = await response.json();
        errorMessage = data.message || `Error: ${response.statusText}`;
      } catch (e) {
        errorMessage = `Error: ${response.statusText}`;
      }

      if (!response.ok) {
        throw new Error(errorMessage);
      }

      // Remove the deleted meeting from our state
      setMeetings(meetings.filter(meeting => meeting.id !== meetingToDelete.id));
      closeDeleteModal();
    } catch (err) {
      console.error("Failed to delete meeting:", err);
      setError(err.message);
      closeDeleteModal();
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mx-auto" style={{ borderColor: purpleColor }}></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingMeetings')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">{t('errorOccurred')}</h3>
        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors inline-flex items-center"
        >
          <RefreshCw size={16} className="mr-2" />
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  // No meetings state
  if (meetings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-8 text-center">
        <Calendar className="h-16 w-16 mx-auto mb-4" style={{ color: purpleColor }} />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('noMeetingsYet')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('scheduleYourFirst')}</p>
        <button 
          onClick={handleBookMeeting}
          className="text-white font-medium py-3 px-6 rounded-lg transition duration-300 inline-flex items-center"
          style={{ backgroundColor: purpleColor }}
        >
          {t('bookMeeting')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <Calendar className="mr-2" size={24} style={{ color: purpleColor }} />
          {t('yourMeetings')}
        </h2>
        <button 
          onClick={handleRetry} 
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title={t('refreshMeetings')}
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-lg text-gray-800 dark:text-white">
                {meeting.meetingType || meeting.type || t('scheduledMeeting')}
              </h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                <p>
                  <span className="font-semibold">{t('date')}:</span> {formatDate(meeting.date)}
                </p>
                <p>
                  <span className="font-semibold">{t('time')}:</span> {meeting.formattedTime}
                </p>
                <p>
                  <span className="font-semibold">{t('timezone')}:</span> {meeting.timezone || 'UTC'}
                </p>
                {meeting.clientEmail && (
                  <p>
                    <span className="font-semibold">{t('participant')}:</span> {meeting.clientEmail}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center mt-4 sm:mt-0">
              {(meeting.meetingLink || meeting.link) && (
                <a 
                  href={meeting.meetingLink || meeting.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 mr-2 text-sm font-medium rounded-md text-white transition-colors"
                  style={{ backgroundColor: purpleColor }}
                >
                  <ExternalLink size={16} className="mr-1" />
                  {t('joinMeeting')}
                </a>
              )}
              <button
                onClick={() => openDeleteModal(meeting)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
              >
                <Trash2 size={16} className="mr-1" />
                {t('cancel')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 dark:bg-gray-700/30 text-center">
        <button 
          onClick={handleBookMeeting}
          className="text-white font-medium py-2 px-4 rounded-md transition duration-300 inline-flex items-center"
          style={{ backgroundColor: purpleColor }}
        >
          {t('bookAnotherMeeting')}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('confirmCancellation')}
              </h3>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="py-4">
              <div className="flex items-center justify-center mb-4 text-amber-500">
                <AlertCircle size={48} />
              </div>
              <p className="text-center text-gray-700 dark:text-gray-300">
                {t('areYouSureDelete')}
              </p>
              {meetingToDelete && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {meetingToDelete.meetingType || meetingToDelete.type || t('scheduledMeeting')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(meetingToDelete.date)} • {meetingToDelete.formattedTime}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('keepMeeting')}
              </button>
              <button
                onClick={handleDeleteMeeting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                {t('confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingsDashboard;