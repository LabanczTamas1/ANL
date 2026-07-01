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

    // Respect users who prefer reduced motion — skip the animation entirely.
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    // On mobile the perpetual canvas loop is the single biggest main-thread
    // cost on the outer pages, which makes taps (navbar, buttons) feel laggy.
    // Scale the work down aggressively there: fewer particles, no O(n²)
    // connection lines, capped device-pixel-ratio and a lower frame rate.
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const count = isMobile
      ? Math.min(particleCount, 18)
      : particleCount;
    const drawConnections = !isMobile;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
    const frameInterval = isMobile ? 1000 / 30 : 0; // throttle mobile to ~30fps

    // Pre-render a soft glow sprite per hue ONCE, then blit it each frame with
    // drawImage. This avoids allocating a fresh radial gradient per particle
    // per frame (the previous approach), which was extremely expensive.
    const makeGlowSprite = (hue: number): HTMLCanvasElement => {
      const s = 64;
      const sprite = document.createElement('canvas');
      sprite.width = s;
      sprite.height = s;
      const sctx = sprite.getContext('2d')!;
      const g = sctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, `hsla(${hue}, 70%, 60%, 1)`);
      g.addColorStop(1, `hsla(${hue}, 70%, 60%, 0)`);
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, s, s);
      return sprite;
    };
    const sprites: Record<number, HTMLCanvasElement> = {
      270: makeGlowSprite(270),
      180: makeGlowSprite(180),
    };

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const initParticles = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const particles: Particle[] = [];
      for (let i = 0; i < count; i++) {
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

    let lastFrame = 0;
    let running = true;

    const animate = (now: number) => {
      if (!running) return;
      animationRef.current = requestAnimationFrame(animate);

      // Frame-rate throttle on mobile.
      if (frameInterval && now - lastFrame < frameInterval) return;
      lastFrame = now;

      const parent = canvas.parentElement;
      if (!parent || !ctx) return;

      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      for (const particle of particles) {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around edges
        if (particle.x < 0) particle.x = w;
        if (particle.x > w) particle.x = 0;
        if (particle.y < 0) particle.y = h;
        if (particle.y > h) particle.y = 0;

        // Draw pre-rendered glow sprite (cheap) instead of a per-frame gradient.
        const r = particle.size * 3;
        ctx.globalAlpha = particle.opacity;
        ctx.drawImage(sprites[particle.hue], particle.x - r, particle.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;

      // Draw connections between nearby particles (desktop only — O(n²)).
      if (drawConnections) {
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
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
          }
        }
      }
    };

    const start = () => {
      if (animationRef.current) return;
      running = true;
      lastFrame = 0;
      animationRef.current = requestAnimationFrame(animate);
    };

    const stop = () => {
      running = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = undefined;
      }
    };

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    // Pause the loop entirely when the canvas is scrolled out of view — no
    // point burning CPU animating a background nobody can see.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Also pause when the tab is hidden.
    const handleVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pause while a fullscreen overlay (e.g. the mobile nav menu) is open — the
    // overlay COVERS the canvas without scrolling it out of view, so the
    // IntersectionObserver above wouldn't catch it, yet the loop would keep
    // starving the main thread and making in-menu taps feel laggy.
    const handlePause = () => stop();
    const handleResume = () => {
      if (!document.hidden) start();
    };
    window.addEventListener('anl:pause-bg-animation', handlePause);
    window.addEventListener('anl:resume-bg-animation', handleResume);

    resizeCanvas();
    initParticles();
    start();

    window.addEventListener('resize', handleResize);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('anl:pause-bg-animation', handlePause);
      window.removeEventListener('anl:resume-bg-animation', handleResume);
      window.removeEventListener('resize', handleResize);
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
