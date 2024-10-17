import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, ExternalLink, BarChart2, Calendar, Tag, MessageSquare, Loader, Settings } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

interface Url {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  aiDescription: string;
  aiTags: string[];
  createdAt: string;
  expiresAt: string | null;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

interface AIResponse {
  response: string;
  structured?: {
    type: string;
    shortenedLink: string;
    description: string;
    tags: string[];
    advice?: string[]; // Make advice optional
  };
}

const Dashboard: React.FC = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const { token, username } = useAuth();
  const { isDarkMode, isAdvancedMode, toggleAdvancedMode } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [suggestedCommand, setSuggestedCommand] = useState('');
  const [showShortCodeList, setShowShortCodeList] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<Url[]>('http://localhost:3000/user/urls', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const formatAIResponse = (aiResponse: AIResponse): string => {
    if (aiResponse.structured && aiResponse.structured.type === 'new_link') {
      const { shortenedLink, description, tags, advice } = aiResponse.structured;
      return `
        <p><strong>New link added:</strong> <a href="${shortenedLink}" target="_blank" rel="noopener noreferrer">${shortenedLink}</a></p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Tags:</strong> ${tags.join(', ')}</p>
        ${advice && advice.length > 0 ? `
          <p><strong>Advice to increase clicks:</strong></p>
          <ul>
            ${advice.map(item => `<li>${item}</li>`).join('')}
          </ul>
        ` : ''}
      `;
    } else if (aiResponse.structured && aiResponse.structured.type === 'no_links') {
      return `
        <p>${aiResponse.response}</p>
        <p>You don't have any shortened links yet. Use the <code>/add [url]</code> command to create your first link!</p>
      `;
    } else {
      return aiResponse.response.replace(/\n/g, '<br>');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', content: inputMessage };
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputMessage('');
    setIsAiThinking(true);

    try {
      const response = await axios.post<AIResponse>(
        'http://localhost:3000/api/ai/chat',
        { message: inputMessage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const formattedResponse = formatAIResponse(response.data);
      const newAiMessage: ChatMessage = { role: 'ai', content: formattedResponse };
      setChatMessages(prevMessages => [...prevMessages, newAiMessage]);

      // Fetch URLs after any command action
      if (inputMessage.startsWith('/delete') || inputMessage.startsWith('/add') || inputMessage.startsWith('/startscrap')) {
        await fetchUrls();
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        if (axiosError.response?.status === 404) {
          errorMessage = 'The AI chat service is currently unavailable. Please try again later.';
        } else if (axiosError.response?.status === 401) {
          errorMessage = 'You are not authorized to use this service. Please log in again.';
        }
      }
      
      const aiErrorMessage: ChatMessage = { 
        role: 'ai', 
        content: errorMessage
      };
      setChatMessages(prevMessages => [...prevMessages, aiErrorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Suggest commands
    if (value.startsWith('/')) {
      if (value.startsWith('/delete')) {
        setSuggestedCommand('/delete [shortCode]');
        setShowShortCodeList(true);
      } else if (value.startsWith('/add')) {
        setSuggestedCommand('/add [url]');
        setShowShortCodeList(false);
      } else if (value.startsWith('/list')) {
        setSuggestedCommand('/list');
        setShowShortCodeList(false);
      } else if (value.startsWith('/startscrap')) {
        setSuggestedCommand('/startscrap [url]');
        setShowShortCodeList(false);
      } else if (value.startsWith('/stopscrap')) {
        setSuggestedCommand('/stopscrap');
        setShowShortCodeList(false);
      } else {
        setSuggestedCommand('');
        setShowShortCodeList(false);
      }
    } else {
      setSuggestedCommand('');
      setShowShortCodeList(false);
    }
  };

  const handleShortCodeClick = (shortCode: string) => {
    const command = inputMessage.split(' ')[0];
    setInputMessage(`${command} ${shortCode}`);
    setShowShortCodeList(false);
  };

  const UrlGrid: React.FC<{ urls: Url[] }> = React.memo(({ urls }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {urls.map((url) => (
          <motion.div
            key={url._id}
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
                Short URL: <a href={`http://localhost:3000/${url.shortCode}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">{`localhost:3000/${url.shortCode}`}</a>
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
        ))}
      </AnimatePresence>
    </div>
  ));

  const memoizedUrlGrid = useMemo(() => {
    return <UrlGrid urls={urls} />;
  }, [urls]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`container mx-auto mt-10 p-4 ${isDarkMode ? 'dark' : ''}`}
    >
      <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">Welcome, {username}!</h1>
      
      {/* AI Chat Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-xl font-semibold flex items-center">
            <MessageSquare className="mr-2" />
            AI Assistant
          </h2>
        </div>
        <div className="p-4">
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto mb-4 border border-gray-200 rounded p-2"
          >
            {chatMessages.map((msg, index) => (
              <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span 
                  className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              </div>
            ))}
            {isAiThinking && (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" />
                <span>AI is thinking...</span>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-grow border border-gray-300 rounded-t p-2"
              placeholder="Ask about your links or use commands (/add, /delete, /list, /startscrap, /stopscrap)"
              disabled={isAiThinking}
            />
            {suggestedCommand && (
              <div className="bg-gray-100 p-2 text-sm text-gray-600">
                Suggested: {suggestedCommand}
              </div>
            )}
            {showShortCodeList && (
              <div className="bg-gray-100 p-2 max-h-32 overflow-y-auto">
                <p className="text-sm font-semibold mb-1">Available short codes:</p>
                {urls.map((url) => (
                  <button
                    key={url.shortCode}
                    onClick={() => handleShortCodeClick(url.shortCode)}
                    className="text-sm text-blue-600 hover:underline mr-2"
                  >
                    {url.shortCode}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-b disabled:bg-blue-300"
              disabled={isAiThinking}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Command Help Section */}
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

      {/* Existing URLs grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin mr-2" />
          <span className="dark:text-white">Loading URLs...</span>
        </div>
      ) : (
        memoizedUrlGrid
      )}

      <button
        onClick={toggleAdvancedMode}
        className="fixed bottom-16 right-4 p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-lg"
        data-tooltip-id="advancedModeTooltip"
        data-tooltip-content={isAdvancedMode ? "Disable Advanced Mode" : "Enable Advanced Mode"}
      >
        <Settings className={isAdvancedMode ? "text-blue-500" : "text-gray-600 dark:text-gray-400"} />
      </button>
      <Tooltip id="advancedModeTooltip" />
    </motion.div>
  );
};

export default Dashboard;