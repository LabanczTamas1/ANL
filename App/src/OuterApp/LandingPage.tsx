import React from 'react'
import Navbar from './Navbar'
import stars from '/public/LandingPage.svg';
import HeroSection from './HeroSection';
import Footer from './Footer';
import PersonCard from './PersonCard';


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
<section className='flex md:flex-row gap-50 md:justify-around flex-col items-center justify-center'>
  <PersonCard imageUrl="/public/Picture1.png" name="Koszta Zsolt" position="Co-Founder" description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Metin?"/>
  <PersonCard imageUrl="/public/Picture1.png" name="Koszta Zsolt" position="Co-Founder" description="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s. Metin?"/>
</section>

      <Footer />
  </div>
  )
}

export default LandingPage
