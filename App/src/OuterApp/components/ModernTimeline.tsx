import React, { useEffect, useRef, useState } from 'react';
import { FaCalendarAlt, FaHandshake, FaFileContract, FaCode, FaChartLine } from 'react-icons/fa';

interface TimelineItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: number;
}

const defaultSteps: TimelineItem[] = [
  {
    icon: <FaCalendarAlt className="w-6 h-6" />,
    title: 'Book a Meeting',
    description: 'Schedule a free consultation to discuss your goals, challenges, and vision for your business.',
    step: 1,
  },
  {
    icon: <FaHandshake className="w-6 h-6" />,
    title: 'Kick-off Meeting',
    description: 'We dive deep into your requirements, analyze your market, and craft a tailored strategy.',
    step: 2,
  },
  {
    icon: <FaFileContract className="w-6 h-6" />,
    title: 'Contract & Planning',
    description: 'Formalize our partnership and create a detailed roadmap with clear milestones.',
    step: 3,
  },
  {
    icon: <FaCode className="w-6 h-6" />,
    title: 'Development & Execution',
    description: 'Our team brings your vision to life with agile development and continuous communication.',
    step: 4,
  },
  {
    icon: <FaChartLine className="w-6 h-6" />,
    title: 'Watch Your Growth',
    description: 'Launch, measure, optimize, and scale. See real results and continuous improvement.',
    step: 5,
  },
];

interface ModernTimelineProps {
  steps?: TimelineItem[];
  title?: string;
  subtitle?: string;
}

const ModernTimeline: React.FC<ModernTimelineProps> = ({
  steps = defaultSteps,
  title = 'Your Journey With Us',
  subtitle = 'A simple, transparent process designed for your success',
}) => {
  const [activeStep, setActiveStep] = useState(-1);
  const [lineProgress, setLineProgress] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate overall progress
      const startTrigger = viewportHeight * 0.7;
      const endTrigger = viewportHeight * 0.3;
      
      if (rect.top <= startTrigger && rect.bottom >= endTrigger) {
        const totalHeight = rect.height;
        const scrolledIntoView = startTrigger - rect.top;
        const progress = Math.min(Math.max(scrolledIntoView / totalHeight, 0), 1);
        setLineProgress(progress * 100);
      }

      // Check each step
      stepsRef.current.forEach((step, index) => {
        if (!step) return;
        const stepRect = step.getBoundingClientRect();
        if (stepRect.top < viewportHeight * 0.6) {
          setActiveStep((prev) => Math.max(prev, index));
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative py-24 bg-gradient-to-b from-surface-black via-brand/10 to-surface-black overflow-hidden">
      {/* Background decoration */}
      <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-brand/30 to-transparent" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-brand/20 rounded-full text-brand-hover text-sm font-medium mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-content-muted text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Progress line */}
          <div className="absolute left-8 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-line-dark">
            <div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-brand via-accent-teal to-brand transition-all duration-300 ease-out"
              style={{ height: `${lineProgress}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (stepsRef.current[index] = el)}
                className={`relative flex items-start gap-8 md:gap-16 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Step indicator */}
                <div
                  className={`absolute left-8 md:left-1/2 md:-translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                    activeStep >= index
                      ? 'bg-gradient-to-br from-brand to-accent-teal shadow-lg shadow-brand/30 scale-100'
                      : 'bg-surface-elevated border-2 border-line-dark scale-90'
                  }`}
                  style={{ top: '0' }}
                >
                  <div
                    className={`transition-all duration-500 ${
                      activeStep >= index ? 'text-white' : 'text-content-muted'
                    }`}
                  >
                    {step.icon}
                  </div>
                </div>

                {/* Content card */}
                <div
                  className={`ml-28 md:ml-0 md:w-[calc(50%-4rem)] transition-all duration-700 ${
                    activeStep >= index
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  } ${index % 2 === 0 ? '' : 'md:text-right'}`}
                >
                  <div
                    className={`bg-surface-elevated/80 backdrop-blur-sm border border-line-glass rounded-2xl p-6 md:p-8 ${
                      activeStep >= index ? 'shadow-lg shadow-brand/10' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-brand/20 text-brand-hover text-sm font-bold">
                        {step.step}
                      </span>
                      <h3 className="text-xl font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-content-muted leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Empty space for alternating layout */}
                <div className="hidden md:block md:w-[calc(50%-4rem)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernTimeline;
