import React, { useEffect, useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { getReviewsByScore, getAllReviews } from '../services/reviewService';
import Review from './Review';

interface ReviewType {
  id: string;
  username: string;
  score: string;
  description: string;
  time: string;
  role?: string;
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'scoreHigh', label: 'Score: High to Low' },
  { value: 'scoreLow', label: 'Score: Low to High' },
];

const ReviewsPage: React.FC = () => {
  const { t } = useLanguage();
  const [scoreFilter, setScoreFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    let res;
    if (scoreFilter) {
      res = await getReviewsByScore(Number(scoreFilter));
    } else {
      res = await getAllReviews();
    }
    if (res && Array.isArray(res.reviews)) {
      setReviews(res.reviews);
    } else {
      setReviews([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, [scoreFilter]);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.time).getTime() - new Date(a.time).getTime();
    if (sortBy === 'oldest') return new Date(a.time).getTime() - new Date(b.time).getTime();
    if (sortBy === 'scoreHigh') return Number(b.score) - Number(a.score);
    if (sortBy === 'scoreLow') return Number(a.score) - Number(b.score);
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">{t('reviews') || 'Reviews'}</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex gap-2 items-center">
          <label className="text-gray-700 dark:text-gray-200 font-medium">{t('review.score') || 'Score'}:</label>
          <select
            value={scoreFilter}
            onChange={e => setScoreFilter(e.target.value)}
            className="p-2 rounded border dark:bg-gray-800 dark:text-white"
          >
            <option value="">{t('all') || 'All'}</option>
            {[5,4,3,2,1].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex gap-2 items-center">
          <label className="text-gray-700 dark:text-gray-200 font-medium">{t('sortBy') || 'Sort by'}:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="p-2 rounded border dark:bg-gray-800 dark:text-white"
          >
            {sortOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setShowAdd(v => !v)}
        >
          {showAdd ? t('review.reset') || 'Reset' : t('sidebar.addReview') || 'Add a review'}
        </button>
      </div>
      {showAdd && (
        <div className="mb-8">
          <Review />
        </div>
      )}
      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-300">{t('loadingContent')}</div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-300">{t('noReviews') || 'No reviews yet.'}</div>
          ) : (
            sortedReviews.map(r => (
              <div key={r.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br from-yellow-400 to-yellow-600 shadow">
                  {r.username.slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg text-gray-800 dark:text-white">{r.username}</span>
                    <span className="text-yellow-500 text-base">{'★'.repeat(Number(r.score))}{'☆'.repeat(5-Number(r.score))}</span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-200 italic">"{r.description}"</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(r.time).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;
