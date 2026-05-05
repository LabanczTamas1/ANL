import React from "react";
import { Helmet } from "react-helmet-async";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ServicesHero from "./components/ServicesHero";
import ServiceCards from "./components/ServiceCards";
import ServicesProcess from "./components/ServicesProcess";
import ServicesComparison from "./components/ServicesComparison";
import GradientDivider from "./components/GradientDivider";
import CTASection from "./components/CTASection";
import FloatingParticles from "./components/FloatingParticles";

const Services = () => {
  return (
    <div className="bg-surface-black min-h-screen overflow-x-hidden">
      <Helmet>
        <title>ANL | Services — Marketing That Actually Works</title>
        <meta
          name="description"
          content="Explore ANL's full suite of advertising, lead generation, SEO, and social media services designed to maximize your ROI."
        />
      </Helmet>

      <Navbar />

      {/* Hero */}
      <ServicesHero />

      <GradientDivider style="wave" />

      {/* Interactive service cards with category filter */}
      <ServiceCards />

      <GradientDivider style="mesh" />

      {/* How we work — process timeline */}
      <ServicesProcess />

      <GradientDivider style="glow" />

      {/* ANL vs other agencies comparison */}
      <ServicesComparison />

      <GradientDivider style="wave" flip />

      {/* Final CTA */}
      <section className="relative bg-surface-black">
        <FloatingParticles particleCount={30} />
        <CTASection
          title="Ready to Grow Your Business?"
          subtitle="Book a free strategy call. We'll show you exactly what we'd do for your business — no strings attached."
          primaryButtonText="Book a Free Call"
          primaryButtonLink="/booking"
          secondaryButtonText="Contact Us"
          secondaryButtonLink="/contact"
        />
      </section>

      <Footer darkMode={true} />
    </div>
  );
};

export default Services;
