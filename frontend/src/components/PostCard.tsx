import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Edit, BookOpen, Calendar, ChevronRight } from 'lucide-react';

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  variant?: 'compact' | 'detailed';
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onDelete, 
  variant = 'detailed' 
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

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

  // Generate a dynamic background color based on the author's username
  const getAuthorColor = () => {
    const colors = [
      'bg-blue-100', 'bg-green-100', 'bg-purple-100', 
      'bg-pink-100', 'bg-indigo-100', 'bg-teal-100'
    ];
    const index = post.author.username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Truncate content based on variant
  const getTruncatedContent = () => {
    const maxLength = variant === 'compact' ? 50 : 150;
    return post.content.length > maxLength 
      ? `${post.content.slice(0, maxLength)}...` 
      : post.content;
  };

  // Format date with more flexibility
  const formatDate = () => {
    const date = new Date(post.createdAt!);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`
        relative group overflow-hidden rounded-3xl 
        transition-all duration-300 ease-in-out 
        ${variant === 'compact' 
          ? 'h-48 min-w-[250px]' 
          : 'min-h-[380px] max-w-[400px]'}
        bg-white border border-gray-200 shadow-lg 
        hover:shadow-2xl cursor-pointer transform 
        hover:-translate-y-2 hover:scale-[1.02]
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Gradient Overlay */}
      <div 
        className={`
          absolute inset-0 
          bg-gradient-to-br from-transparent to-blue-50 
          opacity-0 group-hover:opacity-50 
          transition-opacity duration-300 
          pointer-events-none
        `}
      />

      <div 
        className={`
          relative z-10 p-5 
          flex flex-col 
          ${variant === 'compact' ? 'h-full' : 'h-full'}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h2 
            className={`
              font-bold text-gray-800 
              group-hover:text-blue-700 
              transition-colors 
              ${variant === 'compact' ? 'text-lg' : 'text-2xl'}
            `}
          >
            {post.title}
          </h2>

          {/* Action Buttons */}
          {user && user.username === post.author.username && (
            <div 
              className={`
                flex space-x-2 
                ${isHovered ? 'opacity-100' : 'opacity-0'}
                transition-all duration-300
              `}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="
                  bg-red-50 text-red-500 
                  hover:bg-red-100 p-2 
                  rounded-full transition-all 
                  shadow-md hover:shadow-lg
                "
                title="Delete Post"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="
                  bg-blue-50 text-blue-500 
                  hover:bg-blue-100 p-2 
                  rounded-full transition-all 
                  shadow-md hover:shadow-lg
                "
                title="Edit Post"
              >
                <Edit size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <p 
          className={`
            text-gray-600 mb-4 
            ${variant === 'compact' 
              ? 'text-sm line-clamp-2' 
              : 'text-base line-clamp-3 flex-grow'}
          `}
        >
          {getTruncatedContent()}
        </p>

        {/* Footer */}
        <div 
          className={`
            flex items-center justify-between 
            mt-auto pb-2 
            ${variant === 'compact' ? 'text-xs' : 'text-sm'}
          `}
        >
          {/* Author */}
          <div className="flex items-center space-x-2">
            <div 
              className={`
                ${getAuthorColor()} 
                text-blue-800 rounded-full 
                flex items-center justify-center 
                font-bold shadow-md 
                ${variant === 'compact' ? 'w-8 h-8' : 'w-10 h-10'}
              `}
            >
              {post.author.username[0].toUpperCase()}
            </div>
            <span className="font-semibold text-gray-700">
              {post.author.username}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-1 text-gray-500">
            <Calendar className={variant === 'compact' ? 'w-3 h-3' : 'w-4 h-4'} />
            <time dateTime={post.createdAt} className="font-medium">
              {formatDate()}
            </time>
          </div>
        </div>

        {/* Read More */}
        {variant === 'detailed' && (
          <div 
            className={`
              absolute bottom-4 right-4 
              ${isHovered ? 'opacity-100' : 'opacity-0'}
              transition-opacity duration-300 
              flex items-center text-blue-500 
              hover:text-blue-700
            `}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">Read More</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;