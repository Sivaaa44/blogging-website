import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onDelete }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      await axios.delete(`http://localhost:5000/api/post/${post._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If onDelete prop is provided, call it
      if (onDelete) {
        onDelete(post._id!);
      }
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.error || 'Failed to delete post');
    }
  };

  const handleEdit = () => {
    navigate(`/edit-post/${post._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">{post.content}</p>
      <div className="flex justify-between items-center">
        <p className="text-gray-500">
          By {post.author.username} - {new Date(post.createdAt!).toLocaleDateString()}
        </p>
        {user && user.id === post.author.id && (
          <div className="space-x-2">
            <button
              className="text-red-500 hover:text-red-700 transition-colors"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              onClick={handleEdit}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;