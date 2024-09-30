// ./src/components/CreateBlogForm.tsx
import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { createBlog, Blog } from '../services/blogService';
import { LeanCloudError } from '../services/authService';

interface CreateBlogFormProps {
  onCreate: (newBlog: Blog) => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCreate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!user) {
      setMessage('You must be logged in to create a blog.');
      return;
    }
    try {
      const newBlog = await createBlog(title, content);
      onCreate(newBlog);
      setTitle('');
      setContent('');
      setMessage('Blog created successfully.');
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      setMessage(leanCloudError.error || 'Failed to create blog.');
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md mr-4">
      <h3 className="text-xl font-semibold mb-4">Create a New Blog</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Blog Title"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}
        <div
          contentEditable
          onInput={(e) => setContent(e.currentTarget.textContent || '')}
          // placeholder="Blog Content"
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ minHeight: '100px' }}
        >
        </div>
        <button
          type="submit"
          className="w-full bg-white text-blue-600 py-2 rounded-md hover:bg-gray-100 transition"
        >
          Create Blog
        </button>
      </form>
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}
    </div>
  );
};

export default CreateBlogForm;