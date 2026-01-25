import React, { useEffect, useRef, useState } from 'react';
import personalized from '/public/LandingPage/personalized.png';

const cards = [
  { title: 'Personalized ads', img: personalized },
  { title: 'Automatized works', img: personalized },
  { title: 'Automatized works', img: personalized },
  { title: 'Grown', img: personalized },
];

const CARD_WIDTH = 350; // px, adjust based on your design
const VISIBLE_CARDS = 6; // how many cards to render at once

const VirtualScrollingCarousel = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [renderedCards, setRenderedCards] = useState(cards);

  // Infinite scroll effect
  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      setOffset((prev) => {
        const newOffset = prev + 0.5; // base speed
        // when a card fully scrolls out, rotate it to the end
        if (newOffset >= CARD_WIDTH) {
          setRenderedCards((prevCards) => [...prevCards.slice(1), prevCards[0]]);
          return newOffset - CARD_WIDTH;
        }
        return newOffset;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-screen bg-gradient-to-b from-black to-[#65558F] overflow-hidden flex flex-col items-center justify-center"
    >
      <h3 className="text-white text-[1.5em] md:text-[2em] absolute top-10 z-20 w-full text-center">
        With us, with the professionals
      </h3>

      <div className="relative w-full h-[60%] overflow-hidden">
        <div
          className="flex h-full absolute top-0 left-0"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.1s linear',
          }}
        >
          {renderedCards.map((card, index) => (
            <div
              key={index}
              className="min-w-[250px] sm:min-w-[300px] lg:min-w-[350px] h-full bg-white/5 backdrop-blur-md text-white rounded-lg flex flex-col items-center justify-around text-center border-4 border-gray-400 mx-2"
            >
              <h4 className="text-[1.2em] md:text-[1.5em] font-semibold">{card.title}</h4>
              <img src={card.img} alt={card.title} className="w-48 h-48 md:w-64 md:h-64" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VirtualScrollingCarousel;
