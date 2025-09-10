import { io } from 'socket.io-client';

let socket = null;

export const initSocketConnection = () => {
  if (!socket) {
    console.log('Initializing socket connection...');

    socket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,              // auto-reconnect enabled
      reconnectionAttempts: Infinity,  // keep trying forever
      reconnectionDelay: 1000,         // try every 1 second
      timeout: 20000                   // 20 sec timeout for initial connection
    });

    // Connection successful
    socket.on('connect', () => {
      console.log('Socket connected successfully:', socket.id);
    });

    // Connection error
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message || error);
    });

    // Disconnection
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    // Optional: reconnect attempts logging
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log('Socket reconnect attempt:', attempt);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.disconnect();
    socket = null;
  }
};
