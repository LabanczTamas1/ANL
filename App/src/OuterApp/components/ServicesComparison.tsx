import React, { useEffect, useRef, useState } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';

interface CompareRow {
  feature: string;
  them: boolean | string;
  us: boolean | string;
}

const rows: CompareRow[] = [
  { feature: 'Data-driven targeting', them: false, us: true },
  { feature: 'Dedicated account manager', them: false, us: true },
  { feature: 'Transparent weekly reporting', them: false, us: true },
  { feature: 'CRM & pixel integration', them: 'Add-on', us: true },
  { feature: 'Creative A/B testing', them: false, us: true },
  { feature: 'Real-time performance dashboard', them: false, us: true },
  { feature: 'Custom growth strategy', them: false, us: true },
  { feature: 'ROI guarantee commitment', them: false, us: true },
];

const ServicesComparison: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative py-24 overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-surface-black" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, rgba(101, 85, 143, 0.5) 0%, transparent 65%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Why ANL vs. the Rest
          </h2>
          <p className="text-content-muted text-lg max-w-xl mx-auto">
            Most agencies talk big. We show you the difference upfront.
          </p>
        </div>

        {/* Table */}
        <div
          className={`rounded-3xl overflow-hidden border border-line-glass backdrop-blur-xl transition-all duration-700 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Table header */}
          <div className="grid grid-cols-3 bg-surface-elevated/80">
            <div className="p-5 text-content-muted text-sm font-semibold uppercase tracking-wide">
              Feature
            </div>
            <div className="p-5 text-center text-content-muted text-sm font-semibold uppercase tracking-wide border-l border-line-glass">
              Other Agencies
            </div>
            <div className="p-5 text-center border-l border-line-glass">
              <span className="text-sm font-bold text-brand uppercase tracking-wide">ANL</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">
                Us
              </span>
            </div>
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 border-t border-line-glass transition-all duration-500 hover:bg-surface-elevated/30 ${
                visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="p-4 text-white text-sm font-medium flex items-center">
                {row.feature}
              </div>

              {/* Them */}
              <div className="p-4 flex items-center justify-center border-l border-line-glass">
                {row.them === false ? (
                  <FaTimes className="w-4 h-4 text-status-error" />
                ) : row.them === true ? (
                  <FaCheck className="w-4 h-4 text-status-success" />
                ) : (
                  <span className="text-xs text-content-muted bg-surface-elevated px-2 py-1 rounded-lg">
                    {row.them}
                  </span>
                )}
              </div>

              {/* Us */}
              <div className="p-4 flex items-center justify-center border-l border-line-glass bg-brand/5">
                {row.us === false ? (
                  <FaTimes className="w-4 h-4 text-status-error" />
                ) : row.us === true ? (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/20">
                    <FaCheck className="w-3 h-3 text-brand" />
                  </div>
                ) : (
                  <span className="text-xs text-brand font-semibold">{row.us}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-content-muted text-sm mt-8">
          Based on independent client reviews and industry benchmarks.
        </p>
      </div>
    </section>
  );
};

export default ServicesComparison;
