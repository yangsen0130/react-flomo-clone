// ./src/components/DisplayBlog.tsx

import React from 'react';
import { Blog } from '../services/blogService';
import { Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

interface DisplayBlogProps {
  blog: Blog;
  onEdit: () => void;
  onDelete: () => void;
}

const DisplayBlog: React.FC<DisplayBlogProps> = ({ blog, onEdit, onDelete }) => {
  const menu = (
    <Menu>
      <Menu.Item key="edit" onClick={onEdit}>
        Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={onDelete}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="p-4 bg-white rounded shadow relative">
      {/* Three-dot menu */}
      <div className="absolute top-2 right-2">
        <Dropdown overlay={menu} trigger={['click']}>
          <MoreOutlined style={{ fontSize: '20px' }} />
        </Dropdown>
      </div>
      <div className="text-gray-700">{blog.content}</div>
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
    </div>
  );
};

export default DisplayBlog;