import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "./../hooks/useLanguage";

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glitchesRef = useRef<{ x: number; y: number; size: number }[]>([]);
  const { t } = useLanguage();
  const navigate = useNavigate();

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
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const newGlitch = {
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
          size: Math.floor(Math.random() * 30) + 10,
        };

        glitchesRef.current = [...glitchesRef.current.slice(-10), newGlitch];

        glitchesRef.current.forEach(({ x, y, size }, index) => {
          ctx.fillStyle = `rgba(${Math.random() * 255}, 0, ${
            Math.random() * 255
          }, ${1 - index * 0.1})`;
          ctx.fillRect(x, y, size, size);
        });
      };

      const interval = setInterval(glitchEffect, 100);
      return () => clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-surface-light dark:bg-surface-dark">
      <h1 className="text-4xl font-bold text-status-error">{t("notFound.title")}</h1>
      <p className="text-xl py-2 text-content-subtle dark:text-content-subtle-inverse">{t("notFound.subtitle")}</p>
      <div className="glitch-wrapper">
        <canvas ref={canvasRef} className="w-[70vh] h-auto" />
      </div>
      <p className="mt-4 text-lg flex gap-4 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="text-content-inverse hover:underline bg-brand hover:bg-brand-hover px-4 py-2 rounded-xl transition-colors"
        >
          {t("notFound.goBack")}
        </button>
        <button
          onClick={() => navigate("/")}
          className="text-content-inverse hover:underline bg-brand hover:bg-brand-hover px-4 py-2 rounded-xl transition-colors"
        >
          {t("notFound.goHome")}
        </button>
      </p>
    </div>
  );
}
