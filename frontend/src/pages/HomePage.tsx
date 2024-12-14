import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery); // Debounced version of the search query
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery); // Update the debounced query after 500ms
    }, 500);

    return () => clearTimeout(handler); // Cleanup the timeout on each keypress
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
  }, [debouncedQuery]); // Only fetch when the debouncedQuery changes

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value); // Update search query immediately as user types
  };

  const handleDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Posts</h1>
        {isAuthenticated() && (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
            onClick={() => navigate('/create-post')}
          >
            Create Post
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Display Posts */}
      {loading ? (
        <div className="flex justify-center">
          <div className="spinner border-4 border-blue-500 rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDelete}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
