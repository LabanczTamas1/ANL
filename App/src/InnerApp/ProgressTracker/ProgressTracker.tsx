import { useState, useEffect } from 'react';
import axios from 'axios';

const milestones = [
  { label: "First Contact" },
  { label: "Register to ANL" },
  { label: "Kick off meeting" },
  { label: "Contract" },
  { label: "Onboarding" },
  { label: "90 days" },
  { label: "Apple Watch" }
];

const ProgressTracker = () => {
  const [progress, setProgress] = useState(0);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          console.error("Missing authToken or userId in localStorage");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/api/userData/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const userData = response.data.userData;
        if (userData && userData.progress !== undefined) {
          setProgress(Number(userData.progress)); // Convert 'progress' to a number
        } else {
          console.error("Progress not found in userData", userData);
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
      }
    };

    fetchProgress();
  }, [API_BASE_URL]);

  // Calculate the progress percentage for the overlay line.
  // (Using milestones.length - 1 because progress is zero-indexed.)
  const progressPercentage =
    milestones.length > 1 ? ((progress-1) / (milestones.length +1 )) * 100 : 0;

    return (
      <div className="p-4 relative">
        <h1 className="text-[1.5rem] font-bold">Progress Tracker</h1>
        <h2 className="flex justify-center text-center mb-4 text-[1.25rem] font-semibold">Current progress</h2> {/* Added margin-bottom */}
        <div
          className="absolute left-1/2 w-1 bg-gray-300"
          style={{ top: '6rem', bottom: 0, transform: 'translateX(-50%)' }}
        />
        <div
          className="absolute left-1/2 w-1 bg-blue-600"
          style={{
            top: '6rem',  // Aligning this line with the previous one
            height: `${progressPercentage}%`,
            transform: 'translateX(-50%)'
          }}
        />
        {/* DaisyUI */}
        <ul className="relative">
          {milestones.map((milestone, index) => (
            <li key={index} className="flex relative mb-[10vh]">
              {/* Line between milestones */}
              {index > 0 && (
                <div
                  className={`absolute left-1/2 w-1 transition-all duration-300 ${
                    index <= progress - 1 ? 'bg-blue-600 h-1' : 'bg-gray-300 h-0.5 opacity-50'
                  }`}
                  style={{
                    top: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: -1,
                  }}
                />
              )}
    
              {/* Milestone marker */}
              <div
                className={`transition-all duration-300 absolute left-1/2 transform -translate-x-1/2 ${
                  index <= progress - 1 ? 'text-blue-600' : 'text-gray-400'
                }`}
                style={{
                  top: '50%',
                  zIndex: 1,
                }}
              >
                <div className="bg-white dark:bg-[#121212]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
    
              {/* Milestone label */}
              <div
                className={`transition-opacity duration-300 absolute ${
                  index <= progress -1  ? 'text-blue-600 opacity-100' : 'text-gray-400 opacity-50'
                }`}
                style={{
                  top: '60%',
                  left: 'calc(50% + 1.5rem)',
                  whiteSpace: 'nowrap',
                }}
              >
                {milestone.label}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
    
};

export default ProgressTracker;
