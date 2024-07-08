import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Profile from './pages/Profile';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Chat from './components/home/Chat';
import CreatePost from './components/posts/CreatePost'; // 경로 수정
import PostList from './components/posts/PostList'; // 경로 수정
import PostDetail from './components/posts/PostDetail'; // 경로 수정
import Navbar from './components/common/Navbar';
import './App.css'; // App.css 파일 추가

const App = () => {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/posts" element={<PostList />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
