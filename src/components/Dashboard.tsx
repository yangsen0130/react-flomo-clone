import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { getUserBlogs, Blog } from '../services/blogService';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        const userBlogs = await getUserBlogs(userData.objectId);
        setBlogs(userBlogs);
      } catch (error) {
        navigate('/login');
      }
    };
    fetchUserAndBlogs();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <p>Email verified: {user.emailVerified ? 'Yes' : 'No'}</p>
      <button onClick={handleLogout}>Logout</button>
      
      <h3>Your Blogs</h3>
      {blogs.length === 0 ? (
        <p>You haven't created any blogs yet.</p>
      ) : (
        <ul>
          {blogs.map((blog) => (
            <li key={blog.objectId}>
              <h4>{blog.title}</h4>
              <p>{blog.content.substring(0, 100)}...</p>
              <small>Created at: {new Date(blog.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;