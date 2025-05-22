import React, { useEffect, useState } from "react";
import axios from "axios";

interface Comment {
  commentId: string;
  userName: string;
  body: string;
  date: string;
}

interface CardMessageSectionProps {
  cardId: string;
}

const CardMessageSection: React.FC<CardMessageSectionProps> = ({ cardId }) => {
  const [comment, setComment] = useState<string>(""); // Input field
  const [commentsList, setCommentsList] = useState<Comment[]>([]); // List of comments
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null); // Comment ID being edited
  const [editingBody, setEditingBody] = useState<string>(""); // Temporary body for editing
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Fetch comments on component mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_BASE_URL}/api/cards/comments/${cardId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          const commentsData = response.data.CommentsDetails || [];
          const mappedComments: Comment[] = commentsData.map((comment: any) => ({
            commentId: comment.CommentId,
            userName: comment.UserName,
            body: comment.Body,
            date: new Date(parseInt(comment.DateAdded)).toLocaleString(),
          }));

          setCommentsList(mappedComments);
        }
      } catch (error) {
        setError("Failed to load comments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [cardId]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      const firstName = localStorage.getItem("firstName");
      const lastName = localStorage.getItem("lastName");
      const userName = firstName && lastName ? `${firstName} ${lastName}` : "Anonymous";

      const response = await axios.post(
        `${API_BASE_URL}/api/cards/comments/${cardId}`,
        { userName, body: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const newComment: Comment = {
          commentId: response.data.commentId,
          userName,
          body: comment,
          date: new Date().toLocaleString(),
        };

        setCommentsList((prev) => [...prev, newComment]);
        setComment("");
      }
    } catch (error) {
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`${API_BASE_URL}/api/cards/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCommentsList((prev) => prev.filter((comment) => comment.commentId !== commentId));
    } catch (error) {
      setError("Failed to delete comment. Please try again.");
    }
  };

  const handleUpdateComment = async () => {
    if (!editingBody.trim() || !editingCommentId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      await axios.put(
        `${API_BASE_URL}/api/cards/comments/${editingCommentId}`,
        { body: editingBody },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCommentsList((prev) =>
        prev.map((comment) =>
          comment.commentId === editingCommentId
            ? { ...comment, body: editingBody, date: new Date().toLocaleString() }
            : comment
        )
      );

      setEditingCommentId(null);
      setEditingBody("");
    } catch (error) {
      setError("Failed to update comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createMonogram = (name: string): string => {
    const nameParts = name.split(" ");
    const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return firstNameInitial + lastNameInitial;
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900">
      <h2 className="text-gray-800 dark:text-gray-100 font-semibold text-lg">Comments List</h2>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading comments...</p>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400">{error}</p>
      ) : commentsList.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No comments available.</p>
      ) : (
        <ul className="space-y-4 mt-3">
          {commentsList.map((comment) => (
            <li key={comment.commentId} className="p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150">
              <div className="flex flex-row items-baseline justify-between">
                <div className="flex flex-row items-center gap-2">
                  <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {createMonogram(comment.userName)}
                  </div>
                  <div>
                    <strong className="text-gray-800 dark:text-gray-200">{comment.userName}</strong>
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{comment.date}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition duration-150"
                    title="Delete"
                    onClick={() => handleDeleteComment(comment.commentId)}
                  >
                    🗑️
                  </button>
                  <button
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition duration-150"
                    title="Edit"
                    onClick={() => {
                      setEditingCommentId(comment.commentId);
                      setEditingBody(comment.body);
                    }}
                  >
                    ✏️
                  </button>
                </div>
              </div>
              {editingCommentId === comment.commentId ? (
                <div className="mt-2">
                  <textarea
                    className="w-full border dark:border-gray-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    rows={2}
                    value={editingBody}
                    onChange={(e) => setEditingBody(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition duration-200"
                      onClick={handleUpdateComment}
                    >
                      Update
                    </button>
                    <button
                      className="px-4 py-2 rounded text-white bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition duration-200"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingBody("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.body}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add Comment Input */}
      <div className="mt-6">
        <textarea
          className="w-full border dark:border-gray-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          rows={3}
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className={`mt-2 px-4 py-2 rounded text-white ${
            loading || !comment.trim()
              ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition duration-200"
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