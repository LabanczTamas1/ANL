import React from 'react';

interface HamburgerMenuProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const iconColor = isMenuOpen ? 'bg-white' : 'dark:bg-white bg-[#1f2937]';

  return (
    <div
      className="block md:hidden p-2 cursor-pointer"
      onClick={toggleMenu}
    >
      <div className={`w-6 h-0.5 ${iconColor} mb-1.5 transition-all duration-300 ${isMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></div>
      <div className={`w-6 h-0.5 ${iconColor} mb-1.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></div>
      <div className={`w-6 h-0.5 ${iconColor} transition-all duration-300 ${isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></div>
    </div>
  );
};

export default HamburgerMenu;
