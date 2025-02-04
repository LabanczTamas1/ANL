//import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CustomNavbar from "./CustomNavbar";
import Footer from "../Footer";

const InformationsLayout = () => {

    const location = useLocation().pathname;
    console.log(location);


  return (
    <div  className="relative">
        <div
      className="absolute h-screen inset-0 bg-no-repeat bg-cover bg-center z-0"
    ></div>
        <CustomNavbar />
      <div className="">
        <Outlet />
      </div>
      <Footer darkMode={false}/>
    </div>
  );
};

export default InformationsLayout;
