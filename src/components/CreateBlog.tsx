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
  const [showHashtagMenu, setShowHashtagMenu] = useState(false);
  const [hashtagMenuPosition, setHashtagMenuPosition] = useState({ top: 0, left: 0 });
  const [hashtagRange, setHashtagRange] = useState<Range | null>(null);

  // Helper function to determine if a character is visible (non-whitespace)
  const isVisibleCharacter = (char: string) => {
    return /\S/.test(char);
  };

  // Handler for content changes in the editable div
  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const textContent = e.currentTarget.textContent || '';
    setContent(textContent);
  };

  // Handler for key presses in the editable div
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === '#') {
      e.preventDefault();

      const selection = window.getSelection();

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const { startContainer, startOffset } = range;

        let charBefore = '';

        // Check character before the cursor within the same text node
        if (startOffset > 0 && startContainer.textContent) {
          charBefore = startContainer.textContent[startOffset - 1];
        } 
        // If at the start of a text node, check the previous sibling node
        else if (startOffset === 0 && startContainer.previousSibling) {
          const prevSibling = startContainer.previousSibling;
          if (prevSibling && prevSibling.textContent) {
            charBefore = prevSibling.textContent.slice(-1);
          }
        } else {
          charBefore = ''; // At the start of content, assume charBefore is empty (whitespace)
        }

        if (!isVisibleCharacter(charBefore)) {
          // Insert '#' character
          const textNode = document.createTextNode('#');
          range.insertNode(textNode);

          // Move the selection after the inserted '#'
          range.setStartAfter(textNode);
          range.collapse(true);

          selection.removeAllRanges();
          selection.addRange(range);

          // Now, get the position of the inserted '#' character
          const hashRange = document.createRange();
          hashRange.selectNode(textNode);
          const rect = hashRange.getBoundingClientRect();

          const editorRect = contentEditableRef.current?.getBoundingClientRect();

          if (rect && editorRect) {
            const top = rect.bottom - editorRect.top + contentEditableRef.current!.scrollTop;
            const left = rect.left - editorRect.left + contentEditableRef.current!.scrollLeft;

            setHashtagMenuPosition({ top, left });
            setShowHashtagMenu(true);

            // Save the range of the '#' character
            setHashtagRange(hashRange);
          }

          // Update content state
          setContent(contentEditableRef.current?.textContent || '');
        } else {
          messageApi.info('Hashtag must be preceded by a whitespace character.');
        }
      }
    }
  };

  // Handle selection of a hashtag from the menu
  const handleHashtagSelect = (hashtag: string) => {
    if (hashtagRange && contentEditableRef.current) {
      // Replace the '#' character with selected hashtag
      hashtagRange.deleteContents();
      const hashtagNode = document.createTextNode(`#${hashtag} `);
      hashtagRange.insertNode(hashtagNode);

      // Move the caret after the inserted hashtag
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.setStartAfter(hashtagNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Update content state
      setContent(contentEditableRef.current?.textContent || '');

      // Close the hashtag menu
      setShowHashtagMenu(false);

      setHashtagRange(null);
    }
  };

  // Effect to close the hashtag menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentEditableRef.current &&
        !contentEditableRef.current.contains(event.target as Node)
      ) {
        setShowHashtagMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          onKeyDown={handleKeyDown}
          className="w-full outline rounded-md focus:outline-none min-h-[100px] relative"
        >
          {/* {content === '' && (
            <p className="text-gray-400 m-0 p-2" data-placeholder>
              Type your text here...
            </p>
          )} */}
        </div>

        {showHashtagMenu && (
          <div
            style={{
              position: 'absolute',
              top: `${hashtagMenuPosition.top}px`,
              left: `${hashtagMenuPosition.left}px`,
              zIndex: 1000,
            }}
            className="bg-white border border-gray-300 rounded shadow-md p-2"
          >
            <ul>
              <li
                className="cursor-pointer hover:bg-gray-100 p-1"
                onClick={() => handleHashtagSelect('Option 1')}
              >
                Option 1
              </li>
              <li
                className="cursor-pointer hover:bg-gray-100 p-1"
                onClick={() => handleHashtagSelect('Option 2')}
              >
                Option 2
              </li>
              <li
                className="cursor-pointer hover:bg-gray-100 p-1"
                onClick={() => handleHashtagSelect('Option 3')}
              >
                Option 3
              </li>
            </ul>
          </div>
        )}

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