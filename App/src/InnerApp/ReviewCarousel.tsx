import React, { useEffect, useState, useRef } from 'react';
import { getReviewsByScore } from '../services/reviewService';

interface ReviewType {
  id: string;
  username: string;
  score: string;
  description: string;
  time: string;
  role?: string;
}

interface ReviewCarouselProps {
  score?: number;
  intervalMs?: number;
}

const ReviewCarousel: React.FC<ReviewCarouselProps> = ({ score = 5, intervalMs = 4000 }) => {
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;
    getReviewsByScore(score).then((res) => {
      if (mounted && res && Array.isArray(res.reviews)) {
        setReviews(res.reviews);
      }
    });
    return () => { mounted = false; };
  }, [score]);

  useEffect(() => {
    if (reviews.length < 2) return;
    timerRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % reviews.length);
        setFade(true);
      }, 400); // fade out duration
    }, intervalMs);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [reviews, intervalMs]);

  if (!reviews.length) return null;
  const review = reviews[current];

  return (
    <div
      className={`transition-opacity duration-400 ${fade ? 'opacity-100' : 'opacity-0'} max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700 p-10 my-12 min-h-[180px] flex flex-col justify-center items-center`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow">
          {review.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-bold text-xl text-gray-800 dark:text-white">{review.username}</span>
          <span className="text-yellow-500 text-lg tracking-widest">{'★'.repeat(Number(review.score))}{'☆'.repeat(5 - Number(review.score))}</span>
        </div>
      </div>
      <div className="text-gray-700 dark:text-gray-200 italic text-lg text-center max-w-2xl">“{review.description}”</div>
      <div className="text-xs text-gray-400 mt-4">{new Date(review.time).toLocaleDateString()}</div>
    </div>
  );
};

export default ReviewCarousel;
