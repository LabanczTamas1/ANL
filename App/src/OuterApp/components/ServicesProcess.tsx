import React, { useEffect, useRef, useState } from 'react';
import {
  FaComments,
  FaSearchPlus,
  FaRocket,
  FaChartBar,
  FaSyncAlt,
} from 'react-icons/fa';

interface Step {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  accentColor: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: <FaComments className="w-6 h-6" />,
    title: 'Discovery Call',
    description:
      'We learn about your business, goals, and challenges in a no-obligation strategy call. Zero fluff, pure value.',
    accentColor: '#65558F',
  },
  {
    number: '02',
    icon: <FaSearchPlus className="w-6 h-6" />,
    title: 'Market Analysis',
    description:
      'Our team deep-dives into your market, competitors, and audience to uncover hidden growth opportunities.',
    accentColor: '#7AA49F',
  },
  {
    number: '03',
    icon: <FaRocket className="w-6 h-6" />,
    title: 'Strategy & Launch',
    description:
      'We craft a tailored campaign strategy and launch with precision — creative, copy, targeting, all aligned.',
    accentColor: '#9A4647',
  },
  {
    number: '04',
    icon: <FaChartBar className="w-6 h-6" />,
    title: 'Track & Optimize',
    description:
      'Real-time dashboards, weekly reports, and continuous A/B testing keep performance trending upward.',
    accentColor: '#9B7ADB',
  },
  {
    number: '05',
    icon: <FaSyncAlt className="w-6 h-6" />,
    title: 'Scale & Iterate',
    description:
      'Once we find what works, we scale it. We double down on winners and cut losers fast.',
    accentColor: '#22C55E',
  },
];

const ServicesProcess: React.FC = () => {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-step'));
            setVisibleSteps((prev) => new Set([...prev, idx]));
          }
        });
      },
      { threshold: 0.3 }
    );
    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-black to-surface-overlay" />

      {/* Decorative orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How We Work
          </h2>
          <p className="text-content-muted text-lg max-w-xl mx-auto">
            A proven, transparent process designed to deliver results from day one.
          </p>
        </div>

        {/* Steps — timeline */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-14 left-0 right-0 h-px"
            style={{
              background:
                'linear-gradient(to right, transparent, rgba(101,85,143,0.5) 15%, rgba(122,164,159,0.5) 50%, rgba(101,85,143,0.5) 85%, transparent)',
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (stepRefs.current[index] = el)}
                data-step={index}
                className={`flex flex-col items-center text-center lg:items-center transition-all duration-700 ${
                  visibleSteps.has(index)
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Number + Icon circle */}
                <div className="relative mb-6">
                  {/* Outer glow ring */}
                  <div
                    className="absolute inset-0 rounded-full blur-md opacity-60 scale-125"
                    style={{ backgroundColor: step.accentColor }}
                  />
                  {/* Circle */}
                  <div
                    className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 bg-surface-elevated"
                    style={{ borderColor: step.accentColor }}
                  >
                    <span
                      className="text-xs font-bold tracking-widest uppercase mb-1"
                      style={{ color: step.accentColor }}
                    >
                      {step.number}
                    </span>
                    <div style={{ color: step.accentColor }}>{step.icon}</div>
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-content-muted text-sm leading-relaxed max-w-[200px] lg:max-w-none">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-content-muted text-sm mt-14 max-w-md mx-auto">
          Most clients see measurable results within the first{' '}
          <span className="text-brand font-semibold">30 days</span>. We move fast.
        </p>
      </div>
    </section>
  );
};

export default ServicesProcess;
