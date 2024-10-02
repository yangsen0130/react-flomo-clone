import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { createBlog, Blog } from '../services/blogService';
import { LeanCloudError } from '../services/authService';
import { message } from 'antd';
import { EditorContent, useEditor } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Mention from '@tiptap/extension-mention';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import suggestion from './editor/suggestion';
import { TagsContext } from '../contexts/TagsContext';

interface CreateBlogFormProps {
  onCreate: (newBlog: Blog) => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCreate }) => {
  const { user } = useContext(AuthContext);
  const { tags } = useContext(TagsContext);
  const [messageApi, contextHolder] = message.useMessage();

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: suggestion(tags), // Pass tags to the suggestion function
      }),
    ],
    content: '',
  });

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clear any existing messages
    messageApi.info('');

    if (!user) {
      messageApi.info('You must be logged in to create a blog.');
      return;
    }

    if (!editor) {
      messageApi.error('Editor not initialized');
      return;
    }

    const content = editor.getHTML();

    try {
      // Create the blog
      const newBlog = await createBlog(content);

      // Invoke the callback with the new blog
      onCreate(newBlog);

      // Reset the editor content
      editor.commands.clearContent();

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
        <EditorContent editor={editor} />

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