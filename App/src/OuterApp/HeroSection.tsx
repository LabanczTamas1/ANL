import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative h-screen flex justify-center pb-[20vh] items-center">
      <div className="flex flex-col items-center relative text-center z-10">
        <h1 className="text-4xl text-white px-2 md:max-w-[40vw] max-w-[80vw] md:text-6xl font-bold break-words">
          Advertise your brand here and now
        </h1>

        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Contact us if you want a meeting with us.
        </p>
        <Link to="/register">
          <button className="mt-6 bg-[#65558F] hover:hover:bg-sky-500 text-black font-extrabold py-3 px-24 rounded-full flex items-center space-x-2 shadow-lg border-2 border-gray-800">
          <span className="text-white text-lg font-bold drop-shadow-[0.5px_0.5px_0px_white]">Book a meeting</span>
          </button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
