// ./src/components/BlogItem.tsx

import React, { useState } from 'react';
import { Blog, Tag } from '../services/blogService';
import DisplayBlog from './DisplayBlog';
import EditBlog from './EditBlog';

interface BlogItemProps {
  blog: Blog;
  tags: Tag[];
  onEditSave: (blogId: string, content: string) => void;
  onDelete: (blogId: string) => void;
  refreshTags: () => void;
}

const BlogItem: React.FC<BlogItemProps> = ({ blog, tags, onEditSave, onDelete, refreshTags }) => {
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
          tags={tags}
          blog={blog}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          refreshTags={refreshTags}
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

export default React.memo(BlogItem);