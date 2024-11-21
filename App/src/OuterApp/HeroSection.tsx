import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex justify-center">
      <div className="flex flex-col items-center relative text-center z-10">
        <h1 className="text-4xl text-white px-2 mt-[10rem] md:text-6xl font-bold">
          Advertise your brand here and now
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Contact us if you want a meeting with us.
        </p>
        <Link to="/register">
        <button className="mt-6 bg-[#65558F] hover:bg-purple-600 text-black font-extrabold py-3 px-24 rounded-full flex items-center space-x-2 shadow-lg">
          <span>Book a meeting</span>
          <svg
            data-bbox="0 0.72 65.79 44.28"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 66 45"
            height="12"
            width="18"
            data-type="shape"
          >
            <g>
              <path d="M42.75 45h-9.36l19.35-18.9H0v-6.48h52.74L33.39.72h9.36l23.04 22.14L42.75 45Z"></path>
            </g>
          </svg>
        </button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
