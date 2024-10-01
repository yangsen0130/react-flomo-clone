// ./src/pages/Dashboard.tsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  getUserBlogs,
  Blog,
  getAllTags,
  Tag,
  updateBlog,
  deleteBlog,
} from '../services/blogService';
import CreateBlogForm from '../components/CreateBlog';
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

import { message } from 'antd';
import { Breadcrumb, Input } from 'antd';
import type { GetProps } from 'antd';
import BlogItem from '../components/BlogItem';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
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

  const handleEditSave = async (blogId: string, content: string) => {
    try {
      const updatedBlog = await updateBlog(blogId, content);
      setBlogs(blogs.map((blog) => (blog.objectId === blogId ? updatedBlog : blog)));
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
                  <span>Dashboard</span>
                </>
              ),
            },
          ]}
        />
        <Search placeholder="Search blogs" style={{ width: 200 }} />
      </div>

      <div className="flex-shrink-0 mb-4">
        <CreateBlogForm onCreate={handleCreateBlog} />
      </div>

      <div className="flex-grow overflow-y-auto">
        {blogs.length === 0 ? (
          <p className="text-center">You haven't created any blogs yet.</p>
        ) : (
          <div className="space-y-4 pr-4">
            {blogs.map((blog) => (
              <BlogItem
                key={blog.objectId}
                blog={blog}
                onEditSave={handleEditSave}
                onDelete={handleDeleteBlog}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;