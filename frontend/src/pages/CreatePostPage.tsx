import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Post } from '../types/post';
import { useAuth } from '../context/AuthContext';

interface CreatePostFormData {
  title: string;
  content: string;
  tags: string; // Comma-separated string
}

const CreatePostPage: React.FC = () => {
  const [formData, setFormData] = useState<CreatePostFormData>({
    title: '',
    content: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

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

    const postData: Post = {
      title: formData.title,
      content: formData.content,
      tags: tagsArray,
      author: {
        id: user!.id,
        username: user!.username,
      },
      published: true,
    };

    try {
        const token = localStorage.getItem('token');
        console.log(token)
        if (!token) {
          navigate('/login');
          throw new Error('Authentication token not found. Please log in again.');
        }
       
        // Make the POST request with the Authorization header
        await axios.post('http://localhost:5000/api/post', postData, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token here
          },
        });
      navigate('/home'); // Redirect to home page after successful post creation
    } catch (err: any) {
      setError(err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
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
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;
