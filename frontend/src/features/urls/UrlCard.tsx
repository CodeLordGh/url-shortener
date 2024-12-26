import React from 'react';
import { motion } from 'framer-motion';
import { Link, ExternalLink, BarChart2, Calendar, Tag } from 'lucide-react';
import { Url } from '../../types/url';
import { API_BASE_URL } from '../../config';

interface UrlCardProps {
  url: Url;
}

export const UrlCard: React.FC<UrlCardProps> = ({ url }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white shadow-lg rounded-lg overflow-hidden"
    >
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold truncate">{url.originalUrl}</h2>
      </div>
      <div className="p-4">
        <p className="text-gray-600 mb-2 flex items-center">
          <Link className="mr-2" />
          Short URL: <a href={`${API_BASE_URL}/${url.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">{`${new URL(API_BASE_URL).host}/${url.shortCode}`}</a>
        </p>
        <p className="text-gray-600 mb-2 flex items-center">
          <BarChart2 className="mr-2" />
          Clicks: {url.clicks}
        </p>
        <p className="text-gray-600 mb-2 flex items-center">
          <Calendar className="mr-2" />
          Created: {new Date(url.createdAt).toLocaleDateString()}
        </p>
        {url.expiresAt && (
          <p className="text-gray-600 mb-2 flex items-center">
            <Calendar className="mr-2" />
            Expires: {new Date(url.expiresAt).toLocaleDateString()}
          </p>
        )}
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Tag className="mr-2" />
            AI Description:
          </h3>
          <p className="text-gray-700">{url.aiDescription}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">AI Tags:</h3>
          <div className="flex flex-wrap">
            {url.aiTags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-2.5 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        </div>
        <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-blue-600 hover:underline">
          Visit Original URL
          <ExternalLink className="ml-1" size={16} />
        </a>
      </div>
    </motion.div>
  );
};
