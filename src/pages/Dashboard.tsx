// ./src/pages/Dashboard.tsx
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  getUserBlogs,
  Blog,
  Tag,
  updateBlog,
  deleteBlog,
  getAllTags
} from '../services/blogService';
import CreateBlogForm from '../components/CreateBlog';
import { message, Button } from 'antd';
import BlogItem from '../components/BlogItem';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';

const Dashboard: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [page, setPage] = useState(1);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);
  const limit = 10;

  const handleCollapseSidebar = () => {
    setIsSidebarCollapsed(true);
  };

  const handleExpandSidebar = () => {
    setIsSidebarCollapsed(false);
  };

  // Memoize fetchTags to prevent it from being recreated on every render
  const fetchTags = useCallback(async () => {
    try {
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      messageApi.error('Failed to fetch tags.');
    }
  }, [messageApi]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const userBlogs = await getUserBlogs(user.objectId, page, limit);
        if (userBlogs.length < limit) {
          setHasMoreBlogs(false);
        } else {
          setHasMoreBlogs(true);
        }
        if (page === 1) {
          setBlogs(userBlogs);
        } else {
          setBlogs((prevBlogs) => [...prevBlogs, ...userBlogs]);
        }
        await fetchTags();
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        messageApi.error('Failed to fetch blogs.');
      }
    };
    fetchData();
  }, [user, navigate, messageApi, page, fetchTags]);

  const handleEditSave = async (blogId: string, content: string) => {
    try {
      const updatedBlog = await updateBlog(blogId, content);
      setBlogs(blogs.map((blog) => (blog.objectId === blogId ? updatedBlog : blog)));
      messageApi.success('Blog updated successfully.');
      await fetchTags();
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

  const handleCreateBlog = async (newBlog: Blog) => {
    try {
      setBlogs([newBlog, ...blogs]);
      messageApi.success('Blog created successfully.');
      await fetchTags();
    } catch (error) {
      const leanCloudError = error as { error: string };
      messageApi.error(leanCloudError.error || 'Failed to create blog.');
    }
  };

  // Helper function to strip HTML tags from content
  const stripHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  // Memoize filteredBlogs to optimize performance
  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      let matchesSearchTerm = true;
      let matchesTag = true;

      if (searchTerm) {
        matchesSearchTerm = stripHTML(blog.content).toLowerCase().includes(searchTerm.toLowerCase());
      }

      if (selectedTag) {
        matchesTag = (blog.tags && blog.tags.some(tag => tag.objectId === selectedTag.objectId)) ?? false;
      }

      return matchesSearchTerm && matchesTag;
    });
  }, [blogs, searchTerm, selectedTag]);

  if (!user) return <p className="text-center mt-8">Loading...</p>;

  return (
    <div className="flex max-w-[960px] w-full mx-auto">
      {!isSidebarCollapsed && (
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onCollapse={handleCollapseSidebar}
          blogs={blogs}
          setSelectedTag={setSelectedTag}
          tags={tags}
        />
      )}
      <main className="flex-grow container max-w-[720px] mx-auto h-screen overflow-hidden">
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
            <CreateBlogForm onCreate={handleCreateBlog} tags={tags} refreshTags={fetchTags} />
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
                    tags={tags}
                    refreshTags={fetchTags}
                  />
                ))}
                {hasMoreBlogs && (
                  <div className="text-center my-4">
                    <Button onClick={() => setPage(prevPage => prevPage + 1)}>Load More</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;