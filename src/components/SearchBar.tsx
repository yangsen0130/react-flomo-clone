// ./src/components/SearchBar.tsx

import React from 'react';
import { Breadcrumb, Tooltip, Button, Input } from 'antd';
import { HomeOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

interface SearchBarProps {
  isSidebarCollapsed: boolean;
  onExpandSidebar: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  isSidebarCollapsed,
  onExpandSidebar,
  searchTerm,
  setSearchTerm,
}) => {
  const { Search } = Input;

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="flex justify-between items-center mx-4 my-8">
      <div className="flex items-center">
        {isSidebarCollapsed && (
          <Tooltip title="Show Sidebar">
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={onExpandSidebar}
              style={{ marginRight: 8 }}
            />
          </Tooltip>
        )}
        <Breadcrumb>
          <Breadcrumb.Item href="">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item onClick={handleClearSearch}>
            <span>全部笔记</span>
          </Breadcrumb.Item>
          {searchTerm && (
            <Breadcrumb.Item>
              <span>搜索</span>
            </Breadcrumb.Item>
          )}
        </Breadcrumb>
      </div>
      <Search
        placeholder="Search blogs"
        value={searchTerm}
        onSearch={handleSearch}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 200 }}
      />
    </div>
  );
};

export default SearchBar;