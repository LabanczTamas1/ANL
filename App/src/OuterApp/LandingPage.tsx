import React from 'react'
import Navbar from './Navbar'
import stars from '/public/LandingPage.svg';
import HeroSection from './HeroSection';


const LandingPage = () => {
  return (
    <div>
       <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${stars})`, opacity: 1 }}
      ></div>
        <Navbar/>
        {/*<img src={stars} alt="Logo" width="100%"/>*/}
        <HeroSection />
    </div>
  )
}

export default LandingPage
