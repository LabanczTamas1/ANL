import React, { useEffect, useRef, useState } from 'react';

interface StatItem {
  value: number;
  suffix?: string;
  label: string;
  icon?: React.ReactNode;
}

interface AnimatedStatsProps {
  stats: StatItem[];
  className?: string;
}

/**
 * Animated counter statistics section
 * Numbers animate when scrolled into view
 */
const AnimatedStats: React.FC<AnimatedStatsProps> = ({ stats, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState<number[]>(stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const frameRate = 60;
    const totalFrames = (duration / 1000) * frameRate;

    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounts(stats.map((stat) => Math.floor(stat.value * easeOutQuart)));

      if (frame >= totalFrames) {
        clearInterval(interval);
        setCounts(stats.map((stat) => stat.value));
      }
    }, 1000 / frameRate);

    return () => clearInterval(interval);
  }, [isVisible, stats]);

  return (
    <div
      ref={sectionRef}
      className={`relative py-20 overflow-hidden ${className}`}
    >
      {/* Background gradient orbs */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-brand/20 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-teal/20 rounded-full blur-[100px] -translate-y-1/2" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
          Our Impact in Numbers
        </h2>
        <p className="text-content-muted text-center mb-16 max-w-2xl mx-auto">
          We've helped countless businesses achieve their digital transformation goals
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="relative group"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-accent-teal/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative bg-surface-elevated/50 backdrop-blur-sm border border-line-glass rounded-2xl p-6 text-center transition-transform duration-300 group-hover:scale-105">
                {stat.icon && (
                  <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-brand to-accent-teal rounded-xl flex items-center justify-center text-white">
                    {stat.icon}
                  </div>
                )}
                
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-hover to-accent-teal bg-clip-text text-transparent mb-2">
                  {counts[index].toLocaleString()}{stat.suffix || ''}
                </div>
                
                <div className="text-content-muted text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimatedStats;
