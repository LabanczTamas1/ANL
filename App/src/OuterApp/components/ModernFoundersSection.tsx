import React, { useRef, useState } from 'react';
import { FaLinkedin, FaTwitter, FaEnvelope } from 'react-icons/fa';
import FloatingParticles from './FloatingParticles';

interface Founder {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface ModernFoundersSectionProps {
  founders: Founder[];
  title?: string;
  subtitle?: string;
}

const ModernFoundersSection: React.FC<ModernFoundersSectionProps> = ({
  founders,
  title = 'Meet the Founders',
  subtitle = 'The visionaries behind your digital transformation',
}) => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-overlay via-brand/5 to-surface-black" />
      
      {/* Floating particles */}
      <FloatingParticles particleCount={30} />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-brand/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent-teal/20 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-brand/20 rounded-full text-brand-hover text-sm font-medium mb-4">
            Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-content-muted text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Founders grid */}
        <div className="flex flex-col md:flex-row gap-12 justify-center items-center">
          {founders.map((founder, index) => (
            <FounderCard key={index} founder={founder} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FounderCardProps {
  founder: Founder;
}

const FounderCard: React.FC<FounderCardProps> = ({ founder }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -10;
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 10;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      ref={cardRef}
      className="relative group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s ease-out',
      }}
    >
      {/* Glow effect */}
      <div
        className={`absolute -inset-2 bg-gradient-to-r from-brand via-accent-teal to-brand rounded-3xl blur-lg transition-opacity duration-500 ${
          isHovered ? 'opacity-50' : 'opacity-0'
        }`}
      />

      <div className="relative w-[340px] bg-surface-elevated/90 backdrop-blur-xl border border-line-glass rounded-3xl overflow-hidden">
        {/* Image container */}
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            src={founder.imageUrl}
            alt={founder.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Social icons on hover */}
          {founder.socials && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              {founder.socials.linkedin && (
                <a
                  href={founder.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-brand transition-colors"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
              )}
              {founder.socials.twitter && (
                <a
                  href={founder.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-brand transition-colors"
                >
                  <FaTwitter className="w-5 h-5" />
                </a>
              )}
              {founder.socials.email && (
                <a
                  href={`mailto:${founder.socials.email}`}
                  className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-brand transition-colors"
                >
                  <FaEnvelope className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-white">{founder.name}</h3>
            <span className="px-3 py-1 bg-brand/20 rounded-full text-brand-hover text-sm font-medium">
              {founder.position}
            </span>
          </div>
          <p className="text-content-muted leading-relaxed text-sm">
            {founder.description}
          </p>
        </div>

        {/* Bottom gradient line */}
        <div className="h-1 bg-gradient-to-r from-brand via-accent-teal to-brand opacity-50 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default ModernFoundersSection;
