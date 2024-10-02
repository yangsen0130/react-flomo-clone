import React, { useContext } from 'react';
import { Tooltip, Dropdown, Menu, Button, Space} from 'antd';
import { AuthContext } from '../contexts/AuthContext';
import { TagsContext } from '../contexts/TagsContext';
import Heatmap from './Heatmap';
import { LogoutOutlined, MenuFoldOutlined, DownOutlined} from '@ant-design/icons';

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onCollapse }) => {
  const { user, logout } = useContext(AuthContext);
  const { tags } = useContext(TagsContext);

  // User dropdown menu
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

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 bg-gray-100 p-6 transition-transform transform ${
        isCollapsed ? '-translate-x-full' : 'translate-x-0'
      } md:static md:translate-x-0 md:flex-shrink-0 overflow-y-auto z-10`}
    >
      {/* User Information at the Top */}
      {user && (
        <div className="mb-6 flex items-center justify-between">
          <Dropdown overlay={userMenu} trigger={['click']}  className="p-1 hover:bg-blue-200 rounded-md cursor-pointer">
            {/* <div className="p-4 bg-blue-200 rounded-md cursor-pointer">
            </div> */}
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
      )}

      {/* Heatmap Component */}
      {user && (
        <div className="mt-6">
          <Heatmap />
        </div>
      )}

      {/* Display all tags */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Tags</h2>
        <div className="space-y-1">
          {tags.map((tag) => (
            <div key={tag.objectId}>
              <span className="text-gray-700">#{tag.name}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;