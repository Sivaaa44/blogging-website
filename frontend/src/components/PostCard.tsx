import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Edit, Calendar, Hash, MoreVertical } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  useEffect(() => {
    // Extract first image from post content if exists
    if(post.coverImage){
      setCoverImage(post.coverImage);
      return;
    }
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(post.content);
    const firstImage = tempDiv.querySelector('img');
    if (firstImage) {
      setCoverImage(firstImage.src);
    }
  }, [post.content, post.coverImage]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/post/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.(post._id!);
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
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[post.author.username.charCodeAt(0) % colors.length];
  };

  const getTruncatedContent = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = DOMPurify.sanitize(post.content);
    const textContent = tempDiv.textContent || tempDiv.innerText;
    const maxLength = variant === 'compact' ? 80 : 160;
    return textContent.length > maxLength 
      ? textContent.slice(0, maxLength) + '...' 
      : textContent;
  };

  const formatDate = () => {
    const date = new Date(post.createdAt!);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-slate-200"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="aspect-[16/9] overflow-hidden bg-slate-100">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={post.title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-slate-300"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600"
              >
                <Hash size={10} className="mr-1" />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-slate-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {post.title}
        </h2>

        {/* Preview Text */}
        <p className="text-slate-600 text-sm line-clamp-2 mb-4">
          {getTruncatedContent()}
        </p>

        {/* Author and Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-3">
            <div className={`${getAuthorColor()} w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm`}>
              {post.author.username[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">
                {post.author.username}
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <Calendar size={12} className="mr-1" />
                {formatDate()}
              </div>
            </div>
          </div>

          {user && user.username === post.author.username && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors"
              >
                <MoreVertical size={16} className="text-slate-500" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-50 flex items-center"
                  >
                    <Edit size={14} className="mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-slate-50 flex items-center"
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;