import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import { Message, Conversation } from './types';
import { messageAPI, conversationAPI } from './services/api';
import { useSocket } from './hooks/useSocket';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Socket event handlers
  const handleNewMessage = useCallback((message: Message) => {
    if (message.wa_id === selectedConversation) {
      setMessages(prev => [...prev, message]);
    }
    // Update conversations list
    loadConversations();
  }, [selectedConversation]);

  const handleMessageStatusUpdate = useCallback((data: { id: string; status: string }) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === data.id ? { ...msg, status: data.status as any } : msg
      )
    );
  }, []);

  const handleConversationUpdate = useCallback((data: { wa_id: string; lastMessage: Message }) => {
    loadConversations();
  }, []);

  const { joinConversation, leaveConversation } = useSocket({
    onNewMessage: handleNewMessage,
    onMessageStatusUpdate: handleMessageStatusUpdate,
    onConversationUpdate: handleConversationUpdate,
  });

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const data = await conversationAPI.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  // Load messages for selected conversation
  const loadMessages = useCallback(async (waId: string) => {
    if (!waId) return;
    
    setIsLoading(true);
    try {
      const data = await messageAPI.getMessages(waId);
      setMessages(data.messages);
      
      // Mark conversation as read
      await conversationAPI.markAsRead(waId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle conversation selection
  const handleSelectConversation = (waId: string) => {
    if (selectedConversation) {
      leaveConversation(selectedConversation);
    }
    
    setSelectedConversation(waId);
    joinConversation(waId);
    loadMessages(waId);
    
    // On mobile, hide sidebar when conversation is selected
    if (window.innerWidth < 1024) {
      setIsMobile(true);
    }
  };

  // Handle sending messages
  const handleSendMessage = async (messageText: string) => {
    if (!selectedConversation) return;
    
    try {
      const newMessage = await messageAPI.sendMessage(selectedConversation, messageText);
      setMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle mobile responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial load
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const selectedConversationData = conversations.find(c => c.wa_id === selectedConversation);

  // Mobile view logic
  const showSidebar = !isMobile || !selectedConversation;
  const showChat = !isMobile || selectedConversation;

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar */}
      {showSidebar && (
        <div className={`${isMobile ? 'w-full' : 'w-80'} h-full`}>
          <Sidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      )}

      {/* Chat Area */}
      {showChat && (
        <div className="flex-1 h-full flex flex-col bg-white">
          {selectedConversation && selectedConversationData ? (
            <>
              {/* Mobile back button */}
              {isMobile && (
                <div className="p-2 border-b bg-gray-50">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to chats
                  </button>
                </div>
              )}
              
              <ChatHeader
                profileName={selectedConversationData.profile_name || selectedConversationData.wa_id}
                waId={selectedConversationData.wa_id}
              />
              
              <MessageList messages={messages} isLoading={isLoading} />
              
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="w-24 h-24 mx-auto mb-4 opacity-20" />
                <h2 className="text-2xl font-light mb-2">WhatsApp Web</h2>
                <p className="max-w-sm mx-auto">
                  Send and receive messages without keeping your phone online.
                </p>
                <p className="mt-4 text-sm">
                  Select a conversation to start messaging.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;