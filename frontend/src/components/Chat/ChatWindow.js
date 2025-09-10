import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { getChatMessages } from '../../services/api';
import Message from './Message';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { chatId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    fetchMessages();
    
    if (socket) {
      // Listen for AI responses
      socket.on('ai-response', (data) => {
        if (data.chat === chatId) {
          setMessages(prev => [...prev, {
            _id: Date.now().toString(),
            content: data.content,
            role: 'model',
            createdAt: new Date()
          }]);
        }
        setLoading(false);
      });

      // Listen for errors
      socket.on('error', (error) => {
        console.error('Socket error:', error);
        setLoading(false);
      });
    }

    return () => {
      if (socket) {
        socket.off('ai-response');
        socket.off('error');
      }
    };
  }, [socket, chatId]);

  const fetchMessages = async () => {
    try {
      const response = await getChatMessages(chatId);
      setMessages(response.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || loading) return;

    // Add user message to UI immediately
    const userMessage = {
      _id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Send message to server via socket - Ensure proper format
    socket.emit('ai-message', {
      content: inputMessage,
      chat: chatId
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Chat</h2>
            </div>
            
            <div className="p-4 space-y-4 h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Start a conversation by sending a message below
                </div>
              ) : (
                messages.map((message) => (
                  <Message key={message._id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputMessage.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;