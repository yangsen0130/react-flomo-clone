import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { createBlog, Blog } from '../services/blogService';
import { LeanCloudError } from '../services/authService';
import { message } from 'antd';

interface CreateBlogFormProps {
  onCreate: (newBlog: Blog) => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCreate }) => {
  const [content, setContent] = useState('');
  const { user } = useContext(AuthContext);

  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();


  // Handler for content changes in the editable div
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const textContent = e.currentTarget.textContent || '';
    setContent(textContent);
  };


  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any existing messages
    messageApi.info('');
    
    if (!user) {
      messageApi.info('You must be logged in to create a blog.');
      return;
    }

    try {
      // Create the blog
      const newBlog = await createBlog(content);

      // Invoke the callback with the new blog
      onCreate(newBlog);

      // Reset the form
      setContent('');
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }

      // Show success message
      messageApi.success('Blog created successfully.');
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      messageApi.error(leanCloudError.error || 'Failed to create blog.');
    }
  };

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md mr-4">
      {contextHolder}

      <form onSubmit={handleSubmit} className="relative">
        <div
          ref={contentEditableRef}
          contentEditable
          onInput={handleContentChange}
          className="w-full outline rounded-md focus:outline-none min-h-[100px] relative"
        >
          {/* {content === '' && (
            <p className="text-gray-400 m-0 p-2" data-placeholder>
              Type your text here...
            </p>
          )} */}
        </div>


        <button
          type="submit"
          className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Blog
        </button>
      </form>
    </div>
  );
};

export default CreateBlogForm;