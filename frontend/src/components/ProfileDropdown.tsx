import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProfileDropdownProps {
  user: {
    username: string;
    id: string;
  };
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMyBlogs = () => {
    navigate('/my-blogs');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="
          w-10 h-10 rounded-full 
          bg-blue-500 text-white 
          flex items-center justify-center 
          hover:bg-blue-600 
          transition-colors
        "
      >
        <User size={20} />
      </button>

      {isOpen && (
        <div className="
          absolute right-0 top-full mt-2 
          w-64 
          bg-white 
          border border-gray-200 
          rounded-lg 
          shadow-2xl 
          overflow-hidden 
          z-50
        ">
          <div className="px-4 py-3 bg-blue-50 border-b">
            <p className="text-sm font-medium text-gray-900">
              {user.username}
            </p>
          </div>

          <button 
            onClick={handleMyBlogs}
            className="
              w-full 
              flex items-center 
              px-4 py-2 
              hover:bg-gray-100 
              transition-colors 
              text-left
            "
          >
            <FileText className="mr-3 text-blue-500" size={18} />
            My Blogs
          </button>

          <button 
            onClick={handleLogout}
            className="
              w-full 
              flex items-center 
              px-4 py-2 
              hover:bg-gray-100 
              transition-colors 
              text-left 
              text-red-600
            "
          >
            <LogOut className="mr-3" size={18} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;