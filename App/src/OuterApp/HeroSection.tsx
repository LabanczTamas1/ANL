import stars from '/public/Stars.svg';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center">
     

      <div className="flex flex-col items-center relative text-center">
        <h1 className="text-4xl md:text-6xl font-bold">
          Advertise your brand here and now
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300">
          Contact us if you want a meeting with us.
        </p>
        <button className="mt-6 bg-[#65558F] hover:bg-purple-600 text-white py-3 px-8 rounded-full flex items-center space-x-2 shadow-lg">
          <span>Book a meeting</span>
          <span>→</span>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
