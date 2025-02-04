import React, { useEffect, useRef, useState } from "react";

// Card component
interface CardProps {
  title: string;
  description: string;
  imageUrl: string;
  index: number;
}

const StackingBoxes: React.FC<CardProps> = ({ title, description, imageUrl, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardInnerRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState(0);

  useEffect(() => {
    const card = cardRef.current;
    const cardInner = cardInnerRef.current;

    if (card && cardInner) {
      const nextCard = card.nextElementSibling as HTMLElement;
      const offsetTop = 200 + index * 20;
      const translateDistance = 45 * index; // Adjust this value for the desired spacing

      // Create IntersectionObserver
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTranslateY(translateDistance); // Set the translateY based on the index
            }
          });
        },
        { threshold: [0.6, 0.9] }
      );

      // Start observing the next card
      if (nextCard) {
        observer.observe(nextCard);
      }

      return () => {
        if (nextCard) {
          observer.unobserve(nextCard);
        }
      };
    }
  }, [index]);

  return (
    <div ref={cardRef} data-index={index} className="card sticky flex text-center justify-center items-center top-[200px]"> 
      <div
        ref={cardInnerRef}
        className="m-[5em] p-[5em]"
        style={{
          transform: `translateY(${translateY}px)`,
        }}
      >
        <div className="flex align-center text-white text-[3em] tracking-[0.2em]">
          <h1 className="card__title">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default StackingBoxes;
