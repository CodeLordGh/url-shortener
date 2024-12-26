import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader, Settings } from 'lucide-react';
import { Tooltip } from 'react-tooltip';
import { API_BASE_URL } from '../config';
import { Url, ChatMessage, AIResponse } from '../types/url';
import { UrlGrid } from '../features/urls/UrlGrid';
import { AiChat } from '../features/chat/AiChat';
import { CommandHelp } from '../features/commands/CommandHelp';

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

  const fetchUrls = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Fetching URLs with token:', token);
      const response = await axios.get<Url[]>(`${API_BASE_URL}/api/user/urls`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Received URLs:', response.data);
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      console.log('Token available, fetching URLs');
      fetchUrls();
    } else {
      console.log('No token available, skipping URL fetch');
    }
  }, [fetchUrls, token]);

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
        `${API_BASE_URL}/api/ai/chat`,
        { message: inputMessage },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      const formattedResponse = formatAIResponse(response.data);
      const newAiMessage: ChatMessage = { role: 'ai', content: formattedResponse };
      setChatMessages(prevMessages => [...prevMessages, newAiMessage]);

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
      
      <AiChat
        chatMessages={chatMessages}
        inputMessage={inputMessage}
        isAiThinking={isAiThinking}
        suggestedCommand={suggestedCommand}
        showShortCodeList={showShortCodeList}
        urls={urls}
        onInputChange={handleInputChange}
        onSendMessage={handleSendMessage}
        onShortCodeClick={handleShortCodeClick}
      />

      <CommandHelp />

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
