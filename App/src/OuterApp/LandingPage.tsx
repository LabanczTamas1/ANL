import React from 'react'
import Navbar from './Navbar'
import stars from '/public/LandingPage.svg';
import HeroSection from './HeroSection';


const LandingPage = () => {
  return (
    <div className="relative">
    {/* Background SVG */}
    <div
      className="absolute h-screen inset-0 bg-no-repeat bg-cover bg-center z-0"
      style={{ backgroundImage: `url(${stars})`, opacity: 1 }}
    ></div>

    {/* Navbar */}
    <Navbar />

    {/* Hero Section */}
    <HeroSection />

    <p>
  According to the 
  <a href="https://www.who.int/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
    World Health Organization
  </a>, global vaccination rates increased by 10% in 2023.
</p>

  </div>
  )
}

export default LandingPage
