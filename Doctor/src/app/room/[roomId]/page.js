'use client';

import React, { useEffect, useCallback, useState, useRef } from "react";
import peerService from "../../../service/peer";
import { useSocket } from "../../../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  const remoteVideoRef = useRef(null);
  const myVideoRef = useRef(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`👤 User joined: ${email}`);
    setRemoteSocketId(id);
    socket.emit("user:ready", { to: id });
  }, [socket]);

  const handleCallUser = useCallback(async () => {
    // 1. Get local media stream first
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setMyStream(stream);

    // 2. Add local tracks to the peer connection
    // This implicitly creates the transceivers.
    stream.getTracks().forEach(track => peerService.peer.addTrack(track, stream));

    // 3. Create the offer after tracks have been added
    const offer = await peerService.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    console.log("📞 Incoming call from", from);
    setRemoteSocketId(from);

    // 1. Get local media stream first
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    setMyStream(stream);
    
    // 2. Add local tracks to the peer connection
    // This implicitly creates the transceivers.
    stream.getTracks().forEach(track => peerService.peer.addTrack(track, stream));

    // 3. Set remote description and create the answer after tracks have been added
    const ans = await peerService.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans });
  }, [socket]);

  const handleCallAccepted = useCallback(async ({ ans }) => {
    console.log("✅ Call accepted");
    await peerService.setRemoteDescription(ans);
  }, []);

  // Corrected useEffect to prevent the TypeError
  useEffect(() => {
    const handleTrackEvent = (event) => {
      console.log("📥 Remote track received");
      setRemoteStream(event.streams[0]);
    };

    // Add the listener only if the peer object exists
    if (peerService.peer) {
      peerService.peer.addEventListener("track", handleTrackEvent);
    }

    // The cleanup function should check if peerService.peer is not null
    return () => {
      if (peerService.peer) {
        peerService.peer.removeEventListener("track", handleTrackEvent);
      }
    };
  }, []);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (myVideoRef.current && myStream) {
        myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (!socket) return;

    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted]);

  useEffect(() => {
    if (!socket) return;
    const handleUserReady = ({ to }) => {
      console.log("🟢 Peer is ready");
      setRemoteSocketId(to);
    };
    socket.on("user:ready", handleUserReady);
    return () => socket.off("user:ready", handleUserReady);
  }, [socket]);

  const toggleMic = () => {
    if (!myStream) return;
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    setMicEnabled(prev => !prev);
  };

  const toggleCam = () => {
    if (!myStream) return;
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setCamEnabled(prev => !prev);
  };

  const endCall = () => {
    // Stop local media tracks
    if (myStream) myStream.getTracks().forEach(track => track.stop());

    // Clean up the peer connection
    peerService.cleanup();
    
    // Reset state
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-semibold mb-4">Room</h2>
      <p className="mb-4 text-gray-600">
        {remoteSocketId ? "🎉 Connected to peer!" : "⏳ Waiting for peer to join..."}
      </p>

      {remoteSocketId && !myStream && (
        <button
          onClick={handleCallUser}
          className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Start Call
        </button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {myStream && (
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-medium mb-2">My Stream</h3>
            <video
              ref={myVideoRef}
              muted
              autoPlay
              playsInline
              className="w-full h-48 bg-black rounded"
            />
            <div className="mt-4 flex space-x-2">
              <button
                onClick={toggleMic}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                {micEnabled ? "Mute Mic" : "Unmute Mic"}
              </button>
              <button
                onClick={toggleCam}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                {camEnabled ? "Turn Off Camera" : "Turn On Camera"}
              </button>
              <button
                onClick={endCall}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                End Call
              </button>
            </div>
          </div>
        )}

        {remoteStream && (
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-medium mb-2">Remote Stream</h3>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-48 bg-black rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;