import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { PenLine, X, Plus, AlertCircle, Image as ImageIcon } from 'lucide-react';
import DOMPurify from 'dompurify';

const CreatePostPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    coverImage: '',
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
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ header: [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ color: [] }, { background: [] }],
              ['blockquote', 'code-block'],
              [{ list: 'ordered'}, { list: 'bullet' }],
              [{ align: [] }],
              ['link', 'image'],
              ['clean']
            ],
            handlers: {
              image: imageHandler
            }
          },
        },
        placeholder: 'Share your thoughts...',
      });

      quillRef.current = quill;

      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
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

  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
  
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
  
      // Show loading state in editor
      const range = quillRef.current.getSelection(true);
      quillRef.current.insertText(range.index, 'Uploading image...', {
        'color': '#999',
        'italic': true,
      }, true);
  
      const formData = new FormData();
      formData.append('image', file);
  
      try {
        const response = await axios.post('http://localhost:5000/api/post/upload-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        // Remove the placeholder text
        quillRef.current.deleteText(range.index, 'Uploading image...'.length);
        
        // Insert the uploaded image
        quillRef.current.insertEmbed(range.index, 'image', response.data.url);
      } catch (error) {
        // Remove the placeholder text
        quillRef.current.deleteText(range.index, 'Uploading image...'.length);
        
        // Show error message in editor
        quillRef.current.insertText(range.index, 'Failed to upload image', {
          'color': '#e53e3e',
          'italic': true,
        }, true);
        
        setTimeout(() => {
          quillRef.current.deleteText(range.index, 'Failed to upload image'.length);
        }, 3000);
      }
    };
  };
  

  const handleCoverImageUpload = async (e: any) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/api/post/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setFormData(prev => ({
        ...prev,
        coverImage: response.data.url,
      }));
    } catch (error) {
      setError('Failed to upload cover image');
    }
  };

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
        coverImage: formData.coverImage,
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
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8">
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

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Cover Image</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-slate-400 transition-colors">
                <div className="space-y-1 text-center">
                  {formData.coverImage ? (
                    <div className="relative">
                      <img
                        src={formData.coverImage}
                        alt="Cover"
                        className="max-h-64 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg"
                      >
                        <X size={16} className="text-gray-600" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-slate-600 hover:text-slate-800">
                          <span>Upload a cover image</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleCoverImageUpload}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
                className="w-full text-3xl font-semibold px-4 py-3 border-b-2 border-slate-200 focus:border-slate-600 outline-none transition duration-300 placeholder-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Content</label>
              <div className="bg-white border border-slate-200 rounded-lg">
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