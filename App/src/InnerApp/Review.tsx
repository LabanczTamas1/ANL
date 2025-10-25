import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { addReview as addReviewApi } from '../services/reviewService';

// Custom SVG star for less rounded, smaller look
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="22" height="22" viewBox="0 0 24 24"
    fill={filled ? '#FFD600' : 'none'}
    stroke="#FFD600"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="miter"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polygon points="12,3 15,10 22,10.5 17,15.5 18.5,22 12,18.5 5.5,22 7,15.5 2,10.5 9,10" />
  </svg>
);

const Review: React.FC = () => {
  const { t } = useLanguage();

  const [username] = useState<string>(localStorage.getItem('username') || '');
  const [score, setScore] = useState<number>(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleStarClick = (idx: number) => {
    setScore(idx);
  };

  const handleStarMouseEnter = (idx: number) => {
    setHovered(idx);
  };

  const handleStarMouseLeave = () => {
    setHovered(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!username || !score || !description) {
      setMessage(t('review.errors.required') || 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken') || undefined;
      const resp = await addReviewApi({ username, score, description }, token);

      if (resp && resp.review) {
        setMessage(t('review.success') || 'Review added successfully');
        setDescription('');
        setScore(0);
        // optionally navigate back to home or another view
        // navigate('/home');
      } else {
        setMessage(resp.error || (t('review.fail') || 'Failed to add review'));
      }
    } catch (err: any) {
      console.error('[Review] submit error', err);
      setMessage(err.message || (t('review.fail') || 'Failed to add review'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{t('review.title') || 'Add a review'}</h2>

      {message && (
        <div className="mb-4 text-sm text-white bg-green-600 p-2 rounded">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="text-sm text-gray-300">{t('review.username') || 'Your name'} <span className="text-xs text-gray-400">({t('review.autofilled') || 'auto-filled from your account'})</span></span>
          <input
            value={username}
            readOnly
            className="mt-1 p-2 rounded bg-[#f3f4f6] dark:bg-[#23272e] text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:border-blue-400 opacity-80 cursor-not-allowed transition-colors"
            placeholder={t('review.usernamePlaceholder') || 'Enter your name'}
          />
        </label>

        {/* Score (Star Rating) */}
        <label className="flex flex-col">
          <span className="text-sm text-gray-300 mb-1">{t('review.score') || 'Score'}</span>
          <div className="flex flex-row gap-1 items-center">
            {[1, 2, 3, 4, 5].map((idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleStarClick(idx)}
                onMouseEnter={() => handleStarMouseEnter(idx)}
                onMouseLeave={handleStarMouseLeave}
                aria-label={`Set rating to ${idx}`}
                className="focus:outline-none"
              >
                <StarIcon
                  filled={
                    hovered !== null
                      ? idx <= hovered
                      : score > 0 && idx <= score
                  }
                />
              </button>
            ))}
          </div>
        </label>

        <label className="flex flex-col">
          <span className="text-sm text-gray-300">{t('review.description') || 'Description'}</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="mt-1 p-2 rounded bg-[#f3f4f6] dark:bg-[#23272e] text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:border-blue-400 transition-colors"
            placeholder={t('review.descriptionPlaceholder') || 'Write your review here'}
          />
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? (t('review.saving') || 'Saving...') : (t('review.submit') || 'Submit review')}
          </button>
          <button
            type="button"
            onClick={() => { setDescription(''); setScore(0); }}
            className="bg-gray-700 text-white px-4 py-2 rounded"
          >
            {t('review.reset') || 'Reset'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Review;
