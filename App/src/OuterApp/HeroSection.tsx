import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

const HeroSection = () => {
  const { t } = useLanguage();

  return (
    <>
      <style>
        {`
          @keyframes moveGradient {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
        `}
      </style>

      <section className="relative h-screen flex justify-center pb-[20vh] items-center">
        <div className="flex flex-col items-center relative text-center z-10">
          <h1 className="text-4xl bg-gradient-to-r from-[#7AA49F] via-[#9A4647] to-[#7AA49F] bg-[length:200%_100%] bg-left bg-clip-text text-transparent animate-[moveGradient_10s_linear_infinite] px-2 md:max-w-[40vw] max-w-[80vw] md:text-6xl font-bold break-words">
            {t('heroHeading')}
          </h1>

          <p className="mt-4 text-lg md:text-xl text-gray-300">
            {t('heroSubheading')}
          </p>

          <Link
            to="/register"
            className="mt-6 bg-[#65558F] hover:bg-sky-500 text-black font-extrabold py-3 px-24 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
          >
            <span className="text-white text-lg font-bold drop-shadow-[0.5px_0.5px_0px_white]">
              {t('CTAButton')}
            </span>
          </Link>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
