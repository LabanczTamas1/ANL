import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "./../hooks/useLanguage";

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [glitches, setGlitches] = useState<
    { x: number; y: number; size: number }[]
  >([]);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

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
        ctx.drawImage(img, 0, 0, img.width, img.height); // Redraw base image

        const newGlitch = {
          x: Math.floor(Math.random() * canvas.width),
          y: Math.floor(Math.random() * canvas.height),
          size: Math.floor(Math.random() * 30) + 10,
        };

        setGlitches((prev) => [...prev.slice(-10), newGlitch]);

        glitches.forEach(({ x, y, size }, index) => {
          ctx.fillStyle = `rgba(${Math.random() * 255}, 0, ${
            Math.random() * 255
          }, ${1 - index * 0.1})`;
          ctx.fillRect(x, y, size, size);
        });
      };

      const interval = setInterval(glitchEffect, 100);
      return () => clearInterval(interval);
    };
  }, [glitches]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600">{t("notFound.title")}</h1>
      <p className="text-xl py-2">{t("notFound.subtitle")}</p>
      <div className="glitch-wrapper">
        <canvas ref={canvasRef} className="w-[70vh] h-auto" />
      </div>
      <p className="mt-4 text-lg flex gap-4 justify-center">
        <button
          onClick={() => navigate(-1)} // Go back to previous page
          className="text-white hover:underline bg-blue-600 p-2 rounded-xl"
        >
          {t("notFound.goBack")}
        </button>
        <button
          onClick={() => navigate("/")} // Always go to home
          className="text-white hover:underline bg-green-600 p-2 rounded-xl"
        >
          {t("notFound.goHome")}
        </button>
      </p>
    </div>
  );
}
