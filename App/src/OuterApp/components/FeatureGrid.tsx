import React, { useEffect, useRef, useState } from 'react';
import { FaRocket, FaChartLine, FaCogs, FaShieldAlt, FaUsers, FaLightbulb } from 'react-icons/fa';
import GlowCard from './GlowCard';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

const defaultFeatures: Feature[] = [
  {
    icon: <FaRocket className="w-8 h-8" />,
    title: 'Rapid Growth',
    description: 'Accelerate your business growth with our proven strategies and cutting-edge solutions.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: <FaChartLine className="w-8 h-8" />,
    title: 'Data Analytics',
    description: 'Make informed decisions with real-time analytics and comprehensive reporting.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: <FaCogs className="w-8 h-8" />,
    title: 'Automation',
    description: 'Streamline your workflows with intelligent automation that saves time and resources.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: <FaShieldAlt className="w-8 h-8" />,
    title: 'Security First',
    description: 'Enterprise-grade security to protect your data and ensure compliance.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: <FaUsers className="w-8 h-8" />,
    title: 'Team Collaboration',
    description: 'Foster seamless collaboration across teams with integrated tools.',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: <FaLightbulb className="w-8 h-8" />,
    title: 'Innovation',
    description: 'Stay ahead with continuous innovation and emerging technology adoption.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

interface FeatureGridProps {
  features?: Feature[];
  title?: string;
  subtitle?: string;
  className?: string;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({
  features = defaultFeatures,
  title = 'Why Choose Us',
  subtitle = 'Discover the tools and services that will transform your business',
  className = '',
}) => {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute('data-index'));
          if (entry.isIntersecting) {
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.2, rootMargin: '50px' }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className={`relative py-24 ${className}`}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-black via-surface-overlay to-surface-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-content-muted text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => (cardsRef.current[index] = el)}
              data-index={index}
              className={`transition-all duration-700 ${
                visibleCards.has(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <GlowCard className="h-full">
                <div className="p-8">
                  {/* Icon with gradient background */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg`}
                  >
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-content-muted leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Hover arrow */}
                  <div className="mt-6 flex items-center gap-2 text-brand-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-sm font-medium">Learn more</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </GlowCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
