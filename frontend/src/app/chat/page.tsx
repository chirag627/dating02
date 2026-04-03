'use client';

import { useState, useEffect, useRef } from 'react';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { io, Socket } from 'socket.io-client';
import Navbar from '@/components/layout/Navbar';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await chatApi.getConversations() as any;
        setConversations(response.data || []);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };
    fetchConversations();

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(`${socketUrl}/chat`, {
      auth: { token },
    });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('typing', ({ isTyping: typing }: { userId: string; isTyping: boolean }) => {
      setIsTyping(typing);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = async (conv: any) => {
    setSelectedConversation(conv);
    setMessages([]);
    try {
      const response = await chatApi.getConversation(conv._id) as any;
      setMessages(([...(response.data || [])]).reverse());
      // Mark messages as read
      socket?.emit('read', { senderId: conv._id });
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (selectedConversation && socket) {
      socket.emit('typing', { receiverId: selectedConversation._id, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { receiverId: selectedConversation._id, isTyping: false });
      }, 1500);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation || !socket) return;

    socket.emit('send_message', {
      receiverId: selectedConversation._id,
      content: newMessage,
    });

    setMessages((prev) => [
      ...prev,
      {
        senderId: { _id: user?._id },
        content: newMessage,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewMessage('');
    // Stop typing indicator
    socket.emit('typing', { receiverId: selectedConversation._id, isTyping: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex gap-4" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Conversations List */}
        <div className="w-72 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto flex-shrink-0">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">💬 Conversations</h2>
          </div>
          {conversations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => selectConversation(conv.user || conv)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 text-left border-b border-gray-50 transition-colors ${
                  selectedConversation?._id === (conv.user?._id || conv._id) ? 'bg-primary-50' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                  {conv.user?.photos?.[0] ? (
                    <img
                      src={conv.user.photos[0]}
                      alt="avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {conv.user?.firstName} {conv.user?.lastName}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {conv.lastMessage?.content || 'Start chatting'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center space-x-3 bg-white">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center overflow-hidden">
                  {selectedConversation.photos?.[0] ? (
                    <img src={selectedConversation.photos[0]} alt="avatar" className="w-full h-full object-cover" />
                  ) : '👤'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {selectedConversation.firstName} {selectedConversation.lastName}
                  </h3>
                  {isTyping && <p className="text-xs text-primary-500">typing...</p>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                  const isOwn =
                    msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  return (
                    <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-pink-200' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex space-x-2 bg-white">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1 input-field"
                  placeholder="Type a message... (Enter to send)"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="btn-primary px-5 disabled:opacity-50"
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="font-medium text-gray-700">Select a conversation</p>
                <p className="text-sm text-gray-400 mt-1">to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
