// ./src/components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaBlog, FaUser, FaCog, FaBars, FaTimes } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

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
        className={`fixed top-0 left-0 h-full w-64 bg-gray-100 p-6 transition-transform transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:flex-shrink-0`}
      >
        <h2 className="text-2xl font-semibold mb-6">Dashboard Menu</h2>
        <nav className="space-y-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center text-lg ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-500'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaHome className="mr-2" />
            Home
          </NavLink>
          <NavLink
            to="/dashboard/blogs"
            className={({ isActive }) =>
              `flex items-center text-lg ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-500'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaBlog className="mr-2" />
            My Blogs
          </NavLink>
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center text-lg ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-500'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaUser className="mr-2" />
            Profile
          </NavLink>
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center text-lg ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-700 hover:text-blue-500'
              }`
            }
            onClick={() => setIsOpen(false)}
          >
            <FaCog className="mr-2" />
            Settings
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;