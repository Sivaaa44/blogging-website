import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { PenLine, X, Plus, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

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
  const quillRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();

    if (editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image'],
            ['clean']
          ],
        },
        placeholder: 'Start writing your story...',
      });

      quillRef.current.on('text-change', () => {
        const content = quillRef.current.root.innerHTML;
        setFormData(prev => ({
          ...prev,
          content: DOMPurify.sanitize(content),
        }));
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        tags: [...prev.tags, trimmedTag].slice(0, 5)
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
    if (!formData.content.trim()) {
      setError('Post content cannot be empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        throw new Error('Authentication token not found');
      }

      const processedContent = DOMPurify.sanitize(formData.content);
      
      await axios.post('http://localhost:5000/api/post', {
        title: formData.title,
        content: processedContent,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
            <h1 className="text-4xl font-bold text-white text-center flex items-center justify-center">
              <PenLine className="mr-4" size={32} />
              Create Your Story
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg flex items-center">
                <AlertCircle className="text-red-400 mr-3" size={24} />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
              <input
                ref={titleInputRef}
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Give your story a great title"
                className="w-full text-3xl font-semibold px-4 py-3 border-b-2 border-slate-200 focus:border-indigo-500 outline-none transition duration-300 placeholder-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <div className="bg-white">
                <div ref={editorRef} className="min-h-[400px]" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700">Tags (max 5)</label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add relevant tags"
                  className="flex-grow px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  disabled={formData.tags.length >= 5}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={formData.tags.length >= 5}
                  className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={20} />
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <div key={tag} className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm flex items-center space-x-2">
                      <span>#{tag}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-indigo-400 hover:text-indigo-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-lg hover:bg-indigo-700 transition duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 text-lg font-medium"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : 'Publish Your Story'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;