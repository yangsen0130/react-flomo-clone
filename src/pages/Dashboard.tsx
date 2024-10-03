// ./src/pages/Dashboard.tsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  getUserBlogs,
  Blog,
  Tag,
  updateBlog,
  deleteBlog,
} from '../services/blogService';
import CreateBlogForm from '../components/CreateBlog';
import { message } from 'antd';
import BlogItem from '../components/BlogItem';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  // State and handlers for sidebar collapse functionality
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const handleCollapseSidebar = () => {
    setIsSidebarCollapsed(true);
  };

  const handleExpandSidebar = () => {
    setIsSidebarCollapsed(false);
  };

  useEffect(() => {
    const fetchUserAndBlogs = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userBlogs = await getUserBlogs(user.objectId);
        setBlogs(userBlogs);
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

  // Function to strip HTML tags from content
  const stripHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Filter blogs based on search term and selectedTag
  const filteredBlogs = blogs.filter(blog => {
    let matchesSearchTerm = true;
    let matchesTag = true;

    // If a search term is set, check if content matches
    if (searchTerm) {
      matchesSearchTerm = stripHTML(blog.content).toLowerCase().includes(searchTerm.toLowerCase());
    }

    // If a tag is selected, check if blog has that tag
    if (selectedTag) {
      matchesTag = (blog.tags && blog.tags.some(tag => tag.objectId === selectedTag.objectId)) ?? false;
    }

    return matchesSearchTerm && matchesTag;
  });

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="flex max-w-[960px] w-full mx-auto">
      {/* Sidebar */}
      {!isSidebarCollapsed && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onCollapse={handleCollapseSidebar}
          blogs={blogs}
          setSelectedTag={setSelectedTag}
        />
      )}
      {/* Main Content */}
      <main className="flex-grow container mx-auto h-screen overflow-hidden">
        {contextHolder}

        <div className="h-full flex flex-col">
          <SearchBar
            isSidebarCollapsed={isSidebarCollapsed}
            onExpandSidebar={handleExpandSidebar}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
          />

          <div className="flex-shrink-0 mb-4">
            <CreateBlogForm onCreate={handleCreateBlog} />
          </div>

          <div className="flex-grow overflow-y-auto">
            {filteredBlogs.length === 0 ? (
              <p className="text-center">
                {searchTerm || selectedTag ? 'No blogs found.' : "You haven't created any blogs yet."}
              </p>
            ) : (
              <div className="space-y-4 pr-4">
                {filteredBlogs.map((blog) => (
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
      </main>
    </div>
  );
};

export default Dashboard;