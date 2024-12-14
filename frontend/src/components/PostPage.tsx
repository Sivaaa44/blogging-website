import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, ArrowLeft, Clock, User } from 'lucide-react';

const PostPage: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-semibold">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex justify-center items-center">
        <div className="bg-white border border-red-200 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full transform transition-all hover:scale-105">
          <div className="bg-red-100 text-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-red-800 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg shadow-md transition-all hover:shadow-xl"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex justify-center items-center">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-10 text-center max-w-md w-full transform transition-all hover:scale-105">
          <div className="bg-blue-100 text-blue-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Post Not Found</h2>
          <p className="text-gray-600 mb-6">The post you're looking for seems to have vanished.</p>
          <button
            onClick={() => navigate('/home')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg shadow-md transition-all hover:shadow-xl"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => navigate('/home')} 
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="mr-2" /> Back to Home
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:shadow-3xl">
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">{post.title}</h2>
            {user && user.username === post.author.username && (
              <div className="flex space-x-2 opacity-70 hover:opacity-100 transition-all">
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all"
                  title="Delete Post"
                >
                  <Trash2 size={24} />
                </button>
                <button
                  onClick={handleEdit}
                  className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-all"
                  title="Edit Post"
                >
                  <Edit size={24} />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 mb-6 text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{post.author.username}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <time dateTime={post.createdAt} className="text-gray-600">
                {new Date(post.createdAt!).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </time>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {post.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;