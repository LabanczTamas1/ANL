import React, { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
  baseSpeed: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const STAR_COUNT = 200;
const STAR_MIN_LENGTH = 1;
const STAR_MAX_LENGTH = 40;
const STAR_MIN_SPEED = 0.5;
const STAR_MAX_SPEED = 5.5;
const STAR_COLOR_LIGHT = "rgba(173, 216, 230,";
const STAR_COLOR_PINK = "rgba(255, 182, 193,";
const GLOW_RADIUS = 150;
const GLOW_INFLUENCE_RADIUS = 200;

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef<MousePosition>({ x: -1000, y: -1000 });
  const targetMouseRef = useRef<MousePosition>({ x: -1000, y: -1000 });

  const randomColor = () =>
    Math.random() > 0.5
      ? `${STAR_COLOR_LIGHT}${Math.random()})`
      : `${STAR_COLOR_PINK}${Math.random()})`;

  const initStars = (width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const speed = STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED);
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: STAR_MIN_LENGTH + Math.random() * (STAR_MAX_LENGTH - STAR_MIN_LENGTH),
        speed,
        baseSpeed: speed,
        color: randomColor(),
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      initStars(width, height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      targetMouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    resize();

    let animationFrameId: number;

    const drawGlow = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      // Outer glow - purple/brand color
      const outerGradient = ctx.createRadialGradient(x, y, 0, x, y, GLOW_RADIUS);
      outerGradient.addColorStop(0, "rgba(101, 85, 143, 0.4)");
      outerGradient.addColorStop(0.3, "rgba(101, 85, 143, 0.2)");
      outerGradient.addColorStop(0.6, "rgba(122, 164, 159, 0.1)");
      outerGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(x, y, GLOW_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = outerGradient;
      ctx.fill();

      // Inner bright core
      const innerGradient = ctx.createRadialGradient(x, y, 0, x, y, 40);
      innerGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
      innerGradient.addColorStop(0.5, "rgba(167, 139, 250, 0.2)");
      innerGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.beginPath();
      ctx.arc(x, y, 40, 0, Math.PI * 2);
      ctx.fillStyle = innerGradient;
      ctx.fill();

      // Soft pulsing ring
      const time = Date.now() * 0.002;
      const pulseSize = 60 + Math.sin(time) * 20;
      const ringGradient = ctx.createRadialGradient(x, y, pulseSize - 5, x, y, pulseSize + 5);
      ringGradient.addColorStop(0, "rgba(122, 164, 159, 0)");
      ringGradient.addColorStop(0.5, "rgba(122, 164, 159, 0.15)");
      ringGradient.addColorStop(1, "rgba(122, 164, 159, 0)");

      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
      ctx.strokeStyle = ringGradient;
      ctx.lineWidth = 10;
      ctx.stroke();
    };

    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse position interpolation
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.1;

      const mouseX = mouseRef.current.x;
      const mouseY = mouseRef.current.y;

      // Draw the cursor glow effect
      if (mouseX > 0 && mouseY > 0) {
        drawGlow(ctx, mouseX, mouseY);
      }

      for (const star of starsRef.current) {
        // Calculate distance to mouse
        const dx = star.x - mouseX;
        const dy = star.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Stars near cursor get brighter and move faster
        let brightness = 1;
        let speedMultiplier = 1;
        
        if (distance < GLOW_INFLUENCE_RADIUS && mouseX > 0) {
          const influence = 1 - distance / GLOW_INFLUENCE_RADIUS;
          brightness = 1 + influence * 2;
          speedMultiplier = 1 + influence * 1.5;
          
          // Slight attraction/repulsion effect
          star.x += (dx / distance) * influence * 0.5;
          star.y += (dy / distance) * influence * 0.5;
        }

        // Parse and enhance the star color
        const baseColor = star.color;
        const alphaMatch = baseColor.match(/[\d.]+(?=\))/);
        const baseAlpha = alphaMatch ? parseFloat(alphaMatch[0]) : 0.5;
        
        // Fade in based on vertical position - stars fade in as they move down
        const fadeInDistance = window.innerHeight * 0.3; // Fade in over top 30% of screen
        const verticalFade = Math.min(star.y / fadeInDistance, 1);
        
        const enhancedAlpha = Math.min(baseAlpha * brightness * verticalFade, 1);
        const enhancedColor = baseColor.replace(/[\d.]+\)$/, `${enhancedAlpha})`);

        ctx.strokeStyle = enhancedColor;
        ctx.lineWidth = brightness > 1.5 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length, star.y + star.length);
        ctx.stroke();

        // Add glow to stars near cursor
        if (brightness > 1.3) {
          ctx.shadowColor = star.color.includes("173, 216, 230") 
            ? "rgba(173, 216, 230, 0.8)" 
            : "rgba(255, 182, 193, 0.8)";
          ctx.shadowBlur = 8 * (brightness - 1);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        star.x += star.baseSpeed * speedMultiplier;
        star.y += star.baseSpeed * speedMultiplier;

        if (star.x > window.innerWidth || star.y > window.innerHeight) {
          const spawnFromTop = Math.random() > 0.5;
          if (spawnFromTop) {
            star.x = Math.random() * window.innerWidth;
            star.y = -star.length;
          } else {
            star.x = -star.length;
            star.y = Math.random() * window.innerHeight;
          }

          star.color = randomColor();
          star.baseSpeed = STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED);
        }
      }

      animationFrameId = requestAnimationFrame(drawStars);
    };

    drawStars();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%", cursor: "none" }}
    />
  );
};

export default Starfield;
