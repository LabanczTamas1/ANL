import React, { Suspense } from "react";
import { Helmet } from "react-helmet-async";

// Components
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Footer from "./Footer";
import PersonCard from "./PersonCard";
import ScrollingCarousel from "../ScrollingCarousel";
import Timeline from "./Timeline";
import CookieConsentBanner from "./Informations.tsx/CookieConsentBanner";
import Starfield from "./Stars";
import ANLShape from "./components/MovingAnimation";
import { useLanguage } from "../hooks/useLanguage";
import stars from "/LandingPage.svg";

const LandingPage = () => {
  const { t } = useLanguage();

  return (
    <div className="relative bg-[#080A0D] overflow-hidden">
      <Helmet>
        <title>ANL | Watch Your Growth</title>
        <meta
          name="description"
          content="ANL helps you visualize growth with data-driven insights and personalized analytics."
        />
        <meta property="og:title" content="ANL | Watch Your Growth" />
        <meta
          property="og:description"
          content="Discover your potential with ANL — growth analytics for modern teams."
        />
        <meta property="og:image" content="/preview.jpg" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://yourdomain.com/" />
      </Helmet>

      {/* Background */}
      <div
        className="absolute inset-0 h-[112vh] bg-no-repeat bg-cover bg-center opacity-90 -z-10"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(8, 10, 13, 1) 100%), url(${stars})`,
        }}
        role="presentation"
        aria-hidden="true"
      ></div>

      <header>
        <Navbar />
      </header>
      <main>
        <HeroSection />

        {/* Founders Section */}
        <section
          id="founders"
          aria-labelledby="founders-title"
          className="pt-20 bg-gradient-to-b from-[#080A0D] via-[#65558F] to-black"
        >
          <h2
            id="founders-title"
            className="text-white text-center font-bold text-3xl md:text-4xl pb-8"
          >
            {t("Founders") || "Founders"}
          </h2>

          <div className="flex flex-col md:flex-row gap-10 md:gap-20 justify-center items-center px-6 pb-24">
            <PersonCard
              imageUrl="/John_Doe.png"
              name="Test Elek"
              position="Founder"
              description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text since the 1500s."
            />
            <PersonCard
              imageUrl="/John_Doe.png"
              name="Doe John"
              position="Co-Founder"
              description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text since the 1500s."
            />
          </div>
        </section>

        {/* Scrolling Carousel */}
        <Suspense fallback={<div className="text-center text-white py-20">Loading carousel...</div>}>
          <section aria-label="Scrolling showcase">
            <ScrollingCarousel />
          </section>
        </Suspense>

        {/* Timeline */}
        <section aria-label="Company Timeline" className="bg-[#080A0D] py-16">
          <Timeline />
        </section>

        {/* Animated Section */}
        <section
          className="relative bg-black w-full h-screen overflow-hidden flex items-center justify-center"
          aria-label="Animated ANL logo"
        >
          <Starfield />
          <div className="absolute inset-0 flex items-center justify-center">
            <ANLShape size="2xl" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer darkMode={true} />

      {/* Cookie Consent */}
      <CookieConsentBanner />
    </div>
  );
};

export default LandingPage;
