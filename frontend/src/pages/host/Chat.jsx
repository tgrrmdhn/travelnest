import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, MessageSquare, Loader2 } from 'lucide-react';
import { hostService } from '../../services/host.service';
import { chatService } from '../../services/chat.service';
import socketService from '../../services/socket.service';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const HostChat = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const [message, setMessage] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadConversations();

    // Connect Socket.IO
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  // Setup message listener with proper dependencies
  useEffect(() => {
    // Listen for new messages
    const handleNewMessage = (newMessage) => {
      console.log('📨 New message received:', newMessage);
      console.log('👤 Current user ID:', user?.id);
      console.log('💬 Selected chat:', selectedChat);
      
      if (!selectedChat || !user?.id) {
        console.log('⚠️ No chat selected or user not loaded');
        return;
      }

      const currentConv = conversations.find(c => c.id === selectedChat);
      if (!currentConv) {
        console.log('⚠️ Conversation not found');
        return;
      }

      console.log('📋 Current conversation:', currentConv);
      console.log('👥 Traveler ID:', currentConv.travelerId);
      
      // Check if message belongs to this conversation - use String comparison
      const belongsToConversation = 
        (String(newMessage.sender_id) === String(user.id) && String(newMessage.receiver_id) === String(currentConv.travelerId)) ||
        (String(newMessage.sender_id) === String(currentConv.travelerId) && String(newMessage.receiver_id) === String(user.id));
      
      if (!belongsToConversation) {
        console.log('❌ Message not for this conversation');
        return;
      }

      // Check for duplicates
      setMessages(prev => {
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        
        console.log('✅ Adding message to conversation');
        return [...prev, newMessage];
      });
      
      scrollToBottom();
      loadConversations();
    };

    socketService.onNewMessage(handleNewMessage);

    // Listen for typing
    const handleTyping = ({ userId, typing }) => {
      if (selectedChat) {
        const currentConv = conversations.find(c => c.id === selectedChat);
        if (currentConv && userId === currentConv.travelerId) {
          setTyping(typing);
        }
      }
    };

    socketService.onUserTyping(handleTyping);

    return () => {
      socketService.off('new_message');
      socketService.off('user_typing');
    };
  }, [selectedChat, conversations, user]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await hostService.getConversations();
      
      if (response.success && response.data) {
        // Get unread counts for all conversations
        const unreadResponse = await chatService.getUnreadCount();
        const unreadCounts = unreadResponse?.data?.unreadByUser || {};
        
        const convs = (response.data.conversations || []).map(req => ({
          id: req.id,
          travelerId: req.traveler_id,
          name: req.traveler_name,
          lastMessage: 'Request accepted',
          time: new Date(req.updated_at || req.created_at).toLocaleDateString(),
          unread: unreadCounts[req.traveler_id] || 0,
          request: req
        }));
        setConversations(convs);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      notification.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoadingMessages(true);
      const currentConv = conversations.find(c => c.id === selectedChat);
      if (!currentConv) return;

      const response = await chatService.getConversation(currentConv.travelerId);
      
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        
        // Join Socket.IO room for this conversation
        socketService.joinConversation(currentConv.travelerId);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      notification.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || !selectedChat || sending) return;

    const currentConv = conversations.find(c => c.id === selectedChat);
    if (!currentConv) return;

    try {
      setSending(true);
      const messageText = message.trim();
      setMessage(''); // Clear immediately for better UX

      // Check if socket is connected
      if (!socketService.isConnected()) {
        console.error('Socket not connected, reconnecting...');
        const token = localStorage.getItem('token');
        if (token) {
          socketService.connect(token);
        }
        throw new Error('Socket not connected');
      }

      console.log('Sending message to:', currentConv.travelerId, messageText);

      // Send via Socket.IO
      const result = await socketService.sendMessage(currentConv.travelerId, messageText);
      console.log('Message sent successfully:', result);
      
      // Stop typing indicator
      socketService.stopTyping(currentConv.travelerId);
    } catch (err) {
      console.error('Error sending message:', err);
      notification.error('Failed to send message');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedChat) return;

    const currentConv = conversations.find(c => c.id === selectedChat);
    if (!currentConv) return;

    // Send typing indicator
    socketService.startTyping(currentConv.travelerId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(currentConv.travelerId);
    }, 2000);
  };

  const handleSelectChat = (chatId) => {
    // Leave previous conversation
    if (selectedChat) {
      const prevConv = conversations.find(c => c.id === selectedChat);
      if (prevConv) {
        socketService.leaveConversation(prevConv.travelerId);
      }
    }

    setSelectedChat(chatId);
    setTyping(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat dengan Traveler</h1>
          <p className="text-gray-600 mt-1">Komunikasi dengan traveler Anda</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state when no conversations
  if (conversations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chat dengan Traveler</h1>
          <p className="text-gray-600 mt-1">Komunikasi dengan traveler Anda</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center max-w-md mx-auto">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Conversations Yet</h3>
            <p className="text-gray-600">
              Chat akan tersedia setelah Anda menerima request dari traveler. 
              Accept request terlebih dahulu untuk memulai komunikasi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat dengan Traveler</h1>
        <p className="text-gray-600 mt-1">Komunikasi dengan traveler Anda</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 h-[600px]">
          <div className="col-span-12 md:col-span-4 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectChat(conv.id)}
                  className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 text-left ${
                    selectedChat === conv.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-gray-900">{conv.name}</p>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-8 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {conversations.find(c => c.id === selectedChat)?.name || 'Traveler'}
                    </h3>
                    <p className="text-sm text-gray-600">Accepted request</p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        // Use String comparison to handle type differences
                        const isMe = String(msg.sender_id) === String(user?.id);
                        
                        // Debug: log the comparison result
                        console.log(`🔍 [${msg.message.substring(0, 20)}...] sender_id=${msg.sender_id} vs user.id=${user?.id} => isMe=${isMe}`);
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                isMe
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="text-sm break-words">{msg.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isMe ? 'text-blue-100' : 'text-gray-600'
                                }`}
                              >
                                {new Date(msg.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                  
                  {typing && (
                    <div className="flex justify-start mt-4">
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {sending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostChat;
