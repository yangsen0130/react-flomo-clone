import React, { useRef, useEffect, useContext } from 'react';
import { Blog } from '../services/blogService';
import { message, Button } from 'antd';
import { EditorContent, useEditor } from '@tiptap/react';
import Mention from '@tiptap/extension-mention';
import Bold from '@tiptap/extension-bold';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { SuggestionProps } from '@tiptap/suggestion';
import MentionList from './MentionList';
import './tiptap.scss';
import { AuthContext } from '../contexts/AuthContext';
import { TagsContext } from '../contexts/TagsContext';
import { LeanCloudError } from '../services/authService';
import { addTagToBlog, removeTagFromBlog, createTag } from '../services/blogService';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import {
  BoldOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  HighlightOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';

interface EditBlogProps {
  blog: Blog;
  onSave: (blogId: string, content: string) => void;
  onCancel: () => void;
}

interface SuggestionResult {
  onStart: (props: SuggestionProps) => void;
  onUpdate: (props: SuggestionProps) => void;
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
  onExit: () => void;
}

const EditBlog: React.FC<EditBlogProps> = ({ blog, onSave, onCancel }) => {
  const { user } = useContext(AuthContext);
  const { tags, refreshTags } = useContext(TagsContext);
  const tagsRef = useRef(tags);

  const [messageApi, contextHolder] = message.useMessage();

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
        suggestion: suggestion,
      }),
    ],
    content: blog.content,
  });

  const handleSave = async () => {
    if (!editor) {
      messageApi.error('Editor not initialized');
      return;
    }
    const content = editor.getHTML();

    try {
      // Extract tags from new content
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const mentionElements = doc.querySelectorAll('.mention');
      const tagNamesSet = new Set<string>();
      mentionElements.forEach((el) => {
        tagNamesSet.add(el.textContent?.replace(/^#/, '') || '');
      });
      const newTagNames = Array.from(tagNamesSet).filter((name) => name.trim() !== '');

      // Get existing tag names for the blog
      const existingTagNames = blog.tags ? blog.tags.map((tag) => tag.name) : [];

      // Determine tags to add and remove
      const tagsToAdd = newTagNames.filter((name) => !existingTagNames.includes(name));
      const tagsToRemove = existingTagNames.filter((name) => !newTagNames.includes(name));

      // Update tags
      for (const tagName of tagsToAdd) {
        let tag = tagsRef.current.find((t) => t.name === tagName);
        if (!tag) {
          // Create new tag
          tag = await createTag(tagName);
          // Refresh tags in context
          refreshTags();
        }
        // Add tag to blog
        await addTagToBlog(blog.objectId, tag.objectId);
      }

      for (const tagName of tagsToRemove) {
        const tag = tagsRef.current.find((t) => t.name === tagName);
        if (tag) {
          // Remove tag from blog
          await removeTagFromBlog(blog.objectId, tag.objectId);
        }
      }

      // Save the edited content
      onSave(blog.objectId, content);
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      messageApi.error(leanCloudError.error || 'Failed to update blog.');
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow relative">
      {contextHolder}
      <EditorContent editor={editor} />
      {/* Toolbar and Buttons */}
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

        {/* Cancel and Save Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={onCancel}
            size="small"
            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600 transition"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="small"
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;