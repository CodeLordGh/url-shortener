import React from 'react';
import { Link } from 'react-router-dom';
import { Link as LinkIcon, LogIn, UserPlus, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, username, logout } = useAuth();
  const { isDarkMode } = useSettings();

  return (
    <nav className={`bg-blue-600 text-white p-4 ${isDarkMode ? 'dark:bg-blue-800' : ''}`}>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <LinkIcon className="mr-2" />
          URL Shortener
        </Link>
        <div className="space-x-4 flex items-center">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="flex items-center">
                <User className="mr-1" />
                {username}
              </Link>
              <button onClick={logout} className="flex items-center">
                <LogOut className="mr-1" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center">
                <LogIn className="mr-1" />
                Login
              </Link>
              <Link to="/register" className="flex items-center">
                <UserPlus className="mr-1" />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
