import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaChevronDown } from 'react-icons/fa';
import FloatingParticles from './FloatingParticles';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 300, suffix: '+', label: 'Campaigns Launched' },
  { value: 85, suffix: '%', label: 'Avg. Lead Quality Rate' },
  { value: 4, suffix: 'x', label: 'Average ROI' },
  { value: 50, suffix: '+', label: 'Happy Clients' },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
};

const ServicesHero: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-surface-black" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `
            radial-gradient(ellipse at 15% 40%, rgba(101, 85, 143, 0.5) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 60%, rgba(122, 164, 159, 0.4) 0%, transparent 55%),
            radial-gradient(ellipse at 50% 90%, rgba(154, 70, 71, 0.3) 0%, transparent 50%)
          `,
        }}
      />
      <FloatingParticles particleCount={60} className="absolute inset-0" />

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 flex flex-col items-center text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand/40 bg-brand/10 backdrop-blur-sm text-sm text-brand mb-8 transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="font-medium tracking-wide">Our Services</span>
        </div>

        {/* Headline */}
        <h1
          className={`text-5xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] max-w-5xl transition-all duration-700 delay-100 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Marketing that{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, #65558F 0%, #7AA49F 40%, #9A4647 80%, #65558F 100%)',
              backgroundSize: '300% 100%',
              animation: 'gradientShift 6s linear infinite',
            }}
          >
            actually works
          </span>
        </h1>

        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            100% { background-position: 300% 50%; }
          }
        `}</style>

        {/* Subheadline */}
        <p
          className={`mt-6 text-lg md:text-xl text-content-muted max-w-2xl leading-relaxed transition-all duration-700 delay-200 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          Precision-targeted campaigns, data-driven lead generation, and growth strategies
          built to maximize your ROI — not just your impressions.
        </p>

        {/* CTAs */}
        <div
          className={`mt-10 flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <Link
            to="/booking"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand to-accent-teal rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-brand/40 hover:scale-105"
          >
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span>Get a Free Consultation</span>
            <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="#services"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-surface-elevated/50 backdrop-blur border border-line-glass rounded-2xl text-white font-semibold text-lg hover:bg-surface-elevated hover:border-brand/40 transition-all"
          >
            <span>Explore Services</span>
            <FaChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-1" />
          </a>
        </div>

        {/* Stats */}
        <div
          className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl transition-all duration-700 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-surface-elevated/30 backdrop-blur border border-line-glass hover:border-brand/40 transition-all hover:bg-surface-elevated/50"
            >
              <span className="text-4xl md:text-5xl font-extrabold text-white">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-sm text-content-muted text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default ServicesHero;
