import React from "react";
import Navbar from "./Navbar";
import stars from "/public/LandingPage.svg";
import HeroSection from "./HeroSection";
import Footer from "./Footer";
import PersonCard from "./PersonCard";
import ScrollingCarousel from "../ScrollingCarousel";
import Timeline from "./Timeline";
import { Helmet } from "react-helmet-async";
import CookieConsentBanner from "./Informations.tsx/CookieConsentBanner";
import { useLanguage } from "../hooks/useLanguage";

const LandingPage = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-[#080A0D] relative">
      <Helmet>
        <title>ANL | Watch Your Growth</title>
        <meta
          name="description"
          content="This is a custom description for this page."
        />
      </Helmet>

      {/* Background SVG */}
      <div
        className="absolute h-[112vh] inset-0 bg-no-repeat bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${stars})`, opacity: 1 }}
      ></div>

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      <h2 className="text-white text-center font-bold text-[2em] bg-[#080A0D] pt-16 pb-4">
        Founders
      </h2>
      <section className="flex md:flex-row gap-50 md:justify-around flex-col items-center justify-center pt-[100px] bg-gradient-to-b from-[#080A0D] to-black via-[#65558F]">
        <PersonCard
          imageUrl="/public/Picture1.png"
          name="Koszta Zsolt"
          position="Co-Founder"
          description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Metin?"
        />
        <PersonCard
          imageUrl="/public/Picture1.png"
          name="Koszta Zsolt"
          position="Co-Founder"
          description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Metin?"
        />
      </section>
      <section>
        <ScrollingCarousel />
      </section>
      <section className="">
        <Timeline />
      </section>

      <section className="h-[0vh]"></section>

      <Footer darkMode={true} />
      {/* Cookie Consent Banner */}
      <CookieConsentBanner />
    </div>
  );
};

export default LandingPage;
