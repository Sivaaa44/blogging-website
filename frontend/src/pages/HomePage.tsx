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

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Posts based on debouncedQuery
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');

      try {
        const endpoint =
          debouncedQuery.trim() === ''
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          <h1 className="text-3xl font-extrabold text-gray-900">Skibidi re blogs</h1>
          <div className="flex items-center space-x-4">
            {isAuthenticated() && (
              <>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                  onClick={() => navigate('/create-post')}
                >
                  <Plus size={20} />
                  <span>Create Post</span>
                </button>
                {user && <ProfileDropdown user={user} />}
              </>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search posts by title, content, or tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
            />
          </div>
        </div>

        {/* Display Posts */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertTriangle className="mr-2" size={24} />
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-xl">No posts found. Try a different search term.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;