import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:6005', {
      withCredentials: true,
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setSocket(newSocket);
      setIsConnecting(false);
      setError(null);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setError('Failed to connect to server');
      setIsConnecting(false);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  if (isConnecting) {
    return <div>Connecting to server...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <SocketContext.Provider value={{ socket, isConnecting, error }}>
      {socket ? children : null}
    </SocketContext.Provider>
  );
};