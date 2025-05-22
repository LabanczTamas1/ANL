import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import './Animate.css';

gsap.registerPlugin(MotionPathPlugin);

const AnimatedSnake = () => {
  const pathRef = useRef<SVGPathElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Get references to elements
    const path = pathRef.current;
    const circle = circleRef.current;

    if (!path || !circle) return;

    // Get path length using the SVGPathElement method
    const pathLength = path.getTotalLength();

    // Set initial properties for stroke
    gsap.set(path, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength,
    });

    // Set initial position for the circle to be at the start of the path
    gsap.set(circle, { cx: 500, cy: 200 });

    // Scroll event listener to trigger animation based on scroll
    const handleScroll = () => {
      // Calculate scroll progress (based on page height and scroll position)
      const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight + 500);

      // Update strokeDashoffset to simulate drawing the path based on scroll position
      gsap.to(path, {
        strokeDashoffset: pathLength - (scrollProgress * pathLength),
        duration: 0.1,
      });

      // Move the circle along the path as you scroll
      gsap.to(circle, {
        motionPath: {
          path: path,
          align: path,
          autoRotate: true,
        },
        progress: scrollProgress, // Scroll-based progress for moving the circle
        duration: 0.1,
      });
    };

    // Add the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div style={{ height: '200vh', backgroundColor: '#f0f0f0' }} className='loader-box'>
      <svg
        width="100vh"
        height="500"
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        {/* Define the custom, curved path */}
        <path
          ref={pathRef}
          className="path"
          d="M70,16 C70,36,60,46,50,46 C60,46,70,56,70,76 C70,56,80,46,90,46 C80,46,70,36,70,16 Z M30,0 C30,20,20,30,10,30 C20,30,30,40,30,60 C30,40,40,30,50,30 C40,30,30,20,30,0 Z M43,42 C43,62,33,72,23,72 C33,72,43,82,43,102 C43,82,53,72,63,72 C53,72,43,62,43,45 Z M0,0 0,200"
          fill="none"
          stroke="black"
          strokeWidth="10"
        />
        {/* Added circle element that was missing */}
        <circle 
          ref={circleRef}
          className="circle" 
          r="8" 
          fill="red" 
        />
      </svg>
    </div>
  );
};

export default AnimatedSnake;