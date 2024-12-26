import React from 'react';

export const CommandHelp: React.FC = () => {
  return (
    <div className="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">Available Commands</h2>
      </div>
      <div className="p-4">
        <ul className="list-disc list-inside">
          <li><code>/add [url]</code> - Add a new link</li>
          <li><code>/delete [shortCode]</code> - Delete a link</li>
          <li><code>/list</code> - List all your links</li>
          <li><code>/startscrap [url]</code> - Start scraping a webpage</li>
          <li><code>/stopscrap</code> - Stop the current scraping session</li>
        </ul>
      </div>
    </div>
  );
};
