import React, { useEffect, useRef, useState } from 'react';
import personalized from '/public/LandingPage/personalized.png';

const ScrollingCarousel = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const section = sectionRef.current;
            if (section) {
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;

                if (rect.top < windowHeight && rect.bottom > 0) {
                    const scrollRange = rect.height + windowHeight;
                    const scrollOffset = Math.min(Math.max(windowHeight - rect.top, 0), scrollRange);
                    const progress = scrollOffset / scrollRange;
                    setScrollProgress(progress);
                } else {
                    setScrollProgress(0);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const translateX = scrollProgress * 40; // Adjust the scroll effect for better visibility

    return (
        <div
            ref={sectionRef}
            className="relative flex items-center justify-center w-full h-screen bg-gradient-to-b from-black to-[#65558F] overflow-hidden"
        >
            {/* Content */}
            <h3 className="text-white text-[1.5em] md:text-[2em] md:w-[10em] absolute top-10 z-20 flex space-x-4 overflow-hidden p-4 text-center">
                With us, with the professionals
            </h3>
            <div
                className="relative z-10 flex h-[60%] items-center space-x-4 p-4"
                style={{
                    transform: `translateX(-${translateX}%)`,
                    willChange: 'transform',
                }}
            >
                {/* Carousel Cards */}
                
                <div
                    className="min-w-[250px] sm:min-w-[300px] lg:min-w-[350px] h-full bg-white/5 backdrop-blur-md text-white rounded-lg shadow-md flex flex-col items-center justify-around text-center border-4 border-gray-400"
                >
                    <h4 className="text-[1.2em] md:text-[1.5em] font-semibold">Personalized ads</h4>
                    <img src={personalized} alt="Personalized" className="w-64 h-64 md:w-64 md:h-64" />
                </div>
                <div
                    className="min-w-[250px] sm:min-w-[300px] lg:min-w-[350px] h-full bg-white/5 backdrop-blur-md text-white rounded-lg shadow-md flex flex-col items-center justify-around text-center border-4 border-gray-400"
                >
                    <h4 className="text-[1.2em] md:text-[1.5em] font-semibold">Automatized works</h4>
                    <img src={personalized} alt="Personalized" className="w-64 h-64 md:w-64 md:h-64" />
                </div>
                <div
                    className="min-w-[250px] sm:min-w-[300px] lg:min-w-[350px] h-full bg-white/5 backdrop-blur-md text-white rounded-lg shadow-md flex flex-col items-center justify-around text-center border-4 border-gray-400"
                >
                    <h4 className="text-[1.2em] md:text-[1.5em] font-semibold">Automatized works</h4>
                    <img src={personalized} alt="Personalized" className="w-64 h-64 md:w-64 md:h-64" />
                </div>
                <div
                    className="min-w-[250px] sm:min-w-[300px] lg:min-w-[350px] h-full bg-white/5 backdrop-blur-md text-white rounded-lg shadow-md flex flex-col items-center justify-around text-center border-4 border-gray-400"
                >
                    <h4 className="text-[1.2em] md:text-[1.5em] font-semibold">Grown</h4>
                    <img src={personalized} alt="Personalized" className="w-64 h-64 md:w-64 md:h-64" />
                </div>
            </div>
        </div>
    );
};

export default ScrollingCarousel;