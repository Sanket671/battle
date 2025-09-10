import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ChatList from './components/Chat/ChatList';
import ChatWindow from './components/Chat/ChatWindow';
import Navbar from './components/Layout/Navbar';
import { SocketProvider } from './context/SocketContext';
import './App.css';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="App">
        {user && <Navbar />}
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/chats" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/chats" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/chats" />} 
          />
          <Route 
            path="/chats" 
            element={
              user ? (
                <SocketProvider>
                  <ChatList />
                </SocketProvider>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/chat/:chatId" 
            element={
              user ? (
                <SocketProvider>
                  <ChatWindow />
                </SocketProvider>
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;