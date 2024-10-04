// ./src/components/Sidebar.tsx
import React, { useContext } from 'react';
import { Tooltip, Dropdown, Menu, Button, Space } from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import Heatmap from './Heatmap';
import { LogoutOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons';
import { Blog, Tag } from '../services/blogService';
import moment from 'moment';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  blogs: Blog[];
  setSelectedTag: (tag: Tag | null) => void;
  tags: Tag[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapse, blogs, setSelectedTag, tags }) => {
  const { user, logout } = useContext(AuthContext);

  const userMenu = (
    <Menu>
      <Menu.Item key="preferences">
        <div>
          账号偏好
          <div style={{ fontSize: '12px', color: '#999' }}>语言/偏好/存储/导出</div>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="vip-center">会员中心</Menu.Item>
      <Menu.Item key="record-statistics">记录统计</Menu.Item>
      <Menu.Item key="message-statistics">消息统计</Menu.Item>
      <Menu.Item key="help">帮助教程</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={logout}>
        <LogoutOutlined />
        <span>退出</span>
      </Menu.Item>
    </Menu>
  );

  const tagCounts = React.useMemo(() => {
    const counts: { [tagId: string]: number } = {};
    blogs.forEach(blog => {
      blog.tags?.forEach(tag => {
        counts[tag.objectId] = (counts[tag.objectId] || 0) + 1;
      });
    });
    return counts;
  }, [blogs]);

  const daysSinceJoined = user ? moment().diff(moment(user.createdAt), 'days') : 0;
  const numberOfBlogs = blogs.length;
  const numberOfTags = tags.length;

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-gray-100 p-6 transition-transform transform ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      } md:static md:translate-x-0 md:flex-shrink-0 overflow-y-auto z-10`}
    >
      {user && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <Dropdown overlay={userMenu} trigger={['click']} className="p-1 hover:bg-blue-200 rounded-md cursor-pointer">
              <Space>
                <p>{user.email}</p>
                <DownOutlined />
              </Space>
            </Dropdown>
            <Tooltip title="隐藏侧边栏">
              <Button
                type="text"
                icon={<MenuFoldOutlined />}
                onClick={onCollapse}
              />
            </Tooltip>
          </div>

          <div className="flex justify-between mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{numberOfBlogs}</div>
              <div className="text-sm text-gray-600">笔记</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{numberOfTags}</div>
              <div className="text-sm text-gray-600">标签</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{daysSinceJoined}</div>
              <div className="text-sm text-gray-600">天</div>
            </div>
          </div>
        </div>
      )}

      {user && (
        <div className="mt-6">
          <Heatmap />
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        <div className="space-y-1">
          {tags.map((tag) => (
            <div
              key={tag.objectId}
              className="flex justify-between items-center p-1 hover:bg-gray-200 cursor-pointer"
              onClick={() => setSelectedTag(tag)}
            >
              <span className="text-gray-700">#{tag.name}</span>
              <span className="text-gray-500 text-sm">{tagCounts[tag.objectId] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);