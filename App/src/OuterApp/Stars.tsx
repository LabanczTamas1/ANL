import React, { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
}

// Configurable constants
const STAR_COUNT = 200;
const STAR_MIN_LENGTH = 1;
const STAR_MAX_LENGTH = 40; // 1 + 3
const STAR_MIN_SPEED = 0.5;
const STAR_MAX_SPEED = 5.5; // 0.5 + 2
const STAR_COLOR_LIGHT = 'rgba(173, 216, 230,'; // light blue
const STAR_COLOR_PINK = 'rgba(255, 182, 193,'; // light pink

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);

  const randomColor = () =>
    Math.random() > 0.5
      ? `${STAR_COLOR_LIGHT} ${Math.random()})`
      : `${STAR_COLOR_PINK} ${Math.random()})`;

  const initStars = (width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: STAR_MIN_LENGTH + Math.random() * (STAR_MAX_LENGTH - STAR_MIN_LENGTH),
        speed: STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED),
        color: randomColor(),
      });
    }
    starsRef.current = stars;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    window.addEventListener('resize', resize);
    resize(); // initial setup

    let animationFrameId: number;

    const drawStars = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        ctx.strokeStyle = star.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length, star.y + star.length);
        ctx.stroke();

        star.x += star.speed;
        star.y += star.speed;

       if (star.x > canvas.width || star.y > canvas.height) {
  // respawn anywhere along the top or left
  const spawnFromTop = Math.random() > 0.5;
  if (spawnFromTop) {
    star.x = Math.random() * canvas.width;
    star.y = -star.length; // above the screen
  } else {
    star.x = -star.length; // left of the screen
    star.y = Math.random() * canvas.height;
  }

  star.color = randomColor();
  star.speed = STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED);
}

      }

      animationFrameId = requestAnimationFrame(drawStars);
    };

    drawStars();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
};

export default Starfield;
