import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PenLine, Tags, AlignLeft, Edit } from 'lucide-react';

interface EditPostFormData {
  title: string;
  content: string;
  tags: string;
}

const EditPostPage: React.FC = () => {
  const [formData, setFormData] = useState<EditPostFormData>({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch the post data when the component mounts
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

        const post = response.data;
        
        // Ensure the current user is the author of the post
        if (post.author.username !== user?.username) {
          navigate('/home');
          return;
        }

        setFormData({
          title: post.title,
          content: post.content,
          tags: post.tags.join(', '),
        });
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch post');
        navigate('/home');
      }
    };

    fetchPost();
  }, [id, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert the comma-separated tags string into an array
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const updateData = {
      ...formData,
      tags: tagsArray,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('Authentication token not found. Please log in again.');
      }
     
      // Make the PUT request with the Authorization header
      await axios.put(`http://localhost:5000/api/post/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <h1 className="text-3xl font-extrabold text-white text-center flex items-center justify-center">
            <Edit className="mr-3" size={28} />
            Edit Post
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-gray-700 mb-2 flex items-center">
                <PenLine className="mr-2 text-blue-500" size={20} />
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter post title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-gray-700 mb-2 flex items-center">
                <AlignLeft className="mr-2 text-blue-500" size={20} />
                Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                placeholder="Edit your post content here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 resize-none"
              />
            </div>

            <div>
              <label htmlFor="tags" className="block text-gray-700 mb-2 flex items-center">
                <Tags className="mr-2 text-blue-500" size={20} />
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. technology, programming, web dev"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;