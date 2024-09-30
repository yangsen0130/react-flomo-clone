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

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold">Welcome, {user.email}</h2>
          <p className="text-gray-600">Email verified: {user.emailVerified ? 'Yes' : 'No'}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Create a New Blog</h3>
        <form onSubmit={handleCreateBlog} className="space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog Title"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Blog Content"
              required
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            Create Blog
          </button>
        </form>
      </div>

      {editingBlogId && (
        <div className="mb-8 p-6 bg-yellow-100 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Edit Blog</h3>
          <form onSubmit={handleUpdateBlog} className="space-y-4">
            <div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Blog Title"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Blog Content"
                required
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows={4}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Update Blog
              </button>
              <button
                type="button"
                onClick={() => setEditingBlogId(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {message && <p className="text-center text-green-500 mb-4">{message}</p>}

      <div>
        <h3 className="text-xl font-semibold mb-4">Your Blogs</h3>
        {blogs.length === 0 ? (
          <p className="text-center">You haven't created any blogs yet.</p>
        ) : (
          <ul className="space-y-4">
            {blogs.map((blog) => (
              <li key={blog.objectId} className="p-4 bg-white rounded-lg shadow-md">
                <h4 className="text-lg font-semibold">{blog.title}</h4>
                <p className="text-gray-700">
                  {blog.content ? `${blog.content.substring(0, 100)}...` : 'No content available'}
                </p>
                <small className="text-gray-500">
                  Created at: {new Date(blog.createdAt).toLocaleString()}
                </small>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={() => handleEditBlog(blog)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.objectId)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;