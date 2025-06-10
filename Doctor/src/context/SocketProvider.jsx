import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { config } from '../../vite.config'
// Create socket context
const SocketContext = createContext(null);

// Custom hook to use socket
export const useSocket = () => {
  return useContext(SocketContext);
};

// Socket provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Connect to socket server
    const socketServer = io(`${config.socketUrl}`, {
      transports: ['websocket', 'polling'],
    });

    // Connection events
    socketServer.on('connect', () => {
      console.log('Socket connected:', socketServer.id);
      setIsConnecting(false);
      setError(null);
    });

    socketServer.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setIsConnecting(false);
      setError(`Connection error: ${err.message}`);
    });

    socketServer.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected you, reconnect manually
        socketServer.connect();
      }
    });

    // Set socket in state
    setSocket(socketServer);

    // Clean up on unmount
    return () => {
      console.log('Cleaning up socket connection');
      socketServer.disconnect();
    };
  }, []);

  // Show loading state while connecting
  if (isConnecting) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Show error if connection failed
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-4">
        <p className="font-bold">Connection Error</p>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  // Provide socket to children
  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};