import React, { useState, useEffect } from 'react';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface Testimonial {
  content: string;
  author: string;
  position: string;
  company: string;
  avatar?: string;
  rating: number;
}

const defaultTestimonials: Testimonial[] = [
  {
    content: "Working with ANL transformed our business completely. Their innovative approach and dedication to results exceeded our expectations. We saw a 150% increase in engagement within just three months.",
    author: "Sarah Johnson",
    position: "CEO",
    company: "TechStart Inc.",
    rating: 5,
  },
  {
    content: "The team's expertise in digital marketing and automation helped us scale our operations efficiently. Their personalized strategy was exactly what we needed to reach our target audience.",
    author: "Michael Chen",
    position: "Marketing Director",
    company: "Global Solutions",
    rating: 5,
  },
  {
    content: "From the initial consultation to the final delivery, the experience was seamless. They truly understand modern business needs and deliver solutions that drive real growth.",
    author: "Emily Rodriguez",
    position: "Founder",
    company: "Creative Hub",
    rating: 5,
  },
];

interface TestimonialSectionProps {
  testimonials?: Testimonial[];
  title?: string;
  subtitle?: string;
}

const TestimonialSection: React.FC<TestimonialSectionProps> = ({
  testimonials = defaultTestimonials,
  title = "What Our Clients Say",
  subtitle = "Don't just take our word for it — hear from businesses we've helped grow",
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevTestimonial = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 6000);
    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[activeIndex];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-black via-surface-overlay to-surface-black" />
      
      {/* Decorative elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
        <div className="absolute inset-0 bg-brand/10 rounded-full blur-[100px]" />
        <div className="absolute inset-12 bg-accent-teal/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-brand/20 rounded-full text-brand-hover text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-content-muted text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Testimonial card */}
        <div className="relative">
          <div
            className={`bg-surface-elevated/60 backdrop-blur-xl border border-line-glass rounded-3xl p-8 md:p-12 transition-all duration-500 ${
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            {/* Quote icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-to-br from-brand to-accent-teal rounded-xl flex items-center justify-center shadow-lg shadow-brand/30">
              <FaQuoteLeft className="w-5 h-5 text-white" />
            </div>

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`w-5 h-5 ${
                    i < currentTestimonial.rating
                      ? 'text-yellow-400'
                      : 'text-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <blockquote className="text-xl md:text-2xl text-white leading-relaxed mb-8">
              "{currentTestimonial.content}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-4">
              {currentTestimonial.avatar ? (
                <img
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.author}
                  className="w-14 h-14 rounded-full object-cover border-2 border-brand/30"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand to-accent-teal flex items-center justify-center text-white text-xl font-bold">
                  {currentTestimonial.author[0]}
                </div>
              )}
              <div>
                <div className="font-semibold text-white">
                  {currentTestimonial.author}
                </div>
                <div className="text-content-muted text-sm">
                  {currentTestimonial.position} at {currentTestimonial.company}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-surface-elevated border border-line-glass flex items-center justify-center text-content-muted hover:text-white hover:bg-brand/20 transition-all"
              aria-label="Previous testimonial"
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isAnimating) {
                      setIsAnimating(true);
                      setActiveIndex(index);
                      setTimeout(() => setIsAnimating(false), 500);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'w-8 bg-gradient-to-r from-brand to-accent-teal'
                      : 'bg-line-dark hover:bg-brand/50'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-surface-elevated border border-line-glass flex items-center justify-center text-content-muted hover:text-white hover:bg-brand/20 transition-all"
              aria-label="Next testimonial"
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
