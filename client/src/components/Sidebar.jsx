import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, LogOut, BrainCircuit } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, end: true },
    { name: 'Upload PDF', path: '/dashboard/upload', icon: <Upload className="w-5 h-5" /> },
    { name: 'My Documents', path: '/dashboard/documents', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border h-full flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center space-x-2">
        <BrainCircuit className="w-8 h-8 text-primary-500" />
        <span className="text-2xl font-bold text-gray-800 dark:text-white">StudyMate</span>
      </div>

      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' 
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-dark-border">
        <div className="flex items-center space-x-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{user?.name}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
