import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarAlt, FaFacebook, FaInstagram, FaGoogle, FaBullhorn, FaChartLine, FaMousePointer, FaUsers, FaSearch } from 'react-icons/fa';

interface CTASectionProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  fullHeight?: boolean;
}

/**
 * Modern Call-to-Action section with animated gradient background
 */
const CTASection: React.FC<CTASectionProps> = ({
  title = "Ready to Transform Your Business?",
  subtitle = "Let's discuss how we can help you achieve your goals. Book a free consultation today.",
  primaryButtonText = "Book a Meeting",
  primaryButtonLink = "/booking",
  secondaryButtonText = "Learn More",
  secondaryButtonLink = "/about",
  fullHeight = false,
}) => {
  return (
    <section className={`relative overflow-hidden flex flex-col justify-center ${fullHeight ? 'min-h-screen py-12' : 'py-24'}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-surface-black" />
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              background: `
                radial-gradient(ellipse at 20% 50%, rgba(101, 85, 143, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 50%, rgba(122, 164, 159, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 100%, rgba(101, 85, 143, 0.3) 0%, transparent 50%)
              `,
            }}
          />
        </div>
        {/* Animated floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-teal/30 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand/20 rounded-full text-brand-hover text-sm font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-hover opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-hover" />
          </span>
          Available for new projects
        </span>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-xl text-content-muted mb-12 max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to={primaryButtonLink}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-brand to-accent-teal rounded-2xl text-white font-semibold text-lg overflow-hidden transition-all hover:shadow-lg hover:shadow-brand/30 hover:scale-105"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <FaCalendarAlt className="w-5 h-5" />
            <span>{primaryButtonText}</span>
            <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            to={secondaryButtonLink}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-surface-elevated/50 backdrop-blur border border-line-glass rounded-2xl text-white font-semibold text-lg hover:bg-surface-elevated hover:border-brand/30 transition-all"
          >
            <span>{secondaryButtonText}</span>
            <FaArrowRight className="w-4 h-4 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all" />
          </Link>
        </div>

        {/* Ad platforms ticker */}
        <div className="mt-16 pt-8 border-t border-line-glass overflow-hidden">
          <div
            className="flex gap-6 w-max"
            style={{ animation: 'ctaTicker 22s linear infinite' }}
          >
            {[
              { icon: <FaFacebook className="w-4 h-4" />, label: 'Meta Ads' },
              { icon: <FaInstagram className="w-4 h-4" />, label: 'Instagram Ads' },
              { icon: <FaGoogle className="w-4 h-4" />, label: 'Google Ads' },
              { icon: <FaBullhorn className="w-4 h-4" />, label: 'Retargeting' },
              { icon: <FaChartLine className="w-4 h-4" />, label: 'ROAS Optimisation' },
              { icon: <FaMousePointer className="w-4 h-4" />, label: 'CTR Boost' },
              { icon: <FaUsers className="w-4 h-4" />, label: 'Lookalike Audiences' },
              { icon: <FaSearch className="w-4 h-4" />, label: 'A/B Testing' },
              /* duplicate for seamless loop */
              { icon: <FaFacebook className="w-4 h-4" />, label: 'Meta Ads' },
              { icon: <FaInstagram className="w-4 h-4" />, label: 'Instagram Ads' },
              { icon: <FaGoogle className="w-4 h-4" />, label: 'Google Ads' },
              { icon: <FaBullhorn className="w-4 h-4" />, label: 'Retargeting' },
              { icon: <FaChartLine className="w-4 h-4" />, label: 'ROAS Optimisation' },
              { icon: <FaMousePointer className="w-4 h-4" />, label: 'CTR Boost' },
              { icon: <FaUsers className="w-4 h-4" />, label: 'Lookalike Audiences' },
              { icon: <FaSearch className="w-4 h-4" />, label: 'A/B Testing' },
            ].map(({ icon, label }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-line-glass rounded-xl text-white/50 text-sm whitespace-nowrap"
              >
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes ctaTicker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </section>
  );
};

export default CTASection;
