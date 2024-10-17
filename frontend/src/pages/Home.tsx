import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link2, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { API_BASE_URL } from '../config';

const Home = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, token } = useAuth();
  const { isDarkMode } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post<{ shortUrl: string; expiresAt: string | null }>(
        `${API_BASE_URL}/shorten`,
        { url },
        {
          headers: isAuthenticated ? { Authorization: `Bearer ${token}` } : {}
        }
      );
      setShortUrl(response.data.shortUrl);
      setExpiresAt(response.data.expiresAt ? new Date(response.data.expiresAt) : null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while shortening the URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`container mx-auto mt-10 p-4 ${isDarkMode ? 'dark' : ''}`}
    >
      <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">Shorten Your URL</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex items-center border-b border-blue-500 py-2">
          <Link2 className="text-blue-500 mr-2" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter your URL"
            className="appearance-none bg-transparent border-none w-full text-gray-700 dark:text-gray-300 mr-3 py-1 px-2 leading-tight focus:outline-none"
            required
          />
          <motion.button
            type="submit"
            className="flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin mr-2" size={16} /> : null}
            Shorten
          </motion.button>
        </div>
      </form>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-center mt-4"
        >
          {error}
        </motion.p>
      )}
      {shortUrl && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <p className="text-xl mb-2">Your shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
            data-tooltip-id="copy-tooltip"
            data-tooltip-content="Click to copy"
            onClick={(e) => {
              e.preventDefault();
              navigator.clipboard.writeText(shortUrl);
            }}
          >
            {shortUrl}
          </a>
          <Tooltip id="copy-tooltip" />
          {expiresAt && (
            <p className="text-sm text-gray-600 mt-2">
              This link will expire on {expiresAt.toLocaleDateString()}
            </p>
          )}
          {!isAuthenticated && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-yellow-100 rounded-lg"
            >
              <p className="text-sm text-yellow-800">
                To keep your shortened URLs permanently and access more features, please{' '}
                <Link to="/login" className="text-blue-500 hover:underline">login</Link> or{' '}
                <Link to="/register" className="text-blue-500 hover:underline">register</Link>.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Home;
