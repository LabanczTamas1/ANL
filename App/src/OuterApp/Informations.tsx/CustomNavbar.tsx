import React, { useState, useEffect } from "react";
import darkLogo from "/public/dark-logo.png";
import { Link } from "react-router-dom";
import NavigationButton from "../components/NavigationButton";

const CustomNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Listen to scroll event with debounce
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50;
      if (window.scrollY > scrollThreshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Debounce scroll event to improve performance
    let debounceTimeout: number | null = null;
    const debouncedHandleScroll = () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      debounceTimeout = window.setTimeout(handleScroll, 50);
    };

    window.addEventListener("scroll", debouncedHandleScroll);
    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
      window.removeEventListener("scroll", debouncedHandleScroll);
    };
  }, []);

  return (
    <div
      className={`relative sticky top-0 z-50 transition-all duration-30 bg-white ${
        isScrolled
          ? "lg:p-5 lg:pb-0 lg:pt-0 lg:mt-0 shadow-lg [box-shadow-color:rgba(0,0,0,0.25)]"
          : "lg:p-10 lg:pt-[50px] lg:mt-0"
      }`}
    >
      {/* Navbar container */}
      <div
        className={`flex items-center justify-between text-white lg:py-4 ${
          isScrolled ? "" : "lg:border-t-2 lg:border-black"
        }`}
      >
        <Link to="/" className="pl-5">
          <img
            src={darkLogo}
            alt="Logo"
            className={`transition-all duration-300 ${
              isScrolled ? "lg:h-16 h-[4rem] pt-1" : "lg:h-20 h-[5rem] pt-3"
            }`}
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:items-center lg:h-full space-x-8 text-2xl text-black font-bold font-inter mt-0">
          <Link to="/contact" className="hover:text-[#343E4C] p-5">
            Contact
          </Link>
          <Link to="/register" className="hover:text-[#343E4C] p-5">
            Services
          </Link>
          <Link to="/register" className="hover:text-[#343E4C] p-5">
            About
          </Link>
          <Link to="/login">
            <div className="bg-[#343E4C] text-white p-4 px-20 rounded hover:bg-sky-700">
              Login
            </div>
          </Link>
          <Link to="/register">
            <button className="bg-[#343E4C] text-white p-4 px-20 rounded hover:bg-sky-700">
              Sign in
            </button>
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="lg:hidden text-white focus:outline-none pr-3"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="black"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden flex flex-col space-y-4 text-xl font-inter font-extrabold text-gray-800  p-5 rounded-md">
          <Link to="/register" className="hover:text-gray-300">
            Contact
          </Link>
          <Link to="/register" className="hover:text-gray-300">
            Services
          </Link>
          <Link to="/register" className="hover:text-gray-300">
            About
          </Link>
          <Link to="/register" className="hover:text-gray-300">
            Blog
          </Link>
          <div className="flex flex-wrap w-full justify-between [&>*>button]:w-full [&>*]:w-full gap-4">
          <NavigationButton url="/login" text="Login"/>
          <NavigationButton url="/register" text="Sign up"/>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomNavbar;
