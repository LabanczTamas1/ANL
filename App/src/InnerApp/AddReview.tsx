import React, { useState } from "react";
import { Star, Send } from "lucide-react";
import { addReview } from "../services/api/reviewApi";
import { useLanguage } from "../hooks/useLanguage";

const AddReview: React.FC = () => {
  const { t } = useLanguage();
  const username = localStorage.getItem("name") || "";

  const [score, setScore] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (score === 0) {
      setError(t("review.errorNoRating"));
      return;
    }
    if (!description.trim()) {
      setError(t("review.errorNoDescription"));
      return;
    }

    setLoading(true);
    try {
      await addReview({ username, score, description: description.trim() });
      setSuccess(t("review.success"));
      setScore(0);
      setDescription("");
    } catch {
      setError(t("review.errorSubmit"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {t("review.title")}
      </h1>

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-md border border-green-300 dark:border-green-700">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md border border-red-300 dark:border-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("review.rating")}
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setScore(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={
                    star <= (hoveredStar || score)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="review-description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {t("review.description")}
          </label>
          <textarea
            id="review-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder={t("review.placeholder")}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#65558F] resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {description.length}/1000
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3.5 text-base bg-[#65558F] text-white rounded-md hover:bg-opacity-90 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
          {loading ? t("review.submitting") : t("review.submit")}
        </button>
      </form>
    </div>
  );
};

export default AddReview;
