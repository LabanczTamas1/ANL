import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowLeft, FiHome } from "react-icons/fi";
import { useLanguage } from "./../hooks/useLanguage";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glitchesRef = useRef<{ x: number; y: number; size: number }[]>([]);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-light px-4 py-10 text-center dark:bg-surface-dark sm:px-6">
      <div className="flex w-full max-w-2xl flex-col items-center">
        {/* Illustration */}
        <div className="glitch-wrapper w-full max-w-[260px] sm:max-w-[340px] md:max-w-[420px]">
          <canvas ref={canvasRef} className="h-auto w-full" />
        </div>

        {/* Title */}
        <h1 className="mt-6 text-3xl font-bold text-status-error sm:text-4xl md:text-5xl">
          {t("notFound.title")}
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-lg font-medium text-content dark:text-content-inverse sm:text-xl">
          {t("notFound.subtitle")}
        </p>

        {/* Description */}
        <p className="mt-2 max-w-md text-sm text-content-subtle dark:text-content-subtle-inverse sm:text-base">
          {t("notFound.description")}
        </p>

        {/* Requested path */}
        <div className="mt-5 w-full max-w-md break-all rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 dark:border-white/10 dark:bg-white/5">
          <span className="mr-2 text-xs uppercase tracking-wide text-content-subtle dark:text-content-subtle-inverse">
            {t("notFound.requestedPath")}:
          </span>
          <code className="text-sm font-medium text-content dark:text-content-inverse">
            {location.pathname}
          </code>
        </div>

        {/* Actions */}
        <div className="mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-gray-100 px-5 py-3 font-semibold text-content transition-colors hover:bg-gray-200 dark:border-white/10 dark:bg-white/5 dark:text-content-inverse dark:hover:bg-white/10"
          >
            <FiArrowLeft className="h-5 w-5" aria-hidden="true" />
            {t("notFound.goBack")}
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 font-semibold text-content-inverse transition-colors hover:bg-brand-hover"
          >
            <FiHome className="h-5 w-5" aria-hidden="true" />
            {t("notFound.goHome")}
          </button>
        </div>
      </div>
    </div>
  );
}
