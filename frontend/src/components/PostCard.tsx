import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Trash2, Edit, Calendar, Hash, Power, Terminal } from 'lucide-react';
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
  const [isHovered, setIsHovered] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
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
    setIsGlitching(true);
    if (!window.confirm('CONFIRM_DELETE_SEQUENCE?')) {
      setIsGlitching(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/post/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onDelete?.(post._id!);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.error || 'DELETION_SEQUENCE_FAILED');
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-post/${post._id}`);
  };

  const handleCardClick = () => {
    setIsGlitching(true);
    setTimeout(() => {
      navigate(`/post/${post._id}`);
    }, 500);
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
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '.');
  };

  return (
    <div 
      className={`group relative border-2 border-green-400 bg-black rounded-none overflow-hidden
                 transition-all duration-300 cursor-pointer
                 ${isGlitching ? 'animate-glitch' : ''}
                 hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-10" />
      
      {/* Image Section */}
      <div className="aspect-[16/9] overflow-hidden relative">
        <div className={`absolute inset-0 bg-green-400 opacity-20 transition-opacity duration-300
                      ${isHovered ? 'opacity-40' : 'opacity-20'}`} />
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={post.title}
            className={`w-full h-full object-cover transition-all duration-500
                       ${isHovered ? 'scale-110 saturate-50' : 'scale-100'}
                       filter contrast-125 brightness-75`}
          />
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center">
            <Terminal 
              size={48}
              className={`text-green-400 transition-all duration-300
                         ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 border-t-2 border-green-400">
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.slice(0, 3).map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-2 py-1 text-xs font-mono
                         border border-green-400 text-green-400"
              >
                <Hash size={10} className="mr-1" />
                {tag.toUpperCase()}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-green-400 font-mono">
                +{post.tags.length - 3}_MORE
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className={`text-xl font-bold font-mono text-green-400 mb-2
                     transition-all duration-300 ${isHovered ? 'animate-pulse' : ''}`}>
          {post.title.toUpperCase()}
        </h2>

        {/* Preview Text */}
        <p className="text-green-400 text-sm font-mono opacity-80 mb-4">
          {getTruncatedContent()}
        </p>

        {/* Author and Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-green-400">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-green-400 flex items-center justify-center">
              <span className="text-green-400 font-mono">
                {post.author.username[0].toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-sm font-mono text-green-400">
                {post.author.username.toUpperCase()}
              </div>
              <div className="flex items-center text-xs text-green-400 opacity-80 font-mono">
                <Calendar size={12} className="mr-1" />
                {formatDate()}
              </div>
            </div>
          </div>

          {user && user.username === post.author.username && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 border border-green-400 hover:bg-green-400 hover:text-black
                         transition-all duration-300 group"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 border border-red-500 hover:bg-red-500 hover:text-black
                         transition-all duration-300 text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add these animations to your global CSS


export default PostCard;