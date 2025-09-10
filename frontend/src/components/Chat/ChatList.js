import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createChat, getChats } from '../../services/api';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const response = await getChats();
      setChats(response.chats);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatTitle.trim()) return;

    setLoading(true);
    try {
      const response = await createChat(newChatTitle);
      setChats([...chats, response.chat]);
      setNewChatTitle('');
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Chats</h1>
        <form onSubmit={handleCreateChat} className="flex">
          <input
            type="text"
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            placeholder="New chat title"
            className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !newChatTitle.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'New Chat'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {chats.map((chat) => (
            <li key={chat._id}>
              <Link
                to={`/chat/${chat._id}`}
                className="block hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-indigo-600 truncate">
                      {chat.title}
                    </h3>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Last activity: {new Date(chat.lastActivity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatList;