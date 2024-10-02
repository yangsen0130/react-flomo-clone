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
// import suggestion from './editor/suggestion';
import { TagsContext } from '../contexts/TagsContext';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SuggestionProps } from '@tiptap/suggestion';
import MentionList from './MentionList';
import { Tag } from '../services/blogService';

interface CreateBlogFormProps {
  onCreate: (newBlog: Blog) => void;
}

interface SuggestionResult {
  onStart: (props: SuggestionProps) => void;
  onUpdate: (props: SuggestionProps) => void;
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
  onExit: () => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCreate }) => {
  const { user } = useContext(AuthContext);
  const { tags } = useContext(TagsContext);
  const [messageApi, contextHolder] = message.useMessage();


  const suggestion =  {
    items: ({ query }: { query: string }): string[] => {
      return tags
        .map((tag) => tag.name)
        .filter((name) => name.toLowerCase().startsWith(query.toLowerCase()))
        .slice(0, 5);
    },

    render: (): SuggestionResult => {
      let component: ReactRenderer;
      let popup: TippyInstance[];

      return {
        onStart: (props: SuggestionProps) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as any,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props: SuggestionProps) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect as any,
          });
        },

        onKeyDown(props: { event: KeyboardEvent }) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return (component.ref as any)?.onKeyDown(props) || false;
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    }
  };
  
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: suggestion, // Pass tags to the suggestion function
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