import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Edit } from 'lucide-react';

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

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          {user && user.username === post.author.username && (
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
                title="Delete Post"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-all"
                title="Edit Post"
              >
                <Edit size={20} />
              </button>
            </div>
          )}
        </div>
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
              {post.author.username[0].toUpperCase()}
            </div>
            <span className="font-medium">{post.author.username}</span>
          </div>
          <time dateTime={post.createdAt} className="text-gray-400">
            {new Date(post.createdAt!).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </time>
        </div>
      </div>
    </div>
  );
};

export default PostCard;