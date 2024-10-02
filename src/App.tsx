import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
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
                <Dashboard isSidebarCollapsed={false} onExpandSidebar={function (): void {
                  throw new Error('Function not implemented.');
                } } />
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleCollapseSidebar = () => {
    setIsSidebarCollapsed(true);
  };

  const handleExpandSidebar = () => {
    setIsSidebarCollapsed(false);
  };

  return (
    <div className="flex max-w-[960px] w-full mx-auto">
      {!isSidebarCollapsed && (
        <Sidebar isCollapsed={isSidebarCollapsed} onCollapse={handleCollapseSidebar} />
      )}
      <main className="flex-grow container mx-auto h-screen overflow-hidden">
        {React.cloneElement(children as React.ReactElement, {
          isSidebarCollapsed,
          onExpandSidebar: handleExpandSidebar,
        })}
      </main>
    </div>
  );
};

export default App;