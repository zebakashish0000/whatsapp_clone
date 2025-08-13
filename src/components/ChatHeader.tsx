import React from 'react';
import { MoreVertical, Phone, Video, Search } from 'lucide-react';

interface ChatHeaderProps {
  profileName: string;
  waId: string;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ profileName, waId, isOnline = false }) => {
  return (
    <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {profileName.charAt(0).toUpperCase()}
            </span>
          </div>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div>
          <h2 className="font-semibold text-gray-900">{profileName}</h2>
          <p className="text-sm text-gray-500">{waId}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;