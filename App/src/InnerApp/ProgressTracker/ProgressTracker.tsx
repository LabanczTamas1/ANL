import { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from 'lucide-react';

const milestones = [
  { label: "First Contact", description: "Initial introduction to our services" },
  { label: "Register to ANL", description: "Complete your registration process" },
  { label: "Meeting", description: "Discuss your goals and requirements" },
  { label: "Onboarding + Contract", description: "Complete paperwork and get started" },
  { label: "Strategy Session", description: "Create your personalized growth plan" },
  { label: "90 Day Program", description: "Execute your growth strategy" },
  { label: "Enjoy Your Growth!", description: "See the results of your journey" }
];

const ProgressTracker = () => {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('carousel'); // 'carousel' or 'stepper'
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Calculate how many milestones to show based on screen size
  const [visibleCount, setVisibleCount] = useState(3);
  const [startIndex, setStartIndex] = useState(0);

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
          const userProgress = Number(userData.progress);
          setProgress(userProgress);
          setActiveIndex(Math.max(0, userProgress - 1));
          
          // Set the start index based on progress
          updateStartIndex(Math.max(0, userProgress - 1));
        } else {
          console.error("Progress not found in userData", userData);
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
      }
    };

    fetchProgress();
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [API_BASE_URL]);

  const handleResize = () => {
    // Update view mode based on screen size
    if (window.innerWidth < 640) {
      setViewMode('stepper');
      setVisibleCount(1);
    } else if (window.innerWidth < 768) {
      setViewMode('carousel');
      setVisibleCount(3);
    } else if (window.innerWidth < 1024) {
      setViewMode('carousel');
      setVisibleCount(5);
    } else {
      setViewMode('carousel');
      setVisibleCount(7);
    }
    
    updateStartIndex(activeIndex);
  };

  const updateStartIndex = (currentIndex) => {
    const halfVisible = Math.floor(visibleCount / 2);
    
    // Center the active milestone when possible
    let newStartIndex = Math.max(0, currentIndex - halfVisible);
    
    // Ensure we don't go beyond the end
    if (newStartIndex + visibleCount > milestones.length) {
      newStartIndex = Math.max(0, milestones.length - visibleCount);
    }
    
    setStartIndex(newStartIndex);
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      updateStartIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (activeIndex < milestones.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      updateStartIndex(newIndex);
    }
  };

  const progressPercentage = (progress / milestones.length) * 100;
  const currentMilestone = progress > 0 && progress <= milestones.length ? milestones[progress - 1] : null;
  
  // Visible milestones for carousel view
  const visibleMilestones = milestones.slice(startIndex, startIndex + visibleCount);

  // Render milestone for carousel view
  const renderMilestone = (milestone, idx) => {
    const globalIndex = milestones.findIndex(m => m.label === milestone.label);
    const isComplete = globalIndex < progress;
    const isCurrent = globalIndex === progress - 1;
    
    return (
      <div 
        key={milestone.label}
        className={`flex flex-col items-center ${
          viewMode === 'carousel' ? 'w-full px-1 sm:px-2' : 'w-full'
        } transition-all duration-300`}
      >
        <div className={`relative flex flex-col items-center ${
          isCurrent ? 'scale-110 transform' : ''
        }`}>
          {/* Status icon */}
          <div className={`mb-1 relative z-10 ${isCurrent ? 'animate-pulse' : ''}`}>
            <div className={`rounded-full p-1 ${
              isComplete ? 'bg-emerald-100 dark:bg-emerald-900/30' : 
                          isCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : 
                                    'bg-gray-100 dark:bg-gray-800/50'
            }`}>
              {isComplete ? (
                <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle 
                  size={24} 
                  className={`${
                    isCurrent ? "text-blue-600 dark:text-blue-400" : 
                              "text-gray-400 dark:text-gray-500"
                  }`} 
                />
              )}
            </div>
            
            {/* Highlight ring for current step */}
            {isCurrent && (
              <div className="absolute inset-0 rounded-full -m-1 border-2 border-blue-500 dark:border-blue-400 animate-ping opacity-75"></div>
            )}
          </div>
          
          {/* Label */}
          <p className={`text-center text-xs sm:text-sm font-medium truncate max-w-full ${
            isComplete ? 'text-emerald-600 dark:text-emerald-400' : 
                      isCurrent ? 'text-blue-600 dark:text-blue-400' : 
                                'text-gray-500 dark:text-gray-400'
          }`}>
            {milestone.label}
          </p>
        </div>
        
        {/* Description (hidden on smallest screens) */}
        <p className={`text-center text-xs text-gray-500 dark:text-gray-400 hidden sm:block mt-1 ${
          isCurrent ? 'font-medium' : ''
        }`}>
          {milestone.description}
        </p>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header with badge showing current progress */}
      <div className="mb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Your Journey
          </h1>
          
          <div className="mt-2 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
              Step {progress} of {milestones.length}
            </span>
          </div>
        </div>
        
        {/* Current milestone card */}
        {currentMilestone && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-blue-500 dark:border-blue-400 shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="bg-blue-500 text-white dark:bg-blue-600 p-2 rounded-full">
                  <CheckCircle size={20} />
                </div>
              </div>
              <div>
                <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Current: {currentMilestone.label}
                </p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {currentMilestone.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* New Progress Bar Design */}
      <div className="relative mb-8">
        {/* Base track */}
        <div className="w-full h-2 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded-full">
          {/* Progress fill */}
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Milestone markers */}
          <div className="absolute inset-0 flex justify-between px-1">
            {milestones.map((_, idx) => {
              const isComplete = idx < progress - 1;
              const isCurrent = idx === progress - 1;
              const position = `${(idx / (milestones.length - 1)) * 100}%`;
              
              return (
                <div 
                  key={idx} 
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{ left: position }}
                >
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 ${
                    isComplete ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500' :
                    isCurrent ? 'bg-white border-blue-600 dark:bg-gray-800 dark:border-blue-400' :
                    'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                  }`}>
                    {isComplete && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone Navigator - Stepper for mobile, Carousel for larger screens */}
      {viewMode === 'stepper' ? (
        <div className="mt-6">
          {/* Mobile Stepper View */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {renderMilestone(milestones[activeIndex], 0)}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={handlePrevious}
                disabled={activeIndex === 0}
                className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 disabled:opacity-50"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                {activeIndex + 1} / {milestones.length}
              </div>
              
              <button 
                onClick={handleNext}
                disabled={activeIndex === milestones.length - 1}
                className="flex items-center px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-6">
          {/* Desktop/Tablet Carousel View */}
          <div className="flex items-center">
            <button 
              onClick={handlePrevious}
              disabled={startIndex === 0}
              className="flex-shrink-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous milestone"
            >
              <ChevronLeft size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
            
            <div className="flex-1 overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between">
                {visibleMilestones.map((milestone, idx) => renderMilestone(milestone, idx))}
              </div>
            </div>
            
            <button 
              onClick={handleNext}
              disabled={startIndex + visibleCount >= milestones.length}
              className="flex-shrink-0 p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 ml-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next milestone"
            >
              <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-1 mt-4">
            {milestones.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? 'w-4 bg-blue-600 dark:bg-blue-400' : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detailed milestone information */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm">
        <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-2">
          {milestones[activeIndex]?.label}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-200">
          {milestones[activeIndex]?.description}
        </p>
        
        {/* Status indicator */}
        <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800/50 flex items-center">
          <div className={`rounded-full w-2 h-2 mr-2 ${
            activeIndex < progress - 1 ? 'bg-emerald-500 dark:bg-emerald-400' :
            activeIndex === progress - 1 ? 'bg-blue-500 dark:bg-blue-400' :
            'bg-gray-400 dark:bg-gray-500'
          }`}></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            {activeIndex < progress - 1 ? 'Completed' :
             activeIndex === progress - 1 ? 'In Progress' :
             'Upcoming'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;