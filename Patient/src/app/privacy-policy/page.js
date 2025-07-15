'use client'; // Only if using client-side features like useState/useEffect
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketProvider';

const LobbyScreen = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Disconnected');

  // Update socket status when socket changes
  useEffect(() => {
    if (!socket) {
      setSocketStatus('Disconnected');
      return;
    }
    
    setSocketStatus(socket.connected ? 'Connected' : 'Connecting');
    
    const handleConnect = () => {
      console.log('Socket connected in Lobby:', socket.id);
      setSocketStatus('Connected');
    };
    
    const handleDisconnect = () => {
      console.log('Socket disconnected in Lobby');
      setSocketStatus('Disconnected');
    };
    
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    // Set initial status
    if (socket.connected) {
      setSocketStatus('Connected');
    }
    
    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  // Handle room join success event
  useEffect(() => {
    if (!socket) return;
    
    // Fix the handleRoomJoined function in Lobby.jsx
// const handleRoomJoined = (data) => {
//   console.log('Room join success:', data);
  
//   // Store that we're coming from lobby
//   sessionStorage.setItem('fromLobby', 'true');
  
//   // Store the user email 
//   sessionStorage.setItem('userEmail', email);
  
//   // Get the room ID from the data or use the current room state
//   const roomId = data?.room || room;
  
//   // Navigate to room
//   navigate(`/room/${roomId}`);
// };
    
    console.log('Setting up room:join:success listener');
    socket.on('room:join:success', handleRoomJoined);
    
    const handleRoomJoinFailed = (error) => {
      console.error('Room join failed:', error);
      setIsJoining(false);
      setError('Failed to join room. Please check the room ID and try again.');
    };
    
    socket.on('room:join_failed', handleRoomJoinFailed);
    
    return () => {
      console.log('Cleaning up room event listeners');
      socket.off('room:join:success', handleRoomJoined);
      socket.off('room:join_failed', handleRoomJoinFailed);
    };
  }, [socket, navigate]);

  // Update just the handleSubmitForm function:
const handleSubmitForm = (e) => {
  e.preventDefault();
  
  if (!socket) {
    setError('Socket not connected. Please refresh the page.');
    return;
  }
  
  if (!email || !room) {
    setError('Email and room are required');
    return;
  }
  
  // Just store the email in localStorage - simple and reliable
  localStorage.setItem('userEmail', email);
  
  setError('');
  setIsJoining(true);
  console.log(`Joining room ${room} with email ${email}`);
  socket.emit('room:join', { email, room });
};

// Update handleRoomJoined to be simple:
const handleRoomJoined = (data) => {
  console.log('Room join success:', data);
  navigate(`/room/${data.room || room}`);
};
  // Generate a random room ID
  const generateRandomRoom = () => {
    const roomId = Math.floor(100000 + Math.random() * 900000).toString();
    setRoom(roomId);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Join Room</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
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
              <div className="flex space-x-2">
                <input
                  id="room"
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Enter room number"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={generateRandomRoom}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Generate
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Socket Status: {socketStatus}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full mt-6 px-4 py-2 text-white rounded-md ${
              isJoining || socketStatus !== 'Connected'
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isJoining || socketStatus !== 'Connected'}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;