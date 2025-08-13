 import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Download, Play } from 'lucide-react';
import { Message } from '../types';
import clsx from 'clsx';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /** Return correct tick icon for given status */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-gray-300" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-300" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  /** Render supported media message types */
  const renderMediaMessage = (message: Message) => {
    const { type, body } = message;
    switch (type) {
      case 'image':
        return (
          <div className="relative">
            <div className="w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">📷 Image</span>
            </div>
            {body && <p className="mt-2">{body}</p>}
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg max-w-xs">
            <Download className="w-5 h-5 text-gray-500" />
            <span className="text-sm">📄 Document</span>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg max-w-xs">
            <Play className="w-5 h-5 text-gray-500" />
            <span className="text-sm">🎵 Audio</span>
          </div>
        );
      case 'video':
        return (
          <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg max-w-xs">
            <Play className="w-5 h-5 text-gray-500" />
            <span className="text-sm">🎥 Video</span>
          </div>
        );
      default:
        return <p>{body}</p>;
    }
  };

  /** Loading indicator */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>No messages yet. Start a conversation!</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                'mb-4 flex',
                message.direction === 'outgoing' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  'max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm',
                  message.direction === 'outgoing'
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-900'
                )}
              >
                {renderMediaMessage(message)}

                {/* Time + Status Ticks */}
                <div className="flex items-end justify-between mt-2 space-x-2">
                  <span className="text-xs opacity-70">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>

                  {message.direction === 'outgoing' && (
                    <div className="flex-shrink-0">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;
