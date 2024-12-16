import React, { useEffect, useState } from "react";
import axios from "axios";

interface Comment {
  userName: string;
  body: string;
  date: string;
}

interface CardMessageSectionProps {
  cardId: string;
}

const CardMessageSection: React.FC<CardMessageSectionProps> = ({ cardId }) => {
  const [comment, setComment] = useState<string>("");
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchColumns = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("authToken"); // Retrieve token for auth
                const response = await axios.get(
                  `http://localhost:3000/api/cards/comments/${cardId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
          
                if (response.status === 200) {
                  const newComment: Comment = {
                    userName: "Peter Parker",
                    body: comment,
                    date: new Date().toLocaleString(),
                  };
                  setCommentsList((prev) => [...prev, newComment]);
                  setComment(""); // Clear input field
                }
              } catch (error) {
                console.error("Error adding comment:", error);
              } finally {
                setLoading(false);
              }
        };
        fetchColumns();
    }, []);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken"); // Retrieve token for auth
      const response = await axios.post(
        `http://localhost:3000/api/cards/comments/${cardId}`,
        {
          userName: localStorage.getItem("name"),
          body: comment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const newComment: Comment = {
          userName: "Peter Parker",
          body: comment,
          date: new Date().toLocaleString(),
        };
        setCommentsList((prev) => [...prev, newComment]);
        setComment(""); // Clear input field
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      {/* Comment Card */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
          PP
        </div>

        {/* Comment Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-gray-800">Peter Parker</span>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleString()}
            </span>
          </div>
          <p className="text-gray-700 mb-2">
            Your reviews will be posted and used by the company.
          </p>
          <p className="text-gray-700">Your reviews will be posted and used.</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="text-gray-500 hover:text-gray-700 transition duration-150"
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="text-red-500 hover:text-red-700 transition duration-150"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Add Comment Input */}
      <div className="mt-4">
        <textarea
          className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className={`mt-2 px-4 py-2 rounded text-white ${
            loading || !comment.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-700 transition duration-200"
          }`}
          onClick={handleAddComment}
          disabled={loading || !comment.trim()}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
};

export default CardMessageSection;
