import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { getUserBlogs, Blog, createBlog, updateBlog, deleteBlog } from '../services/blogService';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData)); // Store user data for helper function
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

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBlog = await createBlog(title, content);
      setBlogs([newBlog, ...blogs]);
      setTitle('');
      setContent('');
      setMessage('Blog created successfully.');
    } catch (error) {
      const leanCloudError = error as { error: string };
      setMessage(leanCloudError.error || 'Failed to create blog.');
    }
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlogId(blog.objectId);
    setEditTitle(blog.title);
    setEditContent(blog.content);
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlogId) return;
    try {
      const updatedBlog = await updateBlog(editingBlogId, editTitle, editContent);
      setBlogs(blogs.map(blog => blog.objectId === editingBlogId ? updatedBlog : blog));
      setEditingBlogId(null);
      setEditTitle('');
      setEditContent('');
      setMessage('Blog updated successfully.');
    } catch (error) {
      const leanCloudError = error as { error: string };
      setMessage(leanCloudError.error || 'Failed to update blog.');
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteBlog(blogId);
      setBlogs(blogs.filter(blog => blog.objectId !== blogId));
      setMessage('Blog deleted successfully.');
    } catch (error) {
      const leanCloudError = error as { error: string };
      setMessage(leanCloudError.error || 'Failed to delete blog.');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.email}</h2>
      <p>Email verified: {user.emailVerified ? 'Yes' : 'No'}</p>
      <button onClick={handleLogout}>Logout</button>

      <h3>Create a New Blog</h3>
      <form onSubmit={handleCreateBlog}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Blog Title"
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Blog Content"
          required
        />
        <button type="submit">Create Blog</button>
      </form>

      {editingBlogId && (
        <div>
          <h3>Edit Blog</h3>
          <form onSubmit={handleUpdateBlog}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Blog Title"
              required
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Blog Content"
              required
            />
            <button type="submit">Update Blog</button>
            <button type="button" onClick={() => setEditingBlogId(null)}>Cancel</button>
          </form>
        </div>
      )}

      {message && <p>{message}</p>}

      <h3>Your Blogs</h3>
      {blogs.length === 0 ? (
        <p>You haven't created any blogs yet.</p>
      ) : (
        <ul>
          {blogs.map((blog) => (
            <li key={blog.objectId}>
              <h4>{blog.title}</h4>
              <p>{blog.content ? blog.content.substring(0, 100) : 'No content available'}...</p>
              <small>Created at: {new Date(blog.createdAt).toLocaleString()}</small>
              <div>
                <button onClick={() => handleEditBlog(blog)}>Edit</button>
                <button onClick={() => handleDeleteBlog(blog.objectId)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;