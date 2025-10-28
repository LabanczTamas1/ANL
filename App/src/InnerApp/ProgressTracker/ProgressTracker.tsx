import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { CheckCircle, Circle } from 'lucide-react';

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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileIndex, setMobileIndex] = useState(0);
  const currentStepRef = useRef<HTMLDivElement | null>(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return;
        const response = await axios.get(`${API_BASE_URL}/api/userData/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userData = response.data.userData;
        if (userData) {
          const userStep = userData.step !== undefined && userData.step !== null
            ? Number(userData.step)
            : (userData.progress !== undefined && userData.progress !== null
                ? Number(userData.progress)
                : 3);
          setProgress(userStep + 1);
          setMobileIndex(Math.max(0, userStep));
        } else {
          setProgress(2);
          setMobileIndex(1);
        }
      } catch (error) {
        setProgress(2);
        setMobileIndex(1);
      }
    };
    fetchProgress();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [API_BASE_URL]);

  useEffect(() => {
    if (isMobile && currentStepRef.current) {
      currentStepRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [progress, mobileIndex, isMobile]);

  // Mobile: vertical stepper, scrollable and with up/down buttons
  if (isMobile) {
    const showPrev = mobileIndex > 0;
    const showNext = mobileIndex < milestones.length - 1;
    const getStatus = (idx: number) => {
      if (idx < progress - 1) return 'Completed';
      if (idx === progress - 1) return 'Current Step';
      return 'Upcoming';
    };
    return (
      <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 w-full max-w-full mx-auto">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">Your Progress</h2>
        <div className="flex flex-col gap-4 items-center">
          <button
            className="btn btn-sm btn-ghost mb-2"
            onClick={() => setMobileIndex(i => Math.max(0, i - 1))}
            disabled={!showPrev}
          >▲</button>
          <div className="w-full overflow-y-auto max-h-72 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-900/40 scrollbar-track-transparent">
            {milestones.map((m, idx) => {
              const isCurrent = idx === progress - 1;
              const isComplete = idx < progress - 1;
              return (
                <div
                  key={m.label}
                  ref={isCurrent ? currentStepRef : undefined}
                  className={`flex items-center gap-3 w-full mb-2 ${isCurrent ? '' : 'opacity-80'}`}
                  style={{ minHeight: 64 }}
                >
                  <div className={`rounded-full p-2 ${isComplete ? 'bg-emerald-100 dark:bg-emerald-900/30' : isCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800/50'}`}>
                    {isComplete ? (
                      <CheckCircle size={28} className="text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle size={28} className={isCurrent ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-base ${isCurrent ? 'text-blue-700 dark:text-blue-300' : isComplete ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-700 dark:text-gray-300'}`}>{m.label}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{m.description}</div>
                    <div className={`mt-1 text-xs ${isCurrent ? 'text-blue-500 dark:text-blue-400 font-medium' : isComplete ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>{getStatus(idx)}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            className="btn btn-sm btn-ghost mt-2"
            onClick={() => setMobileIndex(i => Math.min(milestones.length - 1, i + 1))}
            disabled={!showNext}
          >▼</button>
        </div>
        <div className="mt-8 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Step {progress - 1} of {milestones.length}</div>
          <div className="w-full flex items-center">
            <div style={{ flex: 1 }}>
              <progress className="progress w-full" value={Math.round(((progress-0.5) / milestones.length) * 100)} max="100"></progress>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop/tablet: horizontal stepper, full width
  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 w-full mx-auto">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">Your Progress</h2>
      <div className="flex flex-col items-center">
        <div className="flex justify-between w-full mb-6">
          {milestones.map((m, idx) => {
            const isComplete = idx < progress - 1;
            const isCurrent = idx === progress - 1;
            return (
              <div key={m.label} className="flex flex-col items-center flex-1">
                <div className={`rounded-full p-2 mb-1 ${isComplete ? 'bg-emerald-100 dark:bg-emerald-900/30' : isCurrent ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800/50'}`}> 
                  {isComplete ? (
                    <CheckCircle size={24} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle size={24} className={isCurrent ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"} />
                  )}
                </div>
                <div className={`text-xs text-center truncate max-w-[70px] ${isComplete ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>{m.label}</div>
              </div>
            );
          })}
        </div>
        <div className="w-full flex flex-col items-center mb-4">
          <div className="w-full flex items-center">
            <div style={{ flex: 1 }}>
              <progress className="progress w-full" value={Math.round(((progress-0.5) / milestones.length) * 100)} max="100"></progress>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm w-full">
          <h3 className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-2">{milestones[Math.max(0, progress - 1)]?.label}</h3>
          <p className="text-sm text-blue-700 dark:text-blue-200">{milestones[Math.max(0, progress - 1)]?.description}</p>
          <div className="mt-4 pt-3 border-t border-blue-200 dark:border-blue-800/50 flex items-center">
            <div className={`rounded-full w-2 h-2 mr-2 ${progress - 1 < 0 ? 'bg-gray-400 dark:bg-gray-500' : progress - 1 < milestones.length - 1 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-emerald-500 dark:bg-emerald-400'}`}></div>
            <span className="text-xs text-gray-600 dark:text-gray-300">
              {progress - 1 < 0 ? 'Upcoming' : progress - 1 < milestones.length - 1 ? 'In Progress' : 'Completed'}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Step {progress - 1} of {milestones.length}</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
