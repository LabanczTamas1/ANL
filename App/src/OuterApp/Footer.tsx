import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import lightLogo from "/public/light-logo.png";
import darkLogo from "/public/dark-logo.png";
import facebookIcon from "/public/socialMedia/Facebook.svg";
import instagramIcon from "/public/socialMedia/Instagram.svg";
import linkedinIcon from "/public/socialMedia/Linkedin.svg";
import youtubeIcon from "/public/socialMedia/Youtube.svg";
import whatsAppIcon from "/public/socialMedia/WhatsApp.svg";
import { Link } from "react-router-dom";

interface FooterProps{
  darkMode?: boolean;
}

const Footer: React.FC<FooterProps> = ({darkMode}) => {
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState<boolean>(false);
  const [isLanguagesOpen, setIsLanguagesOpen] = useState<boolean>(false);

  // Refs for dropdown content
  const termsRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const languagesRef = useRef<HTMLDivElement>(null);

  // Reusable toggle function with scroll
  const handleToggle = (
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    ref: React.RefObject<HTMLDivElement>
  ) => {
    setIsOpen(!isOpen);
  };

  // Effect hook to scroll to the section when it's opened
  useEffect(() => {
    if (isTermsOpen && termsRef.current && window.innerWidth <= 768) {
      termsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isTermsOpen]);

  useEffect(() => {
    if (isCompanyOpen && companyRef.current && window.innerWidth <= 768) {
      companyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isCompanyOpen]);

  useEffect(() => {
    if (isLanguagesOpen && languagesRef.current && window.innerWidth <= 768) {
      languagesRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isLanguagesOpen]);

  console.log(darkMode);
  return (
    <footer className={`flex flex-col md:flex-row justify-center lg:gap-20 p-5 text-[0.875em] h-auto md:h-[16rem] ${
      darkMode ? "bg-black text-white" : "bg-white text-black border-t-2 border-t-gray-500 shadow-md shadow-gray-500 mt-4"
    }`}>
      {/* Company Information */}
      <div className="text-[#A5A5A5] w-full md:w-[15em] text-center md:text-left mr-10">
        <div className="flex flex-row justify-center md:justify-start items-center text-white gap-2">
          <img src={darkMode ? lightLogo : darkLogo} alt="Logo" className="w-18 h-10" />
          <span>Ads and Leads srl.</span>
        </div>
        <p className="mt-2">
          With us, create more and more. We help to grow more and more.
        </p>
        <div className="flex flex-row gap-3 mt-3 justify-center">
          <Link to="/">
            <img src={youtubeIcon} alt="YouTube" className="w-10 h-10 hover:opacity-80" />
          </Link>
          <Link to="/">
            <img src={linkedinIcon} alt="LinkedIn" className="w-8 h-10 hover:opacity-80" />
          </Link>
          <Link to="/">
            <img src={whatsAppIcon} alt="WhatsApp" className="w-8 h-10 hover:opacity-80" />
          </Link>
          <Link to="/">
            <img src={facebookIcon} alt="Facebook" className="w-8 h-9 hover:opacity-80" />
          </Link>
          <Link to="/">
            <img src={instagramIcon} alt="Instagram" className="w-8 h-10 hover:opacity-80" />
          </Link>
        </div>
      </div>

      {/* Terms and Policy Section */}
      <div className="text-center md:text-left md:flex md:flex-col">
        <div className="mt-4 md:mt-0 md:flex md:flex-col">
          <button
            onClick={() => handleToggle(isTermsOpen, setIsTermsOpen, termsRef)}
            className="w-full flex justify-between items-center md:cursor-default"
          >
            Terms and Policy
            <span className="md:hidden">
              {isTermsOpen ? (
                <MdKeyboardArrowUp size={24} color="white" />
              ) : (
                <MdKeyboardArrowDown size={24} color="white" />
              )}
            </span>
          </button>
          <div
            ref={termsRef}
            className={`${
              isTermsOpen ? "block" : "hidden"
            } md:block md:flex md:flex-col flex flex-col text-[#A5A5A5] gap-2 mt-2`}
          >
            <Link to="/information">Cookies</Link>
            <Link to="/">Terms and conditions</Link>
            <Link to="/information/privacy-policy">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* Company Section */}
      <div className="text-center md:text-left">
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => handleToggle(isCompanyOpen, setIsCompanyOpen, companyRef)}
            className="w-full flex justify-between items-center md:cursor-default"
          >
            Company
            <span className="md:hidden">
              {isCompanyOpen ? (
                <MdKeyboardArrowUp size={24} color="white" />
              ) : (
                <MdKeyboardArrowDown size={24} color="white" />
              )}
            </span>
          </button>
          <div
            ref={companyRef}
            className={`${
              isCompanyOpen ? "block" : "hidden"
            } md:block flex flex-col md:flex md:flex-col text-[#A5A5A5] gap-2 mt-2`}
          >
            <Link to="/">About Us</Link>
            <Link to="/">Our Team</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Languages Section */}
      <div className="text-center md:text-left">
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => handleToggle(isLanguagesOpen, setIsLanguagesOpen, languagesRef)}
            className="w-full flex justify-between items-center md:cursor-default"
          >
            Languages
            <span className="md:hidden">
              {isLanguagesOpen ? (
                <MdKeyboardArrowUp size={24} color="white" />
              ) : (
                <MdKeyboardArrowDown size={24} color="white" />
              )}
            </span>
          </button>
          <div
            ref={languagesRef}
            className={`${
              isLanguagesOpen ? "block" : "hidden"
            } md:block flex flex-col md:flex md:flex-col text-[#A5A5A5] gap-2 mt-2`}
          >
            <Link to="/">English</Link>
            <Link to="/">Magyar</Link>
            <Link to="/">Romana</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
