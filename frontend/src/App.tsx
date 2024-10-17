import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useSettings();

  return (
    <Router>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 transition-colors duration-200`}>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
          </Routes>
        </AnimatePresence>
        <ThemeToggle />
      </div>
    </Router>
  );
}

function AppWrapper() {
  return (
    <SettingsProvider>
      <App />
    </SettingsProvider>
  );
}

export default AppWrapper;
