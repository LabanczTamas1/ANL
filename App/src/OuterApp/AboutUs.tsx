import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AboutCinematicHero from "./components/AboutCinematicHero";
import AboutStoryChapters, { AboutValues } from "./components/AboutStoryChapters";
import ModernFoundersSection from "./components/ModernFoundersSection";
import AnimatedStats from "./components/AnimatedStats";
import TestimonialSection from "./components/TestimonialSection";
import GradientDivider from "./components/GradientDivider";
import MountainParallax from "./components/MountainParallax";
import CTASection from "./components/CTASection";
import FloatingParticles from "./components/FloatingParticles";
import { FaUsers, FaChartLine, FaStar, FaGlobe } from "react-icons/fa";
import { useLanguage } from "../hooks/useLanguage";

const About = () => {
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

  const stats = [
    { value: 300, suffix: "+", label: t("about.statCampaigns"), icon: <FaChartLine className="w-5 h-5" /> },
    { value: 50, suffix: "+", label: t("about.statClients"), icon: <FaUsers className="w-5 h-5" /> },
    { value: 12, suffix: "", label: t("about.statCountries"), icon: <FaGlobe className="w-5 h-5" /> },
    { value: 97, suffix: "%", label: t("about.statSatisfaction"), icon: <FaStar className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-surface-black min-h-screen overflow-x-hidden">
      <Helmet>
        <title>{t("about.metaTitle")}</title>
        <meta
          name="description"
          content={t("about.metaDescription")}
        />
      </Helmet>

      <Navbar />

      {/* Cinematic hero — word-by-word reveal */}
      <AboutCinematicHero />

      <GradientDivider style="glow" />

      {/* Scrolling story chapters — Genshin-style alternating panels */}
      <AboutStoryChapters />

      <GradientDivider style="wave" />

      {/* Mountain parallax — visual breather before values */}
      <MountainParallax />

      {/* Values grid */}
      <AboutValues />

      <GradientDivider style="mesh" />

      {/* Founders */}
      <ModernFoundersSection
        founders={founders}
        title={t("about.foundersTitle")}
        subtitle={t("about.foundersSubtitle")}
      />

      <GradientDivider style="glow" />

      {/* Animated stats */}
      <AnimatedStats stats={stats} />

      <GradientDivider style="wave" flip />

      {/* Testimonials */}
      <TestimonialSection
        title={t("about.testimonialsTitle")}
        subtitle={t("about.testimonialsSubtitle")}
      />

      <GradientDivider style="mesh" />

      {/* Final CTA */}
      <section className="relative bg-surface-black">
        <FloatingParticles particleCount={30} />
        <CTASection
          title={t("about.ctaTitle")}
          subtitle={t("about.ctaSubtitle")}
          primaryButtonText={t("about.ctaPrimary")}
          primaryButtonLink="/booking"
          secondaryButtonText={t("about.ctaSecondary")}
          secondaryButtonLink="/services"
        />
      </section>

      <Footer darkMode={true} />
    </div>
  );
};

export default About;
