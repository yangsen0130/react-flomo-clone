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
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

import { message, } from 'antd';
import { Breadcrumb } from "antd";
import type { GetProps } from 'antd';
import { Input, Space } from 'antd';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
  type SearchProps = GetProps<typeof Input.Search>;
  const { Search } = Input;

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
        messageApi.error('Failed to fetch blogs or tags.');
      }
    };
    fetchUserAndBlogs();
  }, [user, navigate, messageApi]);

  const handleEditInitiate = (blog: Blog) => {
    setEditingBlogId(blog.objectId);
    setEditTitle(blog.title || '');
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
      messageApi.success('Blog updated successfully.');
    } catch (error) {
      const leanCloudError = error as { error: string };
      messageApi.error(leanCloudError.error || 'Failed to update blog.');
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    try {
      await deleteBlog(blogId);
      setBlogs(blogs.filter((blog) => blog.objectId !== blogId));
      messageApi.success('Blog deleted successfully.');
    } catch (error) {
      const leanCloudError = error as { error: string };
      messageApi.error(leanCloudError.error || 'Failed to delete blog.');
    }
  };

  const handleCreateBlog = (newBlog: Blog) => {
    setBlogs([newBlog, ...blogs]);
    messageApi.success('Blog created successfully.');
  };

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="h-full flex flex-col">
      {contextHolder}
      

      <div className="flex-shrink-0 mb-4">

        <div className="flex justify-between items-center mx-4">
          <Breadcrumb
            items={[
              {
                href: '',
                title: <HomeOutlined />,
              },
              {
                href: '',
                title: (
                  <>
                    <UserOutlined />
                    <span>Application List</span>
                  </>
                ),
              },
            ]}
          />
          <Search placeholder="input search text" style={{ width: 200 }} />
        </div>
        
        <CreateBlogForm onCreate={handleCreateBlog} />
      </div>

      <div className="flex-grow overflow-y-auto">
        {blogs.length === 0 ? (
          <p className="text-center">You haven't created any blogs yet.</p>
        ) : (
          <div className="space-y-4 pr-4">
            {blogs.map((blog) => (
              <div key={blog.objectId} className="p-4 bg-white rounded shadow">
                <div
                  contentEditable={editingBlogId === blog.objectId}
                  suppressContentEditableWarning={true}
                  className="text-gray-700"
                  onInput={
                    editingBlogId === blog.objectId
                      ? (e) => setEditContent(e.currentTarget.textContent || '')
                      : undefined
                  }
                >
                  {editingBlogId === blog.objectId ? editContent : blog.content}
                </div>
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

                  {editingBlogId === blog.objectId && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;