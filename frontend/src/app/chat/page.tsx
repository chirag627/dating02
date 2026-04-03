'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { io, Socket } from 'socket.io-client';

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Setup socket
    const token = localStorage.getItem('accessToken');
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(`${socketUrl}/chat`, {
      auth: { token },
    });

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
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
    try {
      const response = await chatApi.getConversation(conv._id) as any;
      setMessages((response.data || []).reverse());
    } catch (err) {
      console.error('Failed to load messages:', err);
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
        createdAt: new Date(),
      },
    ]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span>💕</span>
            <span className="font-bold text-primary-600">Dating02</span>
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        </div>
      </nav>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-4 flex gap-4" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Conversations List */}
        <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
          </div>
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => selectConversation(conv.user || conv)}
                className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 text-left ${
                  selectedConversation?._id === conv._id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-xl">
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
                  <p className="font-medium text-gray-900 truncate">
                    {conv.user?.firstName} {conv.user?.lastName}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {conv.lastMessage?.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                  👤
                </div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.firstName} {selectedConversation.lastName}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, idx) => {
                  const isOwn = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                  return (
                    <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isOwn
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1 input-field"
                  placeholder="Type a message..."
                />
                <button onClick={sendMessage} className="btn-primary px-6">
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
