import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "./../hooks/useLanguage"; // Update this path

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [glitches, setGlitches] = useState<{ x: number; y: number; size: number }[]>([]);
  const { t } = useLanguage(); // Use the language hook

  useEffect(() => {
    const img = new Image();
    img.src = "/404/reshot-illustration-empty-website-page-KBG392DTQW.png";

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const glitchEffect = () => {
        if (!canvasRef.current) return;

        ctx.drawImage(img, 0, 0, img.width, img.height); // Always redraw base image

        // Add a new glitch block
        const newGlitch = {
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
          size: Math.floor(Math.random() * 30) + 10, // Block size 10-40px
        };

        setGlitches((prev) => [...prev.slice(-10), newGlitch]); // Keep the last 10 glitches

        // Draw all glitch blocks
        glitches.forEach(({ x, y, size }, index) => {
          ctx.fillStyle = `rgba(${Math.random() * 255}, 0, ${Math.random() * 255}, ${1 - index * 0.1})`; // Glitch fade effect
          ctx.fillRect(x, y, size, size);
        });
      };

      const interval = setInterval(glitchEffect, 100);
      return () => clearInterval(interval);
    };
  }, [glitches]); // Re-run when glitches change

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600">{t('notFound.title')}</h1>
      <p className="text-xl py-2">{t('notFound.subtitle')}</p>
      <div className="glitch-wrapper">
        <canvas ref={canvasRef} className="w-[70vh] h-auto" />
      </div>
      <p className="mt-4 text-lg">
        <Link to="/" className="text-white hover:underline bg-blue-600 p-2 rounded-xl">
          {t('notFound.goBack')}
        </Link>
      </p>
    </div>
  );
}