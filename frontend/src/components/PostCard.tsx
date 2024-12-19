import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Edit, BookOpen, Calendar, ChevronRight, Hash, MessageCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-post/${post._id}`);
  };

  const handleCardClick = () => {
    navigate(`/post/${post._id}`);
  };

  const getAuthorColor = () => {
    const colors = [
      'bg-blue-100 text-blue-800', 
      'bg-emerald-100 text-emerald-800', 
      'bg-purple-100 text-purple-800', 
      'bg-rose-100 text-rose-800', 
      'bg-indigo-100 text-indigo-800', 
      'bg-amber-100 text-amber-800'
    ];
    const index = post.author.username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getTruncatedContent = () => {
    // Create a temporary div to strip HTML tags for length calculation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(post.content);
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    const maxLength = variant === 'compact' ? 80 : 200;
    let truncated = textContent.slice(0, maxLength);
    
    if (textContent.length > maxLength) {
      truncated += '...';
    }
    
    return truncated;
  };

  const formatDate = () => {
    const date = new Date(post.createdAt!);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`
        group relative overflow-hidden rounded-2xl
        transition-all duration-300 ease-out
        ${variant === 'compact' ? 'h-48' : 'h-[420px]'}
        bg-white border border-slate-200
        hover:border-slate-300 hover:shadow-lg
        cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative h-full p-6 flex flex-col">
        {/* Header Section */}
        <div className="flex justify-between items-start space-x-4 mb-4">
          <div className="flex-1">
            <h2 className={`
              font-bold text-slate-900 
              group-hover:text-indigo-600 
              transition-colors duration-300
              ${variant === 'compact' ? 'text-lg' : 'text-2xl'}
              line-clamp-2
            `}>
              {post.title}
            </h2>
          </div>

          {user && user.username === post.author.username && (
            <div className={`
              flex space-x-2 
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
              transition-all duration-300
            `}>
              <button
                onClick={handleDelete}
                className="p-2 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors"
                title="Delete Post"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleEdit}
                className="p-2 rounded-full bg-indigo-50 text-indigo-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
                title="Edit Post"
              >
                <Edit size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="mb-4 flex-1">
          <p className={`
            text-slate-600
            ${variant === 'compact' ? 'text-sm line-clamp-2' : 'text-base line-clamp-4'}
          `}>
            {getTruncatedContent()}
          </p>
        </div>

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(tag => (
              <div 
                key={tag}
                className="flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
              >
                <Hash size={12} className="mr-1" />
                {tag}
              </div>
            ))}
          </div>
        )}

        {/* Footer Section */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`
              ${getAuthorColor()}
              rounded-full flex items-center justify-center
              font-semibold shadow-sm
              ${variant === 'compact' ? 'w-8 h-8 text-sm' : 'w-10 h-10'}
            `}>
              {post.author.username[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-slate-900 text-sm">
                {post.author.username}
              </span>
              <div className="flex items-center text-slate-500 text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                <time dateTime={post.createdAt}>
                  {formatDate()}
                </time>
              </div>
            </div>
          </div>

          {variant === 'detailed' && (
            <div className={`
              flex items-center text-indigo-500
              ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}
              transition-all duration-300
            `}>
              <BookOpen className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">Read More</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;