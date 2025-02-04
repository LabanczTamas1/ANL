import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faPhone, faAt } from "@fortawesome/free-solid-svg-icons";
import ContactForm from "./ContactForm";

const Contact = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-[#65558F] to-black">
      <Navbar />
      <div className="flex lg:flex-row flex-col justify-evenly items-center flex-grow">
        <div className="m-8 text-white w-full px-8 lg:w-[40vw]">
          <div className="flex flex-col items-left lg:m-6 my-6 lg:ml-0 lg:w-full">
            <h2 className="text-[2em] mb-3 border-b-2">Get in Touch with Us</h2>
             We’d love to hear from you! Whether you have a
            question, suggestion, or just want to say hello, our team is here to
            assist you. Please feel free to reach out using the contact form
            below, or if you prefer, you can use the contact details provided.
            We aim to respond as quickly as possible and will make sure to get
            back to you with the information or help you need. We look forward
            to connecting with you!
          </div>
          <div className="flex flex-row items-center p-4 mr-0 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faHouse}
              className="w-8 h-8 text-white mr-4"
            />
            <div className="font-extrabold text-lg">
              Address
              <div className="font-bold text-sm">
                Example Street, Romania, Targu Mures, 501234
              </div>
            </div>
          </div>
          <div className="p-4 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faPhone}
              className="w-8 h-8 text-white mr-4"
            />
            <strong>Phone:</strong> +40 123 456 789
          </div>
          <div>
            <div className="p-4 lg:w-[40vw] bg-white/5">
              <FontAwesomeIcon
                icon={faAt}
                className="w-8 h-8 text-white mr-4"
              />
              <strong>Email:</strong> email@gmail.com
            </div>
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
      <Footer darkMode={true}/>
    </div>
  );
};

export default Contact;
