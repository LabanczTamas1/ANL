import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import ContactForm from "./ContactForm";

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-white to-black">
      <Navbar />
      <div className="flex flex-row justify-around items-center flex-grow">
        <div className="p-8">
          <div className="flex flex-row items-center mb-6">
            <FontAwesomeIcon icon={faHouse} className="w-8 h-8 text-black mr-4"/>
            <div className="font-extrabold text-lg">
              Address
              <div className="font-bold text-sm">
                Example Street, Romania, Targu Mures, 501234
              </div>
            </div>
          </div>
          <div className="mb-4">
          <FontAwesomeIcon icon={faHouse} className="w-8 h-8 text-black mr-4"/>
            <strong>Phone:</strong> +40 123 456 789
          </div>
          <div>
          <FontAwesomeIcon icon={faHouse} className="w-8 h-8 text-black mr-4"/>
            <strong>Email:</strong> 
            <div>email@gmail.com</div>
          </div>
        </div>
        <div>
            <ContactForm />
        </div>
      </div>
        <Footer />
      
    </div>
  );
};

export default Contact;
