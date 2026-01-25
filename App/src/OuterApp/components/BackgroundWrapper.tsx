import React from 'react';
import stars from '/public/LandingPage.svg';

interface BackgroundWrapperProps {
  children: React.ReactNode;
}

const BackgroundWrapper: React.FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <div className="relative">
      {/* Background SVG */}
      <div
        className="absolute lg:h-screen h-[120vh] inset-0 bg-no-repeat bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${stars})`, opacity: 1 }}
      />
      {children}
    </div>
  );
};

export default BackgroundWrapper;