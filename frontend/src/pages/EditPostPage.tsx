import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';

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
          throw new Error('Authentication token not found. Please log in again.');
        }

        const response = await axios.get(`http://localhost:5000/api/post/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const post = response.data;
        
        // Ensure the current user is the author of the post
        if (post.author.id !== user?.id) {
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
    const tagsArray = formData.tags.split(',').map(tag => tag.trim());

    const updateData = {
      ...formData,
      tags: tagsArray,
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }
     
      // Make the PUT request with the Authorization header
      await axios.put(`http://localhost:5000/api/post/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      navigate('/home'); // Redirect to home page after successful post update
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 mb-2">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 mb-2">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-gray-700 mb-2">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
        >
          {loading ? 'Updating...' : 'Update Post'}
        </button>
      </form>
    </div>
  );
};

export default EditPostPage;