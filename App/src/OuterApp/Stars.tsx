import React, { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
}

const STAR_COUNT = 200;
const STAR_MIN_LENGTH = 1;
const STAR_MAX_LENGTH = 40;
const STAR_MIN_SPEED = 0.5;
const STAR_MAX_SPEED = 5.5;
const STAR_COLOR_LIGHT = "rgba(173, 216, 230,";
const STAR_COLOR_PINK = "rgba(255, 182, 193,";

const Starfield: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);

  const randomColor = () =>
    Math.random() > 0.5
      ? `${STAR_COLOR_LIGHT}${Math.random()})`
      : `${STAR_COLOR_PINK}${Math.random()})`;

  const initStars = (width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length:
          STAR_MIN_LENGTH + Math.random() * (STAR_MAX_LENGTH - STAR_MIN_LENGTH),
        speed:
          STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED),
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

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;

    const drawStars = () => {
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
          star.speed =
            STAR_MIN_SPEED + Math.random() * (STAR_MAX_SPEED - STAR_MIN_SPEED);
        }
      }

      animationFrameId = requestAnimationFrame(drawStars);
    };

    drawStars();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
};

export default Starfield;
