import React, { useState } from "react";
import postImg from "../assets/post.jpg";
import Button from "../components/Button";
import {
  IconHeart,
  IconMessageCircle,
  IconShare,
  IconBookmark,
  IconX,
} from "@tabler/icons-react";
import avt from "../assets/avt.jpg";
import { useNavigate } from "react-router-dom";
const PostCommentsModal = ({ isOpen, post, onClose, onCommentAdded }) => {
  const [newComment, setNewComment] = useState("");
  const navigate = useNavigate(); // Hook for navigation
  if (!isOpen || !post) return null;

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    try {
      const token = localStorage.getItem("user:token");
      if (!token) {
        throw new Error("Token is missing");
      }
      const response = await fetch(
        `http://localhost:8000/api/posts/${post._id}/comment`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: newComment }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add comment");
      }
      const { updatedPost } = await response.json();
      // Update the post with the new comment
      if (onCommentAdded) {
        onCommentAdded(updatedPost);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    setNewComment("");
  };
  const handleUserClick = (username) => {
    const loggedInUsername = localStorage.getItem("user:username"); // Assuming you store logged-in username here
    if (username === loggedInUsername) {
      navigate("/profile");
    } else {
      navigate(`/user/${username}`);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[70%] h-[80%] p-8 rounded-lg shadow-lg flex overflow-hidden">
        {/* Left: Post details */}
        <div className="w-[50%] border-r pr-4">
          <img
            src={post.image || postImg}
            alt="post"
            className="w-full h-[640px] object-cover rounded-lg"
          />
        </div>
        {/* Right: Comments */}
        <div className="w-[50%] flex flex-col">
          {/* User Info */}
          <div className="flex items-center px-4 py-2 border-b">
            <img
              src={post.user?.image || avt}
              alt="avatar"
              className="w-12 h-12 rounded-full mr-4 object-cover"
            />
            <div>
              <h4 className="text-xl font-semibold">
                {post.user?.username || "Anonymous"}
              </h4>
              <h5 className="text-sm text-gray-600">{post.user?.email}</h5>
            </div>
          </div>
          {/* Comments Section */}
          <div className="flex-grow p-4 overflow-y-auto scrollbar-hide">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            <div>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment, i) => (
                  <div
                    key={i}
                    className="flex items-start mb-4"
                    onClick={() => handleUserClick(comment.user?.username)}
                  >
                    <img
                      src={comment.user?.image || avt}
                      alt="avatar"
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <strong className="block">
                        {comment.user?.username || "Anonymous"}
                      </strong>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No comments yet.</p>
              )}
            </div>
          </div>
          {/* Social Actions */}
          <div className="flex justify-around items-center px-4 py-2 border-t bg-gray-100">
            <div className="flex gap-4 text-gray-800 text-sm">
              <div className="flex items-center cursor-pointer">
                <IconHeart className="mr-2" />
                {post.likes?.length} Likes
              </div>
              <div className="flex items-center cursor-pointer">
                <IconMessageCircle className="mr-2" />
                {post.comments?.length} Comments
              </div>
              <div className="flex items-center cursor-pointer">
                <IconShare className="mr-2" />
                3.9k Shares
              </div>
              <div className="flex items-center cursor-pointer">
                <IconBookmark className="mr-2" />
                {post.saved?.length} Saved
              </div>
            </div>
          </div>
          {/* Add Comment */}
          <div className="flex flex-row p-4 border-t bg-gray-50">
            <textarea
              rows={3}
              value={newComment}
              onChange={handleCommentChange}
              className="w-[80%] border rounded-lg p-2 resize-none"
              placeholder="Add Comment..."
            />
            <Button
              label="Add Comment"
              className="mt-0 ml-2 w-[20%] py-2 rounded"
              onClick={handleAddComment}
            />
          </div>
        </div>
      </div>
      <Button
        icon={<IconX />}
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black rounded-full p-2"
      />
    </div>
  );
};

export default PostCommentsModal;
