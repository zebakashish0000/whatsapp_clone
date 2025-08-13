import React from 'react';
import { Search, MessageCircle, MoreVertical, Archive } from 'lucide-react';
import ConversationList from './ConversationList';
import { Conversation } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onSelectConversation: (waId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  onSearchChange,
}) => {
  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.profile_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.wa_id.includes(searchTerm)
  );

  return (
    <div className="w-full lg:w-80 h-full bg-white border-r flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gray-100 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Chats</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-2 border-b">
        <button className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-100 rounded-lg transition-colors">
          <Archive className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-700">Archived</span>
        </button>
      </div>

      {/* Conversations */}
      <ConversationList
        conversations={filteredConversations}
        selectedConversation={selectedConversation}
        onSelectConversation={onSelectConversation}
      />
    </div>
  );
};

export default Sidebar;