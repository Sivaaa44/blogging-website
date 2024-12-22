import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, ArrowLeft, Clock, User, Tags, Share2, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

const PostPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No post ID provided');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          throw new Error('Authentication token not found. Please log in again.');
        }

        const response = await axios.get(`http://localhost:5000/api/post/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setPost(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      await axios.delete(`http://localhost:5000/api/post/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/home');
    } catch (error: any) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Failed to delete post');
    }
  };

  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex justify-center items-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex justify-center items-center">
        <div className="bg-white border border-rose-200 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full">
          <div className="bg-rose-100 text-rose-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-rose-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg shadow-md transition-all"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-10">
        <button 
          onClick={() => navigate('/home')} 
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors bg-white/70 backdrop-blur-sm hover:bg-white/90 px-4 py-2 rounded-full shadow-md"
        >
          <ArrowLeft className="mr-2" /> Back to Home
        </button>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-96 mb-8 rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
          </div>
        )}

        {/* Post Container */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {post.title}
              </h1>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-all relative"
                  title="Share Post"
                >
                  <Share2 size={24} />
                  {showShareTooltip && (
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-white bg-gray-800 px-2 py-1 rounded">
                      Copied!
                    </span>
                  )}
                </button>
                
                {user && user.username === post.author.username && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-all"
                      title="Edit Post"
                    >
                      <Edit size={24} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
                      title="Delete Post"
                    >
                      <Trash2 size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-gray-700">{post.author.username}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                <time dateTime={post.createdAt} className="text-gray-600">
                  {new Date(post.createdAt!).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </time>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tags className="w-5 h-5 text-indigo-500" />
                  {post.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: DOMPurify.sanitize(post.content, {
                  ADD_TAGS: ['iframe'],
                  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
                })
              }}
            />
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostPage;