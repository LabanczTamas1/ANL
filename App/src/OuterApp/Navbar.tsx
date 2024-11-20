import React from "react";
import lightLogo from "/public/light-logo.png";
import { Link } from "react-router-dom";


const Navbar = () => {
  return (
    <div className="relative h-screen px-50">
      <div className="p-10"></div>
      <div className="flex flex-row text-white p-4 border-t-2 border-white">
        <img src={lightLogo} alt="Logo" />
        <div className="ml-auto flex flex-row p-5 text-2xl">
          <Link to="/register" className="">
          <div className="p-5 hover:text-[#343E4C] font-extrabold font-inter">
            Contact
          </div>
          </Link>
          <Link to="/register" className="">
          <div className="p-5 hover:text-[#343E4C] font-extrabold font-inter">
            Contact
          </div>
          </Link>
          <Link to="/register" className="">
          <div className="p-5 hover:text-[#343E4C] font-extrabold font-inter">
            Contact
          </div>
          </Link>
          <Link to="/register" className="">
          <div className="p-5 hover:text-[#343E4C] font-extrabold font-inter">
            Contact
          </div>
          </Link>
          <Link to="/register" className="text-blue-500">
            <div className="bg-[#343E4C] text-white p-5 px-50 text-2xl font-extrabold font-inter hover:bg-sky-700">Sign In</div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
