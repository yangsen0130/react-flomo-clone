// ./src/App.tsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header'; // Updated import path
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home'; // Assuming Home is in pages folder
import { AuthContext } from './contexts/AuthContext';

const App: React.FC = () => {
  const { user } = useContext(AuthContext);


  return (
    <Router>
      <Routes>
        {/* Public Routes with Header */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes with Sidebar */}
        <Route
          path="/dashboard/*"
          element={
            user ? (
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

// Public Layout Component with Header
const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow container mx-auto p-4">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </main>
  </div>
);

// Dashboard Layout Component with Sidebar
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex mx-4">
      <Sidebar />
      <main className="flex-grow container mx-auto h-screen overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default App;