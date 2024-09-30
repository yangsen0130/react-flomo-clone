// ./src/pages/Dashboard.tsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CreateBlogForm from '../components/CreateBlogForm'; // New import

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
    <div className="mt-8">
      {/* Create Blog Form Component */}
      <CreateBlogForm onCreate={handleCreateBlog} />

      {message && <p className="text-center text-green-500 mb-4">{message}</p>}

      {/* Blog List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Blogs</h3>
        {blogs.length === 0 ? (
          <p className="text-center">You haven't created any blogs yet.</p>
        ) : (
          <ul className="space-y-4">
            {blogs.map((blog) => (
              <li key={blog.objectId} className="p-4 bg-white rounded-lg shadow-md">
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
                    <h4 className="text-lg font-semibold">{blog.title}</h4>
                    <p className="text-gray-700">
                      {blog.content ? `${blog.content.substring(0, 100)}...` : 'No content available'}
                    </p>
                  </div>
                )}
                <small className="text-gray-500">
                  Created at: {new Date(blog.createdAt).toLocaleString()}
                </small>
                {/* Display tags */}
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
                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
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
                      <button
                        onClick={() => handleManageTags(blog)}
                        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
                      >
                        Manage Tags
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Manage Tags Modal */}
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

interface ManageTagsProps {
  blogId: string;
  allTags: Tag[];
  blogTags: Tag[];
  onClose: () => void;
  onTagsUpdated: () => void;
}

const ManageTags: React.FC<ManageTagsProps> = ({
  blogId,
  allTags,
  blogTags,
  onClose,
  onTagsUpdated,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(blogTags.map((tag) => tag.objectId));
  const [newTagName, setNewTagName] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>(allTags);

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSaveTags = async () => {
    try {
      const currentTagIds = blogTags.map((tag) => tag.objectId);
      const tagsToRemove = currentTagIds.filter((id) => !selectedTags.includes(id));
      const tagsToAdd = selectedTags.filter((id) => !currentTagIds.includes(id));

      // Remove tags
      for (const tagId of tagsToRemove) {
        await removeTagFromBlog(blogId, tagId);
      }

      // Add tags
      for (const tagId of tagsToAdd) {
        await addTagToBlog(blogId, tagId);
      }

      onTagsUpdated(); // Refresh data in parent component
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTag = async () => {
    try {
      if (!newTagName.trim()) return;
      const newTag = await createTag(newTagName.trim());
      setAvailableTags([...availableTags, newTag]);
      setSelectedTags([...selectedTags, newTag.objectId]);
      setNewTagName('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <strong>Select Tags:</strong>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {availableTags.map((tag) => (
            <label key={tag.objectId} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.objectId)}
                onChange={() => handleToggleTag(tag.objectId)}
                className="mr-2"
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <strong>Create New Tag:</strong>
        <div className="flex mt-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-grow px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New tag name"
          />
          <button
            type="button"
            onClick={handleCreateTag}
            className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveTags}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};