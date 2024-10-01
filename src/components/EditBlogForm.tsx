// ./src/components/EditBlogForm.tsx

import React, { useState } from 'react';
import { Blog, Tag } from '../services/blogService';

interface EditBlogFormProps {
  blog: Blog;
  onEditSave: (blogId: string, title: string, content: string) => void;
  onDelete: (blogId: string) => void;
}

const EditBlogForm: React.FC<EditBlogFormProps> = ({ blog, onEditSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(blog.title || '');
  const [editContent, setEditContent] = useState<string>(blog.content);

  const handleEditInitiate = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditTitle(blog.title || '');
    setEditContent(blog.content);
  };

  const handleEditSave = () => {
    onEditSave(blog.objectId, editTitle, editContent);
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      {isEditing ? (
        <input
          type="text"
          className="w-full px-2 py-1 mb-2 border rounded-md"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="Title"
        />
      ) : (
        <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
      )}
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning={true}
        className="text-gray-700"
        onInput={
          isEditing
            ? (e) => setEditContent(e.currentTarget.textContent || '')
            : undefined
        }
      >
        {isEditing ? editContent : blog.content}
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
        {isEditing ? (
          <>
            <button
              onClick={handleEditSave}
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
              onClick={handleEditInitiate}
              className="bg-white text-blue-500 px-3 py-1 rounded-md hover:bg-blue-600 transition"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(blog.objectId)}
              className="bg-white text-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditBlogForm;