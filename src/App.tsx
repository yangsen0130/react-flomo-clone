
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './layouts/Header';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto p-4">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Home />} /> {/* 添加主页路由 */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// 简单的主页组件
const Home: React.FC = () => (
  <div className="text-center">
    <h1 className="text-4xl font-bold mb-4">Welcome to My Blog</h1>
    <p className="text-lg">Share your thoughts with the world!</p>
  </div>
);

export default App;