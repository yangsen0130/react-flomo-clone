import './tiptap.scss';

import React, { useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { createBlog, Blog, addTagToBlog, createTag } from '../services/blogService';
import { LeanCloudError } from '../services/authService';
import { message, Button } from 'antd';
import { EditorContent, useEditor } from '@tiptap/react';
import Mention from '@tiptap/extension-mention';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { TagsContext } from '../contexts/TagsContext';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SuggestionProps } from '@tiptap/suggestion';
import MentionList from './MentionList';
import { Tag } from '../services/blogService';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import {
  BoldOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  HighlightOutlined,
  UnderlineOutlined,
  PlusOutlined,
} from '@ant-design/icons';

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
  const { tags, refreshTags } = useContext(TagsContext); // Added refreshTags
  const tagsRef = useRef<Tag[]>(tags); // Store tags in a ref to ensure they persist

  const [messageApi, contextHolder] = message.useMessage();

  // Ensure the ref gets updated when tags change
  useEffect(() => {
    tagsRef.current = tags;
  }, [tags]);

  const suggestion = {
    char: '#',

    items: ({ query }: { query: string }): string[] => {
      const availableTags = tagsRef.current;
      if (!availableTags || availableTags.length === 0) return [query];

      // Filter existing tags based on the query
      const matchingTags = availableTags
        .map((tag) => tag.name)
        .filter((name) => name.toLowerCase().startsWith(query.toLowerCase()));

      // If no matching tags, include the query as a potential new tag
      if (matchingTags.length === 0 || !matchingTags.includes(query)) {
        return [...matchingTags, query]; // Add the user's input as the last suggestion
      }

      return matchingTags;
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
    },
  };

  const editor = useEditor({
    extensions: [
      Bold,
      Underline,
      StarterKit,
      Highlight,
      Typography,
      BulletList,
      OrderedList,
      ListItem,
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
      // Extract tags from content
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const mentionElements = doc.querySelectorAll('.mention');
      const tagNamesSet = new Set<string>();
      mentionElements.forEach((el) => {
        tagNamesSet.add(el.textContent?.replace(/^#/, '') || '');
      });

      const tagNames = Array.from(tagNamesSet).filter((name) => name.trim() !== '');

      // Create the blog
      const newBlog = await createBlog(content);

      // Handle tags
      for (const tagName of tagNames) {
        let tag = tagsRef.current.find((t) => t.name === tagName);
        if (!tag) {
          // Create new tag
          tag = await createTag(tagName);
          // Refresh tags in context
          refreshTags();
        }
        // Add tag to blog
        await addTagToBlog(newBlog.objectId, tag.objectId);
      }

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

        {/* Toolbar and Submit Button */}
        <div className="mt-2 flex items-center justify-between">
          {/* Toolbar Buttons */}
          <div className="flex space-x-2">
            <Button
              size="small"
              icon={<BoldOutlined />}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              type={editor?.isActive('bold') ? 'primary' : 'default'}
            />
            <Button
              size="small"
              icon={<UnderlineOutlined />}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              type={editor?.isActive('underline') ? 'primary' : 'default'}
            />
            <Button
              size="small"
              icon={<HighlightOutlined />}
              onClick={() => editor?.chain().focus().toggleHighlight().run()}
              type={editor?.isActive('highlight') ? 'primary' : 'default'}
            />
            <Button
              size="small"
              icon={<UnorderedListOutlined />}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              type={editor?.isActive('bulletList') ? 'primary' : 'default'}
            />
            <Button
              size="small"
              icon={<OrderedListOutlined />}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              type={editor?.isActive('orderedList') ? 'primary' : 'default'}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="primary"
            size="small"
            htmlType="submit"
            icon={<PlusOutlined />}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            New
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogForm;