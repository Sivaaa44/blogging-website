import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import PostPage from './pages/PostPage';
import MyBlogsPage from './pages/MyBlogsPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
          <Route path="/edit-post/:id" element={<EditPostPage />} />
          <Route path="/post/:id" element={
            <PostPage />
          } />
          <Route path="/my-blogs" element={<MyBlogsPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;