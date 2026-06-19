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

const LandingPage = () => {
  const { t } = useLanguage();

  const founders = [
    {
      imageUrl: "/Picture1.png",
      name: "Péterfi Szabolcs",
      position: t("about.founder"),
      description: t("about.founder1Desc"),
      socials: {
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        email: "peterfi@anl.com",
      },
    },
    {
      imageUrl: "/Picture1.png",
      name: "Koszta Zsolt",
      position: t("about.coFounder"),
      description: t("about.founder2Desc"),
      socials: {
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        email: "contact@anl.com",
      },
    },
  ];

  return (
    <div className="bg-surface-overlay relative overflow-hidden">
      <Helmet>
        <title>{t("landing.metaTitle")}</title>
        <meta
          name="description"
          content={t("landing.metaDescription")}
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
        title={t("cta.defaultTitle")}
        subtitle={t("cta.defaultSubtitle")}
        primaryButtonText={t("cta.bookMeeting")}
        primaryButtonLink="/booking"
        secondaryButtonText={t("cta.learnMore")}
        secondaryButtonLink="/about"
        fullHeight={true}
      />

      {/* Gradient Divider */}
      <GradientDivider style="wave" />

      {/* Modern Founders Section */}
      <ModernFoundersSection 
        founders={founders}
        title={t("landing.foundersTitle")}
        subtitle={t("landing.foundersSubtitle")}
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
        title={t("landing.featureTitle")}
        subtitle={t("landing.featureSubtitle")}
      />

      {/* Modern Timeline Section */}
      <ModernTimeline 
        title={t("landing.timelineTitle")}
        subtitle={t("landing.timelineSubtitle")}
      />

      {/* Gradient Divider */}
      <GradientDivider style="mesh" />

      {/* Testimonials Section */}
      <TestimonialSection 
        title={t("landing.testimonialsTitle")}
        subtitle={t("landing.testimonialsSubtitle")}
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
