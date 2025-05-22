import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullhorn, faUsers, faChartLine, faSearchDollar, faHandHoldingUsd, faAd, faGlobe, faEnvelopeOpenText, faPhoneSquare } from "@fortawesome/free-solid-svg-icons";
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const Services = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black via-[#65558F] to-black">
      <Navbar />
      <div className="flex flex-col items-center text-white px-8 py-12">
        <h2 className="text-[2.5em] mb-6 border-b-4 pb-2">Our Advertising & Lead Generation Services</h2>
        <p className="text-lg max-w-4xl text-center mb-12">
          Maximize your brand’s reach and drive high-quality leads with our expert advertising and lead generation services. 
          Our team specializes in cutting-edge marketing strategies to help your business grow efficiently and effectively.
        </p>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 w-full max-w-6xl">
          <ServiceCard icon={faBullhorn} title="Targeted Advertising" description="Reach the right audience with precision-targeted digital advertising campaigns." />
          <ServiceCard icon={faUsers} title="Lead Generation" description="Generate high-quality leads through data-driven marketing strategies." />
          <ServiceCard icon={faChartLine} title="SEO & Content Marketing" description="Boost your search engine rankings and drive organic traffic with optimized content." />
          <ServiceCard icon={faSearchDollar} title="PPC Campaigns" description="Maximize your ROI with expertly managed pay-per-click advertising campaigns." />
          <ServiceCard icon={faHandHoldingUsd} title="Conversion Optimization" description="Enhance your website’s conversion rate with our expert CRO strategies." />
          <ServiceCard icon={faAd} title="Social Media Ads" description="Run high-converting ad campaigns across major social media platforms." />
          <ServiceCard icon={faGlobe} title="Brand Awareness" description="Increase brand visibility with multi-channel marketing approaches." />
          <ServiceCard icon={faEnvelopeOpenText} title="Email Marketing" description="Engage and nurture your audience with strategic email marketing campaigns." />
          <ServiceCard icon={faPhoneSquare} title="Cold Outreach & Retargeting" description="Reconnect with potential customers through smart retargeting and outreach." />
        </div>
      </div>
      <Footer darkMode={true} />
    </div>
  );
};

interface ServiceCardProps {
  icon: IconDefinition;
  title: string;
  description: string;
}

const ServiceCard = ({ icon, title, description }: ServiceCardProps) => {
  return (
    <div className="bg-white/10 p-6 rounded-xl shadow-lg flex flex-col items-center text-center hover:bg-white/20 transition duration-300">
      <FontAwesomeIcon icon={icon} className="w-12 h-12 text-white mb-4" />
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{description}</p>
    </div>
  );
};

export default Services;
