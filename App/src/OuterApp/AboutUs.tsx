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
import CTASection from "./components/CTASection";
import FloatingParticles from "./components/FloatingParticles";
import { FaUsers, FaChartLine, FaStar, FaGlobe } from "react-icons/fa";

const founders = [
  {
    imageUrl: "/Picture1.png",
    name: "Péterfi Szabolcs",
    position: "Founder",
    description:
      "Inspiring leader with a passion for innovation and a track record of driving growth through strategic vision and execution.",
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
    description:
      "Strategic thinker specializing in growth marketing and data-driven decision making to help businesses reach their full potential.",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
      email: "contact@anl.com",
    },
  },
];

const stats = [
  { value: 300, suffix: "+", label: "Campaigns Launched", icon: <FaChartLine className="w-5 h-5" /> },
  { value: 50, suffix: "+", label: "Clients Served", icon: <FaUsers className="w-5 h-5" /> },
  { value: 12, suffix: "", label: "Countries Reached", icon: <FaGlobe className="w-5 h-5" /> },
  { value: 97, suffix: "%", label: "Client Satisfaction", icon: <FaStar className="w-5 h-5" /> },
];

const About = () => {
  return (
    <div className="bg-surface-black min-h-screen overflow-x-hidden">
      <Helmet>
        <title>ANL | About Us — Our Story</title>
        <meta
          name="description"
          content="Learn about ANL — who we are, why we started, and the values that drive everything we do."
        />
      </Helmet>

      <Navbar />

      {/* Cinematic hero — word-by-word reveal */}
      <AboutCinematicHero />

      <GradientDivider style="glow" />

      {/* Scrolling story chapters — Genshin-style alternating panels */}
      <AboutStoryChapters />

      <GradientDivider style="wave" />

      {/* Values grid */}
      <AboutValues />

      <GradientDivider style="mesh" />

      {/* Founders */}
      <ModernFoundersSection
        founders={founders}
        title="The Founders"
        subtitle="Two people who decided to do marketing the right way"
      />

      <GradientDivider style="glow" />

      {/* Animated stats */}
      <AnimatedStats stats={stats} />

      <GradientDivider style="wave" flip />

      {/* Testimonials */}
      <TestimonialSection
        title="Clients That Believed Early"
        subtitle="They took the leap. Here's what happened."
      />

      <GradientDivider style="mesh" />

      {/* Final CTA */}
      <section className="relative bg-surface-black">
        <FloatingParticles particleCount={30} />
        <CTASection
          title="Ready to Write Your Own Chapter?"
          subtitle="Book a free strategy call. No pitch deck, no fluff — just a real conversation about your growth."
          primaryButtonText="Start the Story"
          primaryButtonLink="/booking"
          secondaryButtonText="See Our Services"
          secondaryButtonLink="/services"
        />
      </section>

      <Footer darkMode={true} />
    </div>
  );
};

export default About;
