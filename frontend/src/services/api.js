import axios from 'axios';

// Direct connection to backend on port 3000
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000 // 10 second timeout
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Please make sure the backend is running on port 3000.');
    } else if (error.response?.status === 401) {
      console.error('Unauthorized access - redirect to login');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth functions
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const checkAuth = async () => {
  try {
    const response = await api.get('/auth/check');
    return response.data;
  } catch (error) {
    console.error('Auth check error:', error);
    throw error;
  }
};

export const createChat = async (title) => {
  try {
    const response = await api.post('/chat', { title });
    return response.data;
  } catch (error) {
    console.error('Create chat error:', error);
    throw error;
  }
};

export const getChats = async () => {
  try {
    const response = await api.get('/chat');
    return response.data;
  } catch (error) {
    console.error('Get chats error:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId) => {
  try {
    const response = await api.get(`/chat/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Get chat messages error:', error);
    throw error;
  }
};