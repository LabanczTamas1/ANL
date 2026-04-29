import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Footer from "./Footer";
import { Helmet } from "react-helmet-async";
import CookieConsentBanner from "./Informations.tsx/CookieConsentBanner";
import { useLanguage } from "../hooks/useLanguage";
import Starfield from "./Stars";
import ANLShape from "./components/MovingAnimation";
// Modern Components
import ModernFoundersSection from "./components/ModernFoundersSection";
import YouTubeSection from "./components/YouTubeSection";
import FeatureGrid from "./components/FeatureGrid";
import ModernTimeline from "./components/ModernTimeline";
import TestimonialSection from "./components/TestimonialSection";
import CTASection from "./components/CTASection";
import GradientDivider from "./components/GradientDivider";
import FloatingParticles from "./components/FloatingParticles";

// Founders data
const founders = [
  {
    imageUrl: "/Picture1.png",
    name: "Péterfi Szabolcs",
    position: "Founder",
    description: "Insipiring leader with a passion for innovation and a track record of driving growth through strategic vision and execution.",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "peterfi@anl.com",
    },
  },
  {
    imageUrl: "/Picture1.png",
    name: "Koszta Zsolt",
    position: "Co-Founder",
    description: "Strategic thinker specializing in growth marketing and data-driven decision making to help businesses reach their full potential.",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "contact@anl.com",
    },
  },
];

const LandingPage = () => {
  // Language hook available for future translations
  useLanguage();
  
  return (
    <div className="bg-surface-overlay relative overflow-hidden">
      <Helmet>
        <title>ANL | Watch Your Growth</title>
        <meta
          name="description"
          content="Transform your business with ANL's innovative digital solutions. We help companies grow through data-driven strategies and cutting-edge technology."
        />
      </Helmet>

      {/* Background SVG
      <div
        className="absolute h-[112vh] inset-0 bg-no-repeat bg-cover bg-center z-0"
        // style={{
        //   backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(8, 10, 13, 1) 100%), url(${stars})`,
        //   opacity: 1,
        // }}
      /> */}

      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Unchanged as requested */}
      <CTASection 
        title="Ready to Transform Your Business?"
        subtitle="Let's discuss how we can help you achieve your goals. Book a free consultation today."
        primaryButtonText="Book a Meeting"
        primaryButtonLink="/booking"
        secondaryButtonText="Learn More"
        secondaryButtonLink="/about"
        fullHeight={true}
      />

      {/* Gradient Divider */}
      <GradientDivider style="wave" />

      {/* Modern Founders Section */}
      <ModernFoundersSection 
        founders={founders}
        title="Meet the Founders"
        subtitle="The visionaries behind your digital transformation journey"
      />

      {/* YouTube Videos Section */}
      <section className="relative bg-surface-black">
        <FloatingParticles particleCount={40} />
        <YouTubeSection />
      </section>

      {/* Gradient Divider */}
      <GradientDivider style="glow" />

      {/* Feature Grid Section */}
      <FeatureGrid 
        title="Why Choose ANL"
        subtitle="Discover the tools and expertise that will transform your business"
      />

      {/* Modern Timeline Section */}
      <ModernTimeline 
        title="Your Journey With Us"
        subtitle="A simple, transparent process designed for your success"
      />

      {/* Gradient Divider */}
      <GradientDivider style="mesh" />

      {/* Testimonials Section */}
      <TestimonialSection 
        title="What Our Clients Say"
        subtitle="Don't just take our word for it — hear from businesses we've helped grow"
      />

      {/* Interactive Starfield with ANL Shape - Unchanged as requested */}
      <section className="relative bg-surface-black overflow-hidden w-full h-screen">
        <Starfield />
        <div className="absolute inset-0 flex items-center justify-center">
          <ANLShape size="2xl" />
        </div>
      </section>

      {/* Footer - Unchanged as requested */}
      <Footer darkMode={true} />
      
      {/* Cookie Consent Banner - Unchanged as requested */}
      <CookieConsentBanner />
    </div>
  );
};

export default LandingPage;
