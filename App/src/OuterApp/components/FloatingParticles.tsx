import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  hue: number;
}

interface FloatingParticlesProps {
  particleCount?: number;
  className?: string;
}

/**
 * Ambient floating particles background effect
 * Creates a dreamy, modern atmosphere
 */
const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  particleCount = 50,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const initParticles = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * parent.clientWidth,
          y: Math.random() * parent.clientHeight,
          size: Math.random() * 3 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          hue: Math.random() > 0.5 ? 270 : 180, // Purple or teal
        });
      }
      particlesRef.current = particles;
    };

    const animate = () => {
      const parent = canvas.parentElement;
      if (!parent || !ctx) return;

      ctx.clearRect(0, 0, parent.clientWidth, parent.clientHeight);

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = parent.clientWidth;
        if (particle.x > parent.clientWidth) particle.x = 0;
        if (particle.y < 0) particle.y = parent.clientHeight;
        if (particle.y > parent.clientHeight) particle.y = 0;

        // Draw particle with glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        );
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${particle.opacity})`);
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 60%, 0)`);
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby particles
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(101, 85, 143, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
    />
  );
};

export default FloatingParticles;
