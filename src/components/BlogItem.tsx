// ./src/components/BlogItem.tsx

import React, { useState } from 'react';
import { Blog } from '../services/blogService';
import DisplayBlog from './DisplayBlog';
import EditBlog from './EditBlog';

interface BlogItemProps {
  blog: Blog;
  onEditSave: (blogId: string, content: string) => void;
  onDelete: (blogId: string) => void;
}

const BlogItem: React.FC<BlogItemProps> = ({ blog, onEditSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = (blogId: string, content: string) => {
    onEditSave(blogId, content);
    setIsEditing(false);
  };

  const handleDelete = (blogId: string) => {
    onDelete(blogId);
  };

  return (
    <>
      {isEditing ? (
        <EditBlog
          blog={blog}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <DisplayBlog
          blog={blog}
          onEdit={handleEdit}
          onDelete={() => handleDelete(blog.objectId)}
        />
      )}
    </>
  );
};

export default BlogItem;