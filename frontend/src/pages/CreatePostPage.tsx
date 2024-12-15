import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  PenLine, 
  Tags, 
  X, 
  Check, 
  Plus 
} from 'lucide-react';

interface CreatePostFormData {
  title: string;
  content: string;
  tags: string[];
}

const CreatePostPage: React.FC = () => {
  const [formData, setFormData] = useState<CreatePostFormData>({
    title: '',
    content: '',
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on title input when component mounts
    titleInputRef.current?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddTag = () => {
    const trimmedTag = currentTag.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('Authentication token not found. Please log in again.');
      }
     
      await axios.post('http://localhost:5000/api/post', {
        title: formData.title,
        content: formData.content,
        tags: formData.tags,
        author: {
          id: user!.id,
          username: user!.username,
        },
        published: true,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate('/home');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-white text-center flex items-center justify-center">
            <PenLine className="mr-3" size={28} />
            Create New Post
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter your post title"
              className="w-full text-2xl font-semibold px-4 py-3 border-b-2 border-slate-200 focus:border-indigo-500 outline-none transition duration-300 placeholder-slate-400"
            />
          </div>

          {/* Content Input */}
          <div>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              required
              placeholder="Write your post content here..."
              rows={8}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition duration-300 resize-none"
            />
          </div>

          {/* Tags Input */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tags (Press Enter)"
                className="flex-grow px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition"
              >
                <Plus size={20} />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <div 
                    key={tag} 
                    className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
                  >
                    <span>{tag}</span>
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full bg-indigo-500 text-white 
              py-3 rounded-lg 
              hover:bg-indigo-600 
              transition duration-300 
              flex items-center justify-center 
              space-x-2 
              disabled:opacity-50
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : (
              'Publish Post'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;