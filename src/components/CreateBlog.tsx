// ./src/components/CreateBlogForm.tsx
import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { TagsContext } from '../contexts/TagsContext';
import { createBlog, Blog, createTag, addTagToBlog, Tag } from '../services/blogService';
import { LeanCloudError } from '../services/authService';
import { message } from 'antd';

interface CreateBlogFormProps {
  onCreate: (newBlog: Blog) => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCreate }) => {
  const [content, setContent] = useState('');
  const { user } = useContext(AuthContext);
  const { tags, refreshTags } = useContext(TagsContext);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setFilteredTags(tags);
  }, [tags]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const textContent = e.currentTarget.textContent || '';
    setContent(textContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '#') {
      setShowTagSuggestions(true);
      setTagSearchTerm('');
      setFilteredTags(tags);
    } else if (showTagSuggestions) {
      if (e.key === 'Backspace') {
        setTagSearchTerm((prev) => prev.slice(0, -1));
        setFilteredTags(
          tags.filter((tag) => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()))
        );
      } else if (e.key.length === 1) {
        setTagSearchTerm((prev) => prev + e.key);
        setFilteredTags(
          tags.filter((tag) => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase()))
        );
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        // Handle navigation in suggestions if needed
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Handle select tag
        if (filteredTags.length > 0) {
          insertTag(filteredTags[0].name);
        } else {
          insertTag(tagSearchTerm);
        }
      } else if (e.key === 'Escape') {
        setShowTagSuggestions(false);
      }
    }
  };

  const insertTag = (tagName: string) => {
    const contentEditable = contentEditableRef.current;
    if (!contentEditable) return;
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    // Remove the '#' and any typed characters
    range.setStart(range.startContainer, range.startOffset - tagSearchTerm.length - 1);
    range.deleteContents();

    const textNode = document.createTextNode(`#${tagName} `);
    range.insertNode(textNode);

    // Move the cursor after the inserted tag
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    setShowTagSuggestions(false);
    setTagSearchTerm('');
    setFilteredTags(tags);

    // Update content
    setContent(contentEditable.textContent || '');
  };

  const handleSuggestionClick = (tagName: string) => {
    insertTag(tagName);
    setShowTagSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    messageApi.info('');
    if (!user) {
      messageApi.info('You must be logged in to create a blog.');
      return;
    }
    try {
      // Extract tags from content
      const tagsInContent = Array.from(
        new Set(
          (content.match(/#(\w+)/g) || []).map((tag) => tag.substring(1))
        )
      );

      // Create the blog
      const newBlog = await createBlog(content);

      // For each tag, check if it exists, create if not, then associate with blog
      for (const tagName of tagsInContent) {
        let tag = tags.find((t) => t.name === tagName);
        if (!tag) {
          // Create new tag
          tag = await createTag(tagName);
          // Refresh tags in context
          refreshTags();
        }
        // Associate tag with blog
        await addTagToBlog(newBlog.objectId, tag.objectId);
      }

      onCreate(newBlog);
      setContent('');
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }
      messageApi.info('Blog created successfully.');
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      messageApi.info(leanCloudError.error || 'Failed to create blog.');
    }
  };
  
  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-md mr-4">
      <form onSubmit={handleSubmit} className="relative">
        <div
          ref={contentEditableRef}
          contentEditable
          onInput={handleContentChange}
          onKeyDown={handleKeyDown}
          className="w-full outline rounded-md focus:outline-none min-h-[100px]"
        >
            <p className="text-gray-400 m-0 p-2" data-placeholder>Type your text here...</p>
        </div>
        {showTagSuggestions && (
          <div className="absolute z-10 bg-white border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
            {filteredTags.map((tag) => (
              <div
                key={tag.objectId}
                className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                onMouseDown={() => handleSuggestionClick(tag.name)}
              >
                {tag.name}
              </div>
            ))}
            {filteredTags.length === 0 && tagSearchTerm && (
              <div
                className="px-4 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                onMouseDown={() => insertTag(tagSearchTerm)}
              >
                Create new tag "{tagSearchTerm}"
              </div>
            )}
          </div>
        )}
        <button
          type="submit"
          className="w-full mt-2 bg-white text-blue-600 py-2 rounded-md hover:bg-gray-100 transition"
        >
          Create Blog
        </button>
      </form>
    </div>
  );
};

export default CreateBlogForm;