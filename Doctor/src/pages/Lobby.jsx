import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const LobbyScreen = () => {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState('Connecting...');
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io('http://localhost:6005', {
      transports: ['websocket', 'polling'],
      autoConnect: true
    });

    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
      setSocketStatus('Connected');
      setSocket(newSocket);
    });
    newSocket.on('room:join:success', (data) => {
      console.log('Room joined:', data);
      navigate(`/room/${data.room}`);
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setSocketStatus('Connection error');
    });

    newSocket.on('room:join', (data) => {
      console.log('Room joined successfully:', data);
      navigate(`/room/${data.room}`);
    });

    newSocket.on('room:join_failed', (error) => {
      console.error('Room join failed:', error);
      alert('Failed to join room. Please check the room ID and try again.');
    });

    return () => {
      console.log('Cleaning up socket connection');
      newSocket.close();
    };
  }, [navigate]);

  const handleSubmitForm = (e) => {
    e.preventDefault();
    console.log('Attempting to join room with:', { email, room });

    if (!socket?.connected) {
      console.warn('Socket not connected');
      return;
    }

    socket.emit('room:join', { email, room });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Join Room</h1>
        <form onSubmit={handleSubmitForm}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email ID
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="room" className="block text-sm font-medium mb-2">
                Room Number
              </label>
              <input
                id="room"
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room number"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="text-sm text-gray-500">
              Socket Status: {socketStatus}
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            disabled={!socket?.connected}
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;
