import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import { Post } from '../types/post';
import { AlertTriangle } from 'lucide-react';

const MyBlogsPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyPosts = async () => {
      setLoading(true);
      setError('');

      try {
        if (!user) {
          throw new Error('User is not authenticated');
        }

        const response = await axios.get(`http://localhost:5000/api/user/posts/${user.id}`);
        console.log(response);
        setPosts(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch your blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [user]);

  const handleDelete = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Blogs</h1>

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
            <p className="text-xl">You haven't written any blogs yet.</p>
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

export default MyBlogsPage;
