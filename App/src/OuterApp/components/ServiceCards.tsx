import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBullhorn,
  FaUsers,
  FaChartLine,
  FaSearchDollar,
  FaHandHoldingUsd,
  FaAd,
  FaGlobe,
  FaEnvelopeOpenText,
  FaPhoneSquare,
  FaArrowRight,
  FaCheck,
} from 'react-icons/fa';
import GlowCard from './GlowCard';

type Category = 'all' | 'advertising' | 'leadgen' | 'seo' | 'social' | 'email';

interface Service {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  category: Category[];
  accentColor: string;
  gradient: string;
  badge?: string;
}

const services: Service[] = [
  {
    icon: <FaBullhorn className="w-7 h-7" />,
    title: 'Targeted Advertising',
    description:
      'Reach the right audience at the right time with precision-crafted digital advertising campaigns built on real data.',
    features: ['Audience segmentation', 'A/B creative testing', 'Conversion tracking', 'Retargeting funnels'],
    category: ['advertising'],
    accentColor: 'rgba(101, 85, 143, 0.8)',
    gradient: 'from-brand to-accent-purple',
    badge: 'Most Popular',
  },
  {
    icon: <FaUsers className="w-7 h-7" />,
    title: 'Lead Generation',
    description:
      'Generate a consistent stream of high-quality, sales-ready leads through multi-channel data-driven strategies.',
    features: ['Lead scoring', 'CRM integration', 'Nurture sequences', 'Conversion funnels'],
    category: ['leadgen'],
    accentColor: 'rgba(122, 164, 159, 0.8)',
    gradient: 'from-accent-teal to-blue-500',
  },
  {
    icon: <FaChartLine className="w-7 h-7" />,
    title: 'SEO & Content Marketing',
    description:
      'Build long-term organic growth with data-backed SEO strategies and authoritative content that converts.',
    features: ['Keyword research', 'On-page optimization', 'Content strategy', 'Backlink building'],
    category: ['seo'],
    accentColor: 'rgba(34, 197, 94, 0.8)',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: <FaSearchDollar className="w-7 h-7" />,
    title: 'PPC Campaigns',
    description:
      'Maximize every ad dollar with expertly managed pay-per-click campaigns across Google, Bing, and beyond.',
    features: ['Bid optimization', 'Quality score tuning', 'Landing page analysis', 'Daily reporting'],
    category: ['advertising'],
    accentColor: 'rgba(245, 158, 11, 0.8)',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: <FaHandHoldingUsd className="w-7 h-7" />,
    title: 'Conversion Optimization',
    description:
      'Turn more visitors into paying customers with scientific CRO techniques and continuous testing cycles.',
    features: ['Heatmap analysis', 'UX audits', 'A/B & multivariate tests', 'Funnel optimization'],
    category: ['leadgen', 'advertising'],
    accentColor: 'rgba(59, 130, 246, 0.8)',
    gradient: 'from-blue-500 to-indigo-500',
    badge: 'High ROI',
  },
  {
    icon: <FaAd className="w-7 h-7" />,
    title: 'Social Media Ads',
    description:
      'Run high-converting ad campaigns across Meta, TikTok, LinkedIn, and X tailored to your growth goals.',
    features: ['Platform-specific creatives', 'Lookalike audiences', 'Pixel setup', 'Performance dashboards'],
    category: ['social', 'advertising'],
    accentColor: 'rgba(168, 85, 247, 0.8)',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: <FaGlobe className="w-7 h-7" />,
    title: 'Brand Awareness',
    description:
      "Expand your brand's presence across channels with cohesive, memorable multi-platform campaigns.",
    features: ['Brand voice development', 'Display advertising', 'Programmatic media', 'Influencer seeding'],
    category: ['advertising', 'social'],
    accentColor: 'rgba(154, 70, 71, 0.8)',
    gradient: 'from-accent-rose to-red-500',
  },
  {
    icon: <FaEnvelopeOpenText className="w-7 h-7" />,
    title: 'Email Marketing',
    description:
      'Engage, nurture, and convert your audience with beautifully designed, personalized email campaigns.',
    features: ['Drip sequences', 'Segmentation', 'Deliverability audits', 'Automated workflows'],
    category: ['email', 'leadgen'],
    accentColor: 'rgba(20, 184, 166, 0.8)',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: <FaPhoneSquare className="w-7 h-7" />,
    title: 'Cold Outreach & Retargeting',
    description:
      'Reconnect with potential customers and open new conversations with targeted outreach sequences.',
    features: ['Prospect research', 'Personalized sequences', 'Multi-touch retargeting', 'Reply rate analytics'],
    category: ['leadgen', 'email'],
    accentColor: 'rgba(249, 115, 22, 0.8)',
    gradient: 'from-orange-500 to-rose-500',
  },
];

const tabs: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Services' },
  { id: 'advertising', label: 'Advertising' },
  { id: 'leadgen', label: 'Lead Gen' },
  { id: 'seo', label: 'SEO' },
  { id: 'social', label: 'Social Media' },
  { id: 'email', label: 'Email' },
];

const ServiceCard: React.FC<{ service: Service; index: number; visible: boolean }> = ({
  service,
  index,
  visible,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      <GlowCard glowColor={service.accentColor} className="h-full">
        <div
          className="p-6 flex flex-col gap-4 h-full cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-lg`}
            >
              {service.icon}
            </div>
            {service.badge && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/20 text-brand border border-brand/30 whitespace-nowrap">
                {service.badge}
              </span>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="text-white font-bold text-lg leading-snug mb-2">{service.title}</h3>
            <p className="text-content-muted text-sm leading-relaxed">{service.description}</p>
          </div>

          {/* Features - expandable */}
          <div
            className={`overflow-hidden transition-all duration-400 ease-in-out ${
              expanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <ul className="mt-2 space-y-2">
              {service.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-content-muted">
                  <FaCheck className="w-3 h-3 text-brand flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-line-glass">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="text-sm text-brand hover:text-brand-hover font-medium flex items-center gap-1 transition-colors"
            >
              {expanded ? 'Show less' : 'See details'}
              <FaArrowRight
                className={`w-3 h-3 transition-transform duration-300 ${
                  expanded ? 'rotate-90' : 'rotate-0'
                }`}
              />
            </button>
            <Link
              to="/booking"
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-semibold text-white px-3 py-1.5 rounded-xl bg-brand/20 hover:bg-brand/40 border border-brand/30 hover:border-brand/60 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </GlowCard>
    </div>
  );
};

const ServiceCards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Category>('all');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLDivElement>(null);
  const prevTab = useRef<Category>('all');

  const filtered = services.filter(
    (s) => activeTab === 'all' || s.category.includes(activeTab)
  );

  useEffect(() => {
    // Reset visible cards when tab changes to retrigger animation
    if (prevTab.current !== activeTab) {
      setVisibleCards(new Set());
      prevTab.current = activeTab;
      const t = setTimeout(() => {
        setVisibleCards(new Set(filtered.map((_, i) => i)));
      }, 50);
      return () => clearTimeout(t);
    }
  }, [activeTab, filtered]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => {
            setVisibleCards(new Set(filtered.map((_, i) => i)));
          }, 100);
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="relative py-24" ref={sectionRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-overlay via-surface-black to-surface-overlay" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            What We Do Best
          </h2>
          <p className="text-content-muted text-lg max-w-xl mx-auto">
            Choose the service that fits your growth stage — or let us build you a full strategy.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                activeTab === tab.id
                  ? 'bg-brand text-white border-brand shadow-lg shadow-brand/30'
                  : 'bg-surface-elevated/40 text-content-muted border-line-glass hover:border-brand/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, index) => (
            <ServiceCard
              key={service.title}
              service={service}
              index={index}
              visible={visibleCards.has(index)}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-content-muted mb-5">
            Not sure which service is right for you?
          </p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-surface-elevated/50 backdrop-blur border border-line-glass rounded-2xl text-white font-semibold text-lg hover:bg-surface-elevated hover:border-brand/40 transition-all"
          >
            Talk to an Expert
            <FaArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServiceCards;
