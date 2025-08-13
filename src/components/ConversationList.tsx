import React from 'react';
import { format, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Check, CheckCheck, MessageCircle, Phone, Video } from 'lucide-react';
import { Conversation } from '../types';
import clsx from 'clsx';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (waId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
}) => {
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isThisWeek(date)) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'dd/MM/yyyy');
    }
  };

  const getMessagePreview = (body: string, type: string) => {
    if (type !== 'text') {
      return `📎 ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    }
    return body.length > 40 ? body.substring(0, 40) + '...' : body;
  };

  const getStatusIcon = (status: string, direction: string) => {
    if (direction === 'incoming') return null;
    
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet</p>
          </div>
        </div>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.wa_id}
            onClick={() => onSelectConversation(conversation.wa_id)}
            className={clsx(
              'flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100',
              selectedConversation === conversation.wa_id && 'bg-gray-200'
            )}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm">
                {(conversation.profile_name || conversation.wa_id).charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {conversation.profile_name || conversation.wa_id}
                </h3>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(conversation.lastMessage.status, conversation.lastMessage.direction)}
                  <span className="text-xs text-gray-500">
                    {formatMessageTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 truncate">
                  {getMessagePreview(conversation.lastMessage.body, conversation.lastMessage.type)}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ConversationList;