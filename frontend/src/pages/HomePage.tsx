import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, AlertTriangle } from 'lucide-react';
import ProfileDropdown from '../components/ProfileDropdown';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint = debouncedQuery.trim() === ''
          ? 'http://localhost:5000/api/post'
          : `http://localhost:5000/api/post/search/${encodeURIComponent(debouncedQuery)}`;
        const response = await axios.get(endpoint);
        setPosts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [debouncedQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-hidden">
      {/* Scanlines overlay */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] animate-scanlines" />
      
      {/* CRT flicker effect */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.1)_0%,rgba(0,0,0,0.1)_100%)] animate-crt" />

      <div className="max-w-7xl mx-auto p-8 relative">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <h1 className="text-4xl font-bold text-green-400 animate-glow tracking-wider">
            SKIBIDI_RE_BLOGS
          </h1>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated() && (
              <>
                <button
                  className="bg-green-900 hover:bg-green-800 text-green-400 py-2 px-4 border border-green-400 
                           hover:animate-pulse transition-all duration-300 flex items-center space-x-2"
                  onClick={() => navigate('/create-post')}
                >
                  <Plus size={20} />
                  <span>NEW_POST</span>
                </button>
                {user && <ProfileDropdown user={user} />}
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-green-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="SEARCH//"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 bg-black border-2 border-green-400 text-green-400 
                       placeholder:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 
                       transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,0,0.3)]"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-terminal text-2xl">_LOADING...</div>
            </div>
          ) : error ? (
            <div className="border-2 border-red-500 text-red-500 p-4 flex items-center">
              <AlertTriangle className="mr-2" size={24} />
              ERROR: {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto mb-4 text-green-400" />
              <p className="text-xl">NO_POSTS_FOUND</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <div key={post._id} 
                     className="opacity-0 animate-fadeIn"
                     style={{ animationDelay: `${index * 150}ms` }}>
                  <PostCard post={post} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add custom styles to your app's global CSS file


export default HomePage;