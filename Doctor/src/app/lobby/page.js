'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '../../context/SocketProvider';

const LobbyScreen = () => {
  const router = useRouter();
  const socket = useSocket();

  const [email, setEmail] = useState('');
  const [room, setRoom] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [socketStatus, setSocketStatus] = useState('Disconnected');

  useEffect(() => {
    if (!socket) return;

    setSocketStatus(socket.connected ? 'Connected' : 'Connecting');

    const onConnect = () => setSocketStatus('Connected');
    const onDisconnect = () => setSocketStatus('Disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket]);

  const handleJoinRoom = useCallback(
    ({ room }) => {
      localStorage.setItem('userEmail', email);
      router.push(`/room/${room}`);
    },
    [router, email]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on('room:join', handleJoinRoom);
    return () => {
      socket.off('room:join', handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  const handleSubmitForm = (e) => {
    e.preventDefault();

    if (!email || !room) {
      setError('Email and room number are required.');
      return;
    }

    setError('');
    setIsJoining(true);
    socket.emit('room:join', { email, room });
  };

  const generateRandomRoom = () => {
    setRoom(Math.floor(100000 + Math.random() * 900000).toString());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Join Room</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Room Number</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room"
                required
                className="w-full px-3 py-2 border rounded-md"
              />
              <button
                type="button"
                onClick={generateRandomRoom}
                className="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-md hover:bg-gray-300"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">Socket Status: {socketStatus}</div>

          <button
            type="submit"
            disabled={isJoining || socketStatus !== 'Connected'}
            className={`w-full mt-4 px-4 py-2 text-white rounded-md ${
              isJoining || socketStatus !== 'Connected'
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LobbyScreen;
