import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faLightbulb, faBullseye, faHandshake, faCogs, faChartLine } from "@fortawesome/free-solid-svg-icons";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-[#65558F] to-black">
      <Navbar />
      <div className="flex lg:flex-row flex-col justify-evenly items-center flex-grow">
        <div className="m-8 text-white w-full px-8 lg:w-[40vw]">
          <div className="flex flex-col items-left lg:m-6 my-6 lg:ml-0 lg:w-full">
            <h2 className="text-[2em] mb-3 border-b-2">About Us</h2>
            Welcome to our company! We are dedicated to providing top-notch solutions 
            and services to our customers. Our mission is to innovate, inspire, and 
            drive success through technology and creativity. With a team of experienced 
            professionals, we strive to make a positive impact in the industry and 
            ensure customer satisfaction.
            <br /><br />
            Over the years, we have built a strong reputation for delivering high-quality 
            products and services. Our expertise spans various industries, allowing us to 
            adapt to different challenges and create customized solutions that meet our 
            clients' needs. We believe in continuous learning and improvement, ensuring that 
            we stay ahead of industry trends and advancements.
            <br /><br />
            Collaboration and innovation are at the heart of everything we do. We foster 
            a culture of teamwork and encourage our employees to think outside the box, 
            pushing boundaries to achieve excellence. Our commitment to integrity, 
            transparency, and customer-centric approaches drives us to exceed expectations.
          </div>
          <div className="flex flex-row items-center p-4 mr-0 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faUsers}
              className="w-8 h-8 text-white mr-4"
            />
            <div className="font-extrabold text-lg">
              Our Team
              <div className="font-bold text-sm">
                Passionate professionals dedicated to excellence.
              </div>
            </div>
          </div>
          <div className="p-4 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faLightbulb}
              className="w-8 h-8 text-white mr-4"
            />
            <strong>Our Vision:</strong> Innovate and inspire through technology.
          </div>
          <div className="p-4 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faBullseye}
              className="w-8 h-8 text-white mr-4"
            />
            <strong>Our Mission:</strong> Delivering quality solutions to empower businesses.
          </div>
          <div className="p-4 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faHandshake}
              className="w-8 h-8 text-white mr-4"
            />
            <strong>Our Values:</strong> Integrity, transparency, and customer satisfaction.
          </div>
          <div className="p-4 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faCogs}
              className="w-8 h-8 text-white mr-4"
            />
            <strong>Our Process:</strong> We follow a structured approach to ensure efficiency and quality in every project.
          </div>
          <div className="p-4 lg:w-[40vw] bg-white/5">
            <FontAwesomeIcon
              icon={faChartLine}
              className="w-8 h-8 text-white mr-4"
            />
            <strong>Our Growth:</strong> Expanding our services globally to reach new heights.
          </div>
        </div>
      </div>
      <Footer darkMode={true} />
    </div>
  );
};

export default About;
