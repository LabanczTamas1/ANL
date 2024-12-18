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

  // Fetch comments on component mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `http://localhost:3000/api/cards/comments/${cardId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Check response and map comments if available
        if (response.status === 200) {
          const commentsData = response.data.CommentsDetails || [];
          const mappedComments: Comment[] = commentsData.map((comment: any) => ({
            commentId: comment.CommentId, // Fix the key to CommentId from commentId
            userName: comment.UserName,
            body: comment.Body,
            date: new Date(parseInt(comment.DateAdded)).toLocaleString(), // Parse timestamp
          }));

          console.log("Mapped comments:", mappedComments); // Debugging the mapped comments
          setCommentsList(mappedComments);
        } else {
          console.warn("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
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
      
      // Safely concatenate firstName and lastName, fallback to "Anonymous" if either is missing
      const userName = (firstName && lastName) ? `${firstName} ${lastName}` : "Anonymous";
      

      const response = await axios.post(
        `http://localhost:3000/api/cards/comments/${cardId}`,
        { userName, body: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const newComment: Comment = {
          commentId: response.data.commentId, // Get commentId from the backend response
          userName,
          body: comment,
          date: new Date().toLocaleString(),
        };

        console.log("New comment added:", newComment); // Debugging the new comment
        setCommentsList((prev) => [...prev, newComment]);
        setComment(""); // Clear input field
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:3000/api/cards/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCommentsList((prev) => prev.filter((comment) => comment.commentId !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment. Please try again.");
    }
  };

  const createMonogram = (name: string): string => {
    const nameParts = name.split(' ');
    const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
    const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    return firstNameInitial + lastNameInitial;
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2>Comments List</h2>
      {loading ? (
        <p>Loading comments...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : commentsList.length === 0 ? (
        <p>No comments available.</p>
      ) : (
        <ul>
          {commentsList.map((comment, index) => {
            console.log("Rendering commentId:", comment.commentId); // Debugging the key

            return (
              <li key={comment.commentId || index} className="hover:bg-gray-300">
                <div className="flex flex-row items-baseline justify-between">
                  <div className="flex flex-row items-baseline">
                    <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {createMonogram(comment.userName)}
                    </div>
                    <strong>{comment.userName}</strong> - {comment.date}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-red-500 hover:text-red-700 transition duration-150"
                      title="Delete"
                      onClick={() => handleDeleteComment(comment.commentId)} // Pass commentId to delete function
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <p>{comment.body}</p>
              </li>
            );
          })}
        </ul>
      )}

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
