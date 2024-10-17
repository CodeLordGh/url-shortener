import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useSettings();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed bottom-4 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-lg transition-colors duration-200"
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-600" />}
    </button>
  );
};

export default ThemeToggle;