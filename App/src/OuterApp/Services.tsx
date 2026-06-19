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
import { useLanguage } from "../hooks/useLanguage";

const Services = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-surface-black min-h-screen overflow-x-hidden">
      <Helmet>
        <title>{t("servicesPage.metaTitle")}</title>
        <meta
          name="description"
          content={t("servicesPage.metaDescription")}
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
          title={t("servicesPage.ctaTitle")}
          subtitle={t("servicesPage.ctaSubtitle")}
          primaryButtonText={t("servicesPage.ctaPrimary")}
          primaryButtonLink="/booking"
          secondaryButtonText={t("servicesPage.ctaSecondary")}
          secondaryButtonLink="/contact"
        />
      </section>

      <Footer darkMode={true} />
    </div>
  );
};

export default Services;
