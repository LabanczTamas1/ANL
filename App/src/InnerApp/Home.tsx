import React, { useState, useEffect } from "react";
import { ArrowRight, Activity, Users, Calendar, Settings, ChevronRight, Star, BookOpen } from "lucide-react";
import { useLanguage } from '../hooks/useLanguage';
import MeetingsDashboard from "./components/MeetingsDashboard";

const Home = () => {
  const { t } = useLanguage();
  const [greeting, setGreeting] = useState(t('welcomeInner'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Update the greetings array to use translations
    const greetings = [t('welcomeInner'), t('hello'), t('hiThere'), t('greetings'), t('hey')];
    const interval = setInterval(() => {
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      setGreeting(randomGreeting);
    }, 1500);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Check for user's preferred theme
    if (typeof window !== 'undefined') {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      }
    }

    return () => clearInterval(interval);
  }, [t]); // Add t as a dependency to update greetings when language changes

  const features = [
    { 
      id: 1, 
      title: t('bookMeeting'), 
      icon: <Activity size={24} />, 
      description: t('trackPerformance'), 
      link: "/analytics" 
    },
    { 
      id: 2, 
      title: t('seeProgress'),
      icon: <Users size={24} />, 
      description: t('connectUsers'), 
      link: "/community" 
    },
    { 
      id: 3, 
      title: t('eventCalendar'), 
      icon: <Calendar size={24} />, 
      description: t('stayOnTop'), 
      link: "/events" 
    },
    { 
      id: 4, 
      title: t('userSettings'), 
      icon: <Settings size={24} />, 
      description: t('customizeExperience'), 
      link: "/settings" 
    },
    { 
      id: 5, 
      title: t('mailingSystem'), 
      icon: <Star size={24} />, 
      description: t('simpleMails'), 
      link: "/resources" 
    },
    { 
      id: 6, 
      title: t('projectManagement'), 
      icon: <Activity size={24} />, 
      description: t('organizeWorkflows'), 
      link: "/projects" 
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto" style={{ borderColor: "#65558F" }}></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{t('loadingContent')}</p>
        </div>
      </div>
    );
  }

  const handleFeatureClick = (link: string) => {
    console.log(`Navigating to: ${link}`);
    // In a real implementation, you would use router navigation here
    // e.g., router.push(link) or navigate(link)
  };

  const purpleColor = "#65558F";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            {greeting} <span style={{ color: purpleColor }}>{t('toDashboard')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('discoverBetterWay')}
          </p>
          <div className="mt-8">
            <button 
              className="text-white font-medium py-3 px-6 rounded-lg transition duration-300 inline-flex items-center"
              style={{ backgroundColor: purpleColor }}
            >
              {t('getStarted')} <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>

        {/* Features Grid - Now more squared and with hover effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden cursor-pointer transform transition duration-300 hover:shadow-xl hover:-translate-y-1"
              onClick={() => handleFeatureClick(feature.link)}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3" style={{ backgroundColor: purpleColor }}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{feature.description}</p>
                <div className="flex items-center mt-auto text-sm font-medium" style={{ color: purpleColor }}>
                  {t('learnMore')} <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-8 mb-16">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} fill={purpleColor} color={purpleColor} />
              ))}
            </div>
            <p className="text-xl italic text-gray-700 dark:text-gray-300 mb-6">
              "{t('testimonialText')}"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: purpleColor }}>JD</div>
              <div className="ml-4 text-left">
                <p className="font-bold text-gray-800 dark:text-white">{t('testimonialName')}</p>
                <p className="text-gray-600 dark:text-gray-400">{t('testimonialPosition')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg shadow-lg p-8 text-white text-center" style={{ backgroundColor: purpleColor }}>
          <h2 className="text-3xl font-bold mb-4">{t('readyForNextStep')}</h2>
          <p className="mb-8 max-w-2xl mx-auto text-purple-100">
            {t('joinThousands')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-white hover:bg-gray-100 font-medium py-3 px-6 rounded-lg transition duration-300" style={{ color: purpleColor }}>
              {t('bookMeeting')}
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-300 flex items-center">
              <BookOpen className="mr-2" size={18} /> {t('learnMore')}
            </button>
          </div>
        </div>
        <MeetingsDashboard />

        {/* Footer */}
        <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p>© 2025 {t('companyName')}. {t('allRightsReserved')}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;