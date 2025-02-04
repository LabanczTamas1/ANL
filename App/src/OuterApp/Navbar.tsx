import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Added for animations
import lightLogo from "/public/light-logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Listen to scroll event
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
      className={`relative sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "lg:p-5 lg:pb-0 bg-[#080A0D] lg:pt-0 lg:mt-0" : "lg:p-10 lg:pt-[50px] lg:mt-0"
      }`}
    >
      {/* Navbar container */}
      <div
        className={`flex items-center justify-between text-white lg:py-4 ${
          isScrolled ? "" : "lg:border-t-2 lg:border-white"
        }`}
      >
        <Link to="/" className="pl-5">
          <img
            src={lightLogo}
            alt="Logo"
            className={`transition-all duration-300 ${
              isScrolled ? "lg:h-16 h-[4rem] pt-1" : "lg:h-20 h-[5rem] pt-3"
            }`}
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex lg:items-center lg:h-full space-x-8 text-2xl font-bold font-inter mt-0">
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
            <div className="bg-[#65558F] text-white p-4 px-20 rounded hover:bg-sky-700">
              Login
            </div>
          </Link>
          <Link to="/register">
            <div className="bg-[#65558F] text-white p-4 px-20 rounded hover:bg-sky-700">
              Sign in
            </div>
          </Link>
        </div>
        <div className="lg:hidden flex gap-5">
          <Link to="/login">
            <div className="bg-[#65558F] text-white p-0 px-4 md:p-3 md:px-12 rounded hover:bg-sky-700">
              Login
            </div>
          </Link>
          <Link to="/register">
            <div className="bg-[#65558F] text-white p-0 px-4 md:p-3 md:px-12 rounded hover:bg-sky-700">
              Sign in
            </div>
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="lg:hidden text-white focus:outline-none pr-3 md:pl-3 md:pl-[62px]"
          onClick={toggleMenu}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
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
      <AnimatePresence>
        {/* Added AnimatePresence for animation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} // Animation start state
            animate={{ opacity: 1, y: 0 }} // Animation end state
            exit={{ opacity: 0, y: -20 }} // Exit animation
            transition={{ duration: 0.3 }} // Animation duration
            className="lg:hidden absolute z-10 w-full flex flex-col space-y-4 text-xl font-inter font-extrabold text-white p-5 rounded-md bg-[#080A0D]"
          >
            <Link to="/contact" className="hover:text-gray-300">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;
