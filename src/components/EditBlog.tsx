// ./src/components/EditBlog.tsx

import React, { useState, useRef } from 'react';
import { Blog } from '../services/blogService';

interface EditBlogProps {
  blog: Blog;
  onSave: (blogId: string, content: string) => void;
  onCancel: () => void;
}

const EditBlog: React.FC<EditBlogProps> = ({ blog, onSave, onCancel }) => {
  const [editContent, setEditContent] = useState<string>(blog.content);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const textContent = e.currentTarget.textContent || '';
    setEditContent(textContent);
  };

  const handleSave = () => {
    onSave(blog.objectId, editContent);
  };

  return (
    <div className="p-4 bg-white rounded shadow relative">
      <div
        ref={contentEditableRef}
        contentEditable
        onInput={handleContentChange}
        className="text-gray-700"
        suppressContentEditableWarning={true}
      >
        {editContent}
      </div>
      <div className="mt-2 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-white text-blue-500 px-3 py-1 rounded-md hover:bg-blue-600 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditBlog;