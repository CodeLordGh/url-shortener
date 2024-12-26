import React, { useRef, useEffect } from 'react';
import { Loader, MessageSquare } from 'lucide-react';
import { ChatMessage } from '../../types/url';

interface AiChatProps {
  chatMessages: ChatMessage[];
  inputMessage: string;
  isAiThinking: boolean;
  suggestedCommand: string;
  showShortCodeList: boolean;
  urls: Array<{ shortCode: string }>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onShortCodeClick: (shortCode: string) => void;
}

export const AiChat: React.FC<AiChatProps> = ({
  chatMessages,
  inputMessage,
  isAiThinking,
  suggestedCommand,
  showShortCodeList,
  urls,
  onInputChange,
  onSendMessage,
  onShortCodeClick,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
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
            onChange={onInputChange}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
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
                  onClick={() => onShortCodeClick(url.shortCode)}
                  className="text-sm text-blue-600 hover:underline mr-2"
                >
                  {url.shortCode}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={onSendMessage}
            className="bg-blue-600 text-white px-4 py-2 rounded-b disabled:bg-blue-300"
            disabled={isAiThinking}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
