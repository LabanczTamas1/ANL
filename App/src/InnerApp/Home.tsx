import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Activity, Users, Calendar, Settings, ChevronRight, Star, BookOpen, Mail } from "lucide-react";
import { useLanguage } from '../hooks/useLanguage';
import MeetingsDashboard from "./components/MeetingsDashboard";

const Home = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState(t('welcomeInner'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const greetings = [t('welcomeInner'), t('hello'), t('hiThere'), t('greetings'), t('hey')];
    const interval = setInterval(() => {
      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      setGreeting(randomGreeting);
    }, 1500);

    setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearInterval(interval);
  }, [t]);

  const features = [
    {
      id: 1,
      title: t('bookMeeting'),
      icon: <Activity size={24} />,
      description: t('trackPerformance'),
      link: "/home/booking",
    },
    {
      id: 2,
      title: t('seeProgress'),
      icon: <Users size={24} />,
      description: t('connectUsers'),
      link: "/home/progress-tracker",
    },
    {
      id: 3,
      title: t('eventCalendar'),
      icon: <Calendar size={24} />,
      description: t('stayOnTop'),
      link: "/home/booking",
    },
    {
      id: 4,
      title: t('userSettings'),
      icon: <Settings size={24} />,
      description: t('customizeExperience'),
      link: "/home/account",
    },
    {
      id: 5,
      title: t('mailingSystem'),
      icon: <Mail size={24} />,
      description: t('simpleMails'),
      link: "/home/mail/inbox",
    },
    {
      id: 6,
      title: t('projectManagement'),
      icon: <Activity size={24} />,
      description: t('organizeWorkflows'),
      link: "/home/kanban",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-light dark:bg-surface-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand mx-auto" />
          <p className="mt-4 text-content-subtle dark:text-content-subtle-inverse">{t('loadingContent')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark py-8 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-content dark:text-content-inverse mb-4">
            {greeting} <span className="text-brand">{t('toDashboard')}</span>
          </h1>
          <p className="text-xl text-content-subtle dark:text-content-subtle-inverse max-w-2xl mx-auto">
            {t('discoverBetterWay')}
          </p>
          <div className="mt-8">
            <button
              onClick={() => navigate('/home/booking')}
              className="bg-brand hover:bg-brand-hover text-content-inverse font-medium py-3 px-6 rounded-lg transition-colors duration-300 inline-flex items-center"
            >
              {t('getStarted')} <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-surface-light dark:bg-surface-elevated rounded-lg shadow-card hover:shadow-card-hover border border-line dark:border-line-dark overflow-hidden cursor-pointer transition duration-300 hover:-translate-y-1"
              onClick={() => navigate(feature.link)}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-content-inverse bg-brand mr-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg text-content dark:text-content-inverse">{feature.title}</h3>
                </div>
                <p className="text-content-subtle dark:text-content-subtle-inverse mb-4 flex-grow">{feature.description}</p>
                <div className="flex items-center mt-auto text-sm font-medium text-brand">
                  {t('learnMore')} <ChevronRight size={16} className="ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-surface-light dark:bg-surface-elevated rounded-lg shadow-card border border-line dark:border-line-dark p-8 mb-16">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-brand text-brand" />
              ))}
            </div>
            <p className="text-xl italic text-content-subtle dark:text-content-subtle-inverse mb-6">
              "{t('testimonialText')}"
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-content-inverse font-bold bg-brand">JD</div>
              <div className="ml-4 text-left">
                <p className="font-bold text-content dark:text-content-inverse">{t('testimonialName')}</p>
                <p className="text-content-muted">{t('testimonialPosition')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-brand rounded-lg shadow-elevated p-8 text-content-inverse text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t('readyForNextStep')}</h2>
          <p className="mb-8 max-w-2xl mx-auto opacity-90">
            {t('joinThousands')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate('/home/booking')}
              className="bg-surface-light hover:bg-surface-light/90 text-brand font-medium py-3 px-6 rounded-lg transition-colors duration-300"
            >
              {t('bookMeeting')}
            </button>
            <button className="bg-transparent border-2 border-content-inverse hover:bg-brand-hover text-content-inverse font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center">
              <BookOpen className="mr-2" size={18} /> {t('learnMore')}
            </button>
          </div>
        </div>

        <MeetingsDashboard />

        {/* Footer */}
        <div className="mt-16 text-center text-content-muted">
          <p>© 2025 {t('companyName')}. {t('allRightsReserved')}</p>
        </div>

      </div>
    </div>
  );
};

export default Home;
