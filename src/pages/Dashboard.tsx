// ./src/pages/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  getUserBlogs,
  Blog,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllTags,
  Tag,
  createTag,
  addTagToBlog,
  removeTagFromBlog,
} from '../services/blogService';
import CreateBlogForm from '../components/CreateBlogForm';
import ManageTags from '../components/ManageTags'; // Assuming you have this component
// Sidebar is now part of DashboardLayout

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [message, setMessage] = useState<string>('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagManagementBlogId, setTagManagementBlogId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userBlogs = await getUserBlogs(user.objectId);
        setBlogs(userBlogs);
        const tags = await getAllTags();
        setAllTags(tags);
      } catch (error) {
        console.error('Failed to fetch blogs or tags:', error);
      }
    };
    fetchUserAndBlogs();
  }, [user, navigate]);

  const handleEditInitiate = (blog: Blog) => {
    setEditingBlogId(blog.objectId);
    setEditTitle(blog.title);
    setEditContent(blog.content);
  };

  const handleEditCancel = () => {
    setEditingBlogId(null);
    setEditTitle('');
    setEditContent('');
  };

  const handleEditSave = async (blogId: string) => {
    try {
      const updatedBlog = await updateBlog(blogId, editTitle, editContent);
      setBlogs(blogs.map((blog) => (blog.objectId === blogId ? updatedBlog : blog)));
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
      setBlogs(blogs.filter((blog) => blog.objectId !== blogId));
      setMessage('Blog deleted successfully.');
    } catch (error) {
      const leanCloudError = error as { error: string };
      setMessage(leanCloudError.error || 'Failed to delete blog.');
    }
  };

  const handleManageTags = (blog: Blog) => {
    setTagManagementBlogId(blog.objectId);
  };

  const handleTagsUpdated = async () => {
    if (!user) return;
    try {
      const userBlogs = await getUserBlogs(user.objectId);
      setBlogs(userBlogs);
    } catch (error) {
      console.error('Failed to refresh blogs:', error);
    }
  };

  const handleCreateBlog = (newBlog: Blog) => {
    setBlogs([newBlog, ...blogs]);
  };

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-shrink-0 mb-4">
        <CreateBlogForm onCreate={handleCreateBlog} />
      </div>

      {message && <p className="text-center text-green-500 mb-4 flex-shrink-0">{message}</p>}

      <div className="flex-grow overflow-y-auto">
        {blogs.length === 0 ? (
          <p className="text-center">You haven't created any blogs yet.</p>
        ) : (
          <div className="space-y-4 pr-4">
            {blogs.map((blog) => (
                <div key={blog.objectId} className="p-4 bg-white rounded shadow">
                {editingBlogId === blog.objectId ? (
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-4 py-2 border rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                    <p className="text-gray-700">
                      {blog.content ? `${blog.content.substring(0, 100)}...` : 'No content available'}
                    </p>
                  </div>
                )}
                <small className="text-gray-500">
                  Created at: {new Date(blog.createdAt).toLocaleString()}
                </small>
                <div className="mt-2">
                  <strong>Tags:</strong>{' '}
                  {blog.tags && blog.tags.length > 0 ? (
                    blog.tags.map((tag) => (
                      <span
                        key={tag.objectId}
                        className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm mr-1"
                      >
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <span>No tags</span>
                  )}
                </div>
                <div className="mt-2 flex space-x-2">
                  {editingBlogId === blog.objectId ? (
                    <>
                      <button
                        onClick={() => handleEditSave(blog.objectId)}
                        className="bg-white text-blue-500 px-3 py-1 rounded-md hover:bg-blue-600 transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditInitiate(blog)}
                        className="bg-white text-blue-500 px-3 py-1 rounded-md hover:bg-blue-600 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.objectId)}
                        className="bg-white text-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleManageTags(blog)}
                        className="bg-white text-green-500 px-3 py-1 rounded-md hover:bg-green-600 transition"
                      >
                        Tags
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tagManagementBlogId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Manage Tags</h3>
            <ManageTags
              blogId={tagManagementBlogId}
              allTags={allTags}
              blogTags={blogs.find((blog) => blog.objectId === tagManagementBlogId)?.tags || []}
              onClose={() => setTagManagementBlogId(null)}
              onTagsUpdated={handleTagsUpdated}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;