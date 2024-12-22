import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, ArrowLeft, Clock, User, Tags, Share2, AlertTriangle, Terminal, Power } from 'lucide-react';
import DOMPurify from 'dompurify';

const PostPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('ERROR_404: POST_ID_NOT_FOUND');
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          throw new Error('ACCESS_DENIED: AUTHENTICATION_REQUIRED');
        }

        const response = await axios.get(`http://localhost:5000/api/post/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPost(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.message || 'SYSTEM_FAILURE: DATA_RETRIEVAL_ERROR');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleDelete = async () => {
    setIsGlitching(true);
    if (!window.confirm('CONFIRM_DELETE_SEQUENCE: IRREVERSIBLE_OPERATION')) {
      setIsGlitching(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('ACCESS_DENIED: AUTHENTICATION_REQUIRED');

      await axios.delete(`http://localhost:5000/api/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      navigate('/home');
    } catch (error: any) {
      setIsGlitching(false);
      alert('DELETE_SEQUENCE_FAILED: ' + (error.response?.data?.message || 'UNKNOWN_ERROR'));
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    } catch (err) {
      console.error('CLIPBOARD_ERROR:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="text-center">
          <div className="animate-terminal text-green-400 text-xl font-mono mb-4">
            LOADING_DATA...
          </div>
          <Terminal className="w-16 h-16 text-green-400 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center p-4">
        <div className="border-2 border-red-500 p-8 max-w-md w-full relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-20" />
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-mono text-red-500 mb-4 animate-glitch">
              SYSTEM_ERROR
            </h2>
            <p className="text-red-400 font-mono mb-6">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-red-500 hover:bg-red-600 text-black font-mono py-3 
                       transition-all duration-300 border-2 border-red-500
                       hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]"
            >
              RETURN_TO_MAINFRAME
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className={`min-h-screen bg-black text-green-400 py-12 px-4 relative
                    ${isGlitching ? 'animate-glitch' : ''}`}>
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none bg-scanlines opacity-10" />
      
      {/* CRT flicker effect */}
      <div className="fixed inset-0 pointer-events-none bg-crt animate-crt" />

      {/* Navigation */}
      <div className="fixed top-6 left-6 z-10">
        <button 
          onClick={() => navigate('/home')} 
          className="flex items-center font-mono border-2 border-green-400 px-4 py-2
                   hover:bg-green-400 hover:text-black transition-all duration-300
                   hover:shadow-[0_0_20px_rgba(0,255,0,0.3)]"
        >
          <ArrowLeft className="mr-2" /> RETURN_TO_MAINFRAME
        </button>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto">
        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-96 mb-8 border-2 border-green-400 overflow-hidden">
            <div className="absolute inset-0 bg-green-400 opacity-20" />
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover filter contrast-125 brightness-75"
            />
          </div>
        )}

        {/* Post Container */}
        <div className="border-2 border-green-400 relative overflow-hidden">
          <div className="p-8 relative">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <h1 className="text-4xl font-mono font-bold animate-glow">
                {post.title.toUpperCase()}
              </h1>
              
              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleShare}
                  className="border-2 border-green-400 p-2 hover:bg-green-400 hover:text-black
                           transition-all duration-300 relative"
                  title="SHARE_POST"
                >
                  <Share2 size={24} />
                  {showShareTooltip && (
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                                   text-sm bg-green-400 text-black px-2 py-1 font-mono">
                      LINK_COPIED
                    </span>
                  )}
                </button>
                
                {user && user.username === post.author.username && (
                  <>
                    <button
                      onClick={() => navigate(`/edit-post/${id}`)}
                      className="border-2 border-green-400 p-2 hover:bg-green-400 hover:text-black
                               transition-all duration-300"
                      title="EDIT_POST"
                    >
                      <Edit size={24} />
                    </button>
                    <button
                      onClick={handleDelete}
                      className="border-2 border-red-500 p-2 text-red-500 hover:bg-red-500 hover:text-black
                               transition-all duration-300"
                      title="DELETE_POST"
                    >
                      <Trash2 size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 mb-8 font-mono border-t-2 border-b-2 border-green-400 py-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>USER: {post.author.username.toUpperCase()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <time dateTime={post.createdAt} className="uppercase">
                  TIMESTAMP: {new Date(post.createdAt!).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit'
                  }).replace(/\//g, '.')}
                </time>
              </div>
              {post.tags && post.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Tags className="w-5 h-5" />
                  {post.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="border border-green-400 px-3 py-1 text-sm hover:bg-green-400 
                               hover:text-black transition-all duration-300"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div 
              className="prose prose-invert max-w-none font-mono prose-headings:text-green-400 
                       prose-a:text-green-400 prose-strong:text-green-400 prose-code:text-green-400"
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