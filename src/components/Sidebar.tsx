// ./src/components/Sidebar.tsx
import React, { useState, useContext } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import { TagsContext } from '../contexts/TagsContext';
import Heatmap from './Heatmap'; // Import the Heatmap component

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { tags } = useContext(TagsContext);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Hamburger Menu for Mobile */}
      <button
        className="md:hidden absolute top-4 left-4 z-20 text-2xl text-gray-700"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-gray-100 p-6 transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:flex-shrink-0 overflow-y-auto`}
      >
        {/* User Information at the Top */}
        {user && (
          <div className="mb-6 p-4 bg-blue-200 rounded-md">
            <p>{user.email}</p>
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
    </>
  );
};

export default Sidebar;