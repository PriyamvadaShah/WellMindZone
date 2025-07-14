import React, { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [error, setError] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Waiting for connection...");
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [autoCallAttempted, setAutoCallAttempted] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  // Add this state at the top of your component
const [isNegotiating, setIsNegotiating] = useState(false);
const lastNegotiationTime = useRef(0)
// Add this to your RoomPage component state
const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
const streamRequestTimeouts = {};
const [isConnected, setIsConnected] = useState(false);
const streamRequestCount = useRef(0);
const componentMounted = useRef(true);
  const lastJoinTime = useRef(Date.now());
  const joinedUsers = useRef(new Set());
// Add this function to help manage peer connection state
const ensureValidPeerConnection = useCallback(() => {
  if (!peer.peer || ['closed', 'failed', 'disconnected'].includes(peer.peer.connectionState)) {
    console.log("Creating new peer connection");
    peer.resetConnection();
    return false;
  }
  return true;
}, []);

// Then use it in your handleCallUser function:
const handleCallUser = async () => {
  try {
    console.log("Starting call to:", remoteSocketId);
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
  } catch (err) {
    console.error("Call failed:", err);
  }
};

const handleIncomingCall = async ({ from, offer }) => {
  try {
    console.log("Incoming call from:", from);
    const answer = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans: answer });
  } catch (err) {
    console.error("Failed to accept call:", err);
  }
};

const handleCallAccepted = async ({ from, ans }) => {
  try {
    console.log("Call accepted by:", from);
    await peer.setRemoteDescription(ans);
  } catch (err) {
    console.error("Error in call accept:", err);
  }
};
// filepath: e:\foodie\WellMindZone\Patient\src\pages\Room.jsx


// 2. Update the sendStreams function to handle track replacement
const sendStreams = useCallback(() => {
  if (!myStream || !peer.peer) return;
  
  try {
    const senders = peer.peer.getSenders();
    const tracks = myStream.getTracks();

    tracks.forEach(track => {
      const existingSender = senders.find(sender => 
        sender.track && sender.track.kind === track.kind
      );

      if (existingSender) {
        // Replace track instead of adding new one
        console.log(`Replacing existing ${track.kind} track`);
        existingSender.replaceTrack(track)
          .catch(err => console.error(`Error replacing track: ${err}`));
      } else {
        // Only add if no sender exists for this track type
        console.log(`Adding new ${track.kind} track`);
        peer.peer.addTrack(track, myStream);
      }
    });
    
    console.log("Tracks updated in peer connection");
  } catch (err) {
    console.error("Error sending stream:", err);
  }
}, [myStream]);
// Add this at the top of your component

// Add this at the end of your component
useEffect(() => {
  // Set mounted flag
  componentMounted.current = true;
  
  return () => {
    // Set unmounted flag
    componentMounted.current = false;
    
    // Clean up all resources
    console.log("Cleaning up Room component...");
    
    if (myStream) {
      myStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (err) {
          console.warn("Error stopping track:", err);
        }
      });
    }
    
    if (peer.peer) {
      try {
        peer.peer.close();
      } catch (err) {
        console.warn("Error closing peer connection:", err);
      }
    }
  };
}, []);
  // Add this additional auto-send effect that triggers on remote stream changes
useEffect(() => {
  // When remote stream is set, make sure our stream is sent too
  if (remoteStream && myStream) {
    console.log("Remote stream detected - ensuring our stream is sent");
    sendStreams();
  }
}, [remoteStream, myStream, sendStreams]);

useEffect(() => {
  if (!socket || !roomId) return;

  // Debounced room join function
  const joinRoom = () => {
    const now = Date.now();
    if (now - lastJoinTime.current < 2000) {
      console.log("Skipping duplicate room join attempt");
      return;
    }
    lastJoinTime.current = now;

    const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'patient';
    console.log(`Joining room ${roomId} as ${email}`);
    socket.emit('room:join', { email, room: roomId });
  };

  // Handle user joined event with duplicate prevention
  const handleUserJoined = ({ email, id }) => {
    if (joinedUsers.current.has(id)) {
      console.log(`Ignoring duplicate user join for ${email}`);
      return;
    }
    joinedUsers.current.add(id);
    
    console.log(`Email ${email} joined room with ID: ${id}`);
    setRemoteSocketId(id);
    setConnectionStatus("User connected. Ready to call.");
  };

  socket.on("user:joined", handleUserJoined);
  joinRoom();

  return () => {
    socket.off("user:joined", handleUserJoined);
    joinedUsers.current.clear();
  };
}, [socket, roomId]);
  // Monitor WebRTC connection state
  // Update your WebRTC connection state monitoring useEffect
// Fix the connection state monitoring useEffect
// 1. First remove the nested useEffect
useEffect(() => {
  if (!peer.peer) return;
  
  const handleIceConnectionStateChange = () => {
    const state = peer.peer.iceConnectionState;
    console.log('ICE Connection State:', state);
    
    switch (state) {
      case 'connected':
        setConnectionStatus('ICE Connection established');
        break;
      case 'failed':
        console.log('ICE Connection failed - attempting recovery');
        peer.resetConnection();
        setAutoCallAttempted(false);
        if (remoteSocketId) {
          setTimeout(() => handleCallUser(), 2000);
        }
        break;
      case 'disconnected':
        setConnectionStatus('ICE Connection lost - trying to reconnect...');
        break;
      default:
        setConnectionStatus(`ICE Connection state: ${state}`);
    }
  };

  const handleConnectionStateChange = () => {
    const state = peer.peer.connectionState;
    console.log('Connection State:', state);
    
    switch (state) {
      case 'connected':
        setConnectionStatus('Peer connection established');
        if (myStream) {
          sendStreams();
        }
        break;
      case 'failed':
        setConnectionStatus('Connection failed - will try to reconnect');
        setRemoteStream(null);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null;
        }
        peer.resetConnection();
        setAutoCallAttempted(false);
        break;
      case 'disconnected':
        setConnectionStatus('Connection lost - attempting to recover');
        break;
      default:
        setConnectionStatus(`Connection state: ${state}`);
    }
  };
  
  const handleIceCandidateError = (event) => {
    console.error('ICE Candidate Error:', event);
    setConnectionStatus('Connection error - please try refreshing');
  };
  
  // Store a reference to the peer to avoid cleanup issues
  const currentPeer = peer.peer;
  
  // Add event listeners
  currentPeer.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
  currentPeer.addEventListener('connectionstatechange', handleConnectionStateChange);
  currentPeer.addEventListener('icecandidateerror', handleIceCandidateError);
  
  // Cleanup function
  return () => {
    if (currentPeer) {
      try {
        currentPeer.removeEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
        currentPeer.removeEventListener('connectionstatechange', handleConnectionStateChange);
        currentPeer.removeEventListener('icecandidateerror', handleIceCandidateError);
      } catch (err) {
        console.warn("Error removing event listeners:", err);
      }
    }
  };
}, [
  peer.peer,
  remoteSocketId,
  handleCallUser,
  myStream,
  sendStreams,
  setConnectionStatus,
  setAutoCallAttempted
]);

// 2. Add a separate useEffect for connection state tracking
useEffect(() => {
  if (!peer.peer) return;
  
  const handleConnectionChange = () => {
    const state = peer.peer.connectionState;
    console.log("Connection state changed:", state);
    
    if (state === 'connected') {
      setIsConnected(true);
      if (myStream) {
        console.log("Connection established, sending streams");
        setTimeout(sendStreams, 1000);
      }
    } else {
      setIsConnected(false);
    }
  };
  
  peer.peer.addEventListener('connectionstatechange', handleConnectionChange);
  
  return () => {
    peer.peer.removeEventListener('connectionstatechange', handleConnectionChange);
  };
}, [peer.peer, myStream, sendStreams]);
// Add this to your useEffect cleanup in both Doctor and Patient Room.jsx
useEffect(() => {
  // ...existing code...
  
  return () => {
    // Stop all tracks when component unmounts
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    
    // Close peer connection
    if (peer.peer) {
      peer.peer.close();
    }
    
    // Clear references to streams
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };
}, []);

  // Get local media stream
  const getMediaStream = async () => {
    try {
      setIsRequestingMedia(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setMyStream(stream);
      
      // Set the stream to local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (err) {
      console.error('Media access error:', err);
      
      let errorMessage = 'Could not access camera or microphone.';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera/microphone access was denied. Please allow access in your browser settings.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect a device and try again.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Your camera or microphone is already in use by another application.';
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsRequestingMedia(false);
    }
  };

  // First, update your handleUserJoined function in Room.jsx
const handleUserJoined = useCallback(({ email, id }) => {
  console.log(`Email ${email} joined room with ID: ${id}`);
  setRemoteSocketId(id);
  setConnectionStatus("User connected. Ready to call.");
  
  // Auto-call the new user after a short delay
  setTimeout(() => {
    if (!autoCallAttempted && myStream) {
      console.log("Auto-initiating call to newly joined user");
      handleCallUser();
    } else if (!myStream) {
      console.log("Need to get media stream before calling");
      getMediaStream().then(() => {
        console.log("Got media stream, now calling");
        handleCallUser();
      });
    }
  }, 1000);
}, [autoCallAttempted, myStream, handleCallUser, getMediaStream]);

  // Handle incoming call
  const handleIncommingCall = useCallback(async ({ from, offer }) => {
    try {
      setConnectionStatus("Incoming call...");
      setRemoteSocketId(from);
      const stream = await getMediaStream();
      console.log(`Incoming Call from: ${from}`);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    } catch (err) {
      console.error('Failed to accept incoming call:', err);
      setConnectionStatus("Failed to accept call.");
    }
  }, [socket]);

  // Handle negotiation needed
  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  // Set up negotiation listener
  useEffect(() => {
    if (!peer.peer) return;
    
    console.log('Setting up negotiation event listener');
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

// Update handleNegoNeedIncomming
const handleNegoNeedIncomming = useCallback(async ({ from, offer }) => {
  try {
    // Prevent multiple simultaneous negotiations
    if (isNegotiating) {
      console.log("Already negotiating, skipping");
      return;
    }
    
    setIsNegotiating(true);
    console.log("Starting negotiation with offer");
    
    // Ensure valid connection state
    if (!peer.peer || peer.peer.connectionState === 'closed') {
      console.log('Creating new peer connection');
      peer.resetConnection();
    }
    
    await peer.peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.peer.createAnswer();
    await peer.peer.setLocalDescription(answer);
    
    socket.emit("peer:nego:done", { to: from, ans: answer });
  } catch (err) {
    console.error("Negotiation error:", err);
  } finally {
    setIsNegotiating(false);
  }
}, [socket, peer, isNegotiating]);
  // Handle final negotiation step
  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

// filepath: e:\foodie\WellMindZone\Patient\src\pages\Room.jsx

// Replace the track event handler with this improved version
useEffect(() => {
  if (!peer.peer) return;
  
  const handleTrack = (event) => {
    console.log("🎯 Track event received!", {
      streams: event.streams?.length,
      trackKind: event.track?.kind,
      trackId: event.track?.id
    });
    
    if (event.streams && event.streams[0]) {
      const stream = event.streams[0];
      console.log("🎉 Got remote stream!", {
        streamId: stream.id,
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length
      });
      
      // Set remote stream in state
      setRemoteStream(stream);
      
      // Directly set stream on video element
      if (remoteVideoRef.current) {
        console.log("Setting stream on video element");
        remoteVideoRef.current.srcObject = stream;
        
        // Force play with retry
        const playVideo = async () => {
          try {
            await remoteVideoRef.current.play();
            console.log("Remote video playing!");
          } catch (err) {
            console.warn("Autoplay failed, retrying...", err);
            setTimeout(playVideo, 1000);
          }
        };
        
        playVideo();
      }
    }
  };
  
  // Add track event listener
  console.log("Setting up track event listener");
  peer.peer.addEventListener("track", handleTrack);
  
  return () => {
    console.log("Cleaning up track event listener");
    if (peer.peer) {
      peer.peer.removeEventListener("track", handleTrack);
    }
  };
}, []);

// Add this effect to ensure remote video plays when stream changes
useEffect(() => {
  if (remoteStream && remoteVideoRef.current) {
    console.log("Remote stream changed - updating video element");
    remoteVideoRef.current.srcObject = remoteStream;
    
    // Always try to play when stream changes
    remoteVideoRef.current.play()
      .catch(err => console.warn("Could not autoplay:", err));
  }
}, [remoteStream]);

// Add at the beginning of your Room.jsx component
useEffect(() => {
  // Disable hardware acceleration for this page in Chrome
  const meta = document.createElement('meta');
  meta.name = 'hardware-acceleration';
  meta.content = 'off';
  document.head.appendChild(meta);
  
  return () => {
    document.head.removeChild(meta);
  };
}, []);
// Add this to check if we came from lobby
useEffect(() => {
  // Check if we came from lobby
  const fromLobby = sessionStorage.getItem('fromLobby') === 'true';
  
  if (fromLobby) {
    console.log('User came from lobby - enabling auto-connect');
    // Auto-connect logic is already in place, no need for additional code
  }
  
  // Clear the flag
  sessionStorage.removeItem('fromLobby');
}, []);
  // Auto-request media on component mount
  useEffect(() => {
    const autoRequestMedia = async () => {
      try {
        console.log("Auto-requesting media on component mount");
        await getMediaStream();
      } catch (err) {
        console.error("Failed to auto-request media:", err);
      }
    };
    
    autoRequestMedia();
  }, []);
// Improve auto-call logic
useEffect(() => {
  if (remoteSocketId && myStream && !autoCallAttempted) {
    console.log("Auto-initiating call to remote user");
    setAutoCallAttempted(true);
    
    // Call immediately instead of setTimeout
    handleCallUser();
  }
}, [remoteSocketId, myStream, autoCallAttempted, handleCallUser]);

  // Auto-send stream when call is accepted
  useEffect(() => {
    const handleAutoSendStream = () => {
      if (myStream && peer.peer.connectionState === 'connected') {
        console.log("Auto-sending stream on connection");
        sendStreams();
      }
    };
    
    // Listen for connection state changes
    if (peer.peer) {
      peer.peer.addEventListener('connectionstatechange', handleAutoSendStream);
      
      return () => {
        peer.peer.removeEventListener('connectionstatechange', handleAutoSendStream);
      };
    }
  }, [myStream, sendStreams]);
// Replace your current useEffect socket listeners with this:
useEffect(() => {
  if (!socket) {
    setConnectionStatus("Socket not connected. Please refresh.");
    return;
  }

  console.log("Socket connected:", socket.id);
  setConnectionStatus("Waiting for another user to join...");

  // Debug logs for all socket events
  const logSocketEvent = (event, data) => {
    console.log(`[SOCKET EVENT] ${event}:`, data);
  };

  socket.onAny(logSocketEvent);

  // This is the combined handler for when users join
  const handleUserJoined = ({ email, id }) => {
    console.log(`Email ${email} joined room with ID: ${id}`);
    setRemoteSocketId(id);
    setConnectionStatus("User connected. Ready to call.");
    
    // When a new user joins, immediately let them know we're here and expecting their stream
    setTimeout(() => {
      socket.emit("stream:request", { to: id });
    }, 2000);
  };

  socket.on("user:joined", handleUserJoined);
  socket.on("incomming:call", handleIncommingCall);
  socket.on("call:accepted", handleCallAccepted);
  socket.on("peer:nego:needed", handleNegoNeedIncomming);
  socket.on("peer:nego:final", handleNegoNeedFinal);
// Replace your stream request handler
socket.on("stream:request", ({ from }) => {
  // Prevent self-requests
  if (from === socket.id) {
    console.warn("Ignored self-stream request");
    return;
  }
  
  // Rate limit with counting
  streamRequestCount.current++;
  if (streamRequestCount.current > 3) {
    console.warn("Too many stream requests, ignoring");
    return;
  }
  
  // Reset counter after 5 seconds
  setTimeout(() => {
    streamRequestCount.current = 0;
  }, 5000);

  console.log("Processing stream request from", from);
  
  // Check connection state more thoroughly
  const isValidState = peer.peer && 
    peer.peer.connectionState === 'connected' &&
    peer.peer.signalingState === 'stable';
  
  if (myStream && isValidState) {
    console.log("Sending stream in response to request");
    sendStreams();
  } else {
    console.log("Cannot send stream - waiting for stable connection", {
      peerExists: !!peer.peer,
      connectionState: peer.peer?.connectionState,
      signalingState: peer.peer?.signalingState
    });
    
    // If connection isn't ready, try to establish it
    if (!isConnected) {
      console.log("Connection not ready, attempting to establish");
      setAutoCallAttempted(false);
      handleCallUser();
    }
  }
});


  // Important: Properly join the room
  const email = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail') || 'patient';
  console.log(`EXPLICITLY joining room ${roomId} as ${email}`);
  
  // Always join the room explicitly
  socket.emit('room:join', { email, room: roomId });
  
  // Then check for participants after a short delay
  setTimeout(() => {
    socket.emit('room:check', { room: roomId });
  }, 1000);

  return () => {
    socket.off("user:joined", handleUserJoined);
    socket.off("incomming:call", handleIncommingCall);
    socket.off("call:accepted", handleCallAccepted);
    socket.off("peer:nego:needed", handleNegoNeedIncomming);
    socket.off("peer:nego:final", handleNegoNeedFinal);
    socket.off("stream:request");
    socket.offAny(logSocketEvent);
  };
}, [
  socket,
  roomId,
  handleIncommingCall,
  handleCallAccepted,
  handleNegoNeedIncomming,
  handleNegoNeedFinal,
  sendStreams
]);
// Add this effect right after your existing useEffect blocks
useEffect(() => {
  // This effect specifically ensures the remote video displays properly
  if (remoteStream && remoteVideoRef.current) {
    console.log("STREAM UPDATE: Setting remote stream to video element");
    
    // Force a clean connection to the video element
    remoteVideoRef.current.srcObject = null;
    
    // Short delay before setting the stream
    setTimeout(() => {
      if (remoteVideoRef.current) {
        console.log("Applying remote stream to video element");
        remoteVideoRef.current.srcObject = remoteStream;
        
        // Force play with error handling
        remoteVideoRef.current.play()
          .then(() => console.log("Remote video playing"))
          .catch(err => {
            console.warn("Couldn't autoplay remote video:", err);
            
            // Add a play button if autoplay fails
            const parent = remoteVideoRef.current.parentElement;
            if (parent) {
              const playButton = document.createElement('button');
              playButton.textContent = '▶️ Play Video';
              playButton.style = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; padding: 10px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 5px; cursor: pointer;';
              playButton.onclick = () => {
                remoteVideoRef.current.play();
                playButton.remove();
              };
              parent.appendChild(playButton);
            }
          });
      }
    }, 500);
  }
}, [remoteStream]);
  if (!socket) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">Connection Error</h1>
          <p className="mb-4">Unable to connect to video chat server.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Video Chat Room: {roomId}</h1>
      
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="font-medium">Status: {connectionStatus}</p>
        <p className="text-sm">Room ID: {roomId}</p>
        {remoteSocketId && <p className="text-sm">Connected to: {remoteSocketId}</p>}
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-sm underline mt-2"
          >
            Try Again
          </button>
        </div>
      )}

      {isRequestingMedia && (
        <div className="text-blue-600 mb-4 p-3 bg-blue-50 rounded-md">
          <p>Requesting camera and microphone access...</p>
        </div>
      )}

      {/* Media controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        {myStream && (
          <div className="flex gap-3 items-center">

<button 
  onClick={() => {
    console.log("Simple video fix");
    
    // 1. Reset connection
    peer.resetConnection();
    
    // 2. Allow new call
    setAutoCallAttempted(false);
    
    // 3. Initiate new call after brief delay
    setTimeout(() => {
      if (remoteSocketId) {
        handleCallUser();
      }
    }, 1000);
  }}
  className="p-3 rounded-full bg-blue-500 text-white"
  title="Fix Video"
>
  🔄 Fix
</button>
            <button 
              onClick={() => {
                const audioTracks = myStream.getAudioTracks();
                if (audioTracks.length > 0) {
                  const enabled = !audioTracks[0].enabled;
                  audioTracks[0].enabled = enabled;
                  setMicEnabled(enabled);
                }
              }}
              className={`p-3 rounded-full ${micEnabled ? 'bg-blue-100 text-blue-700' : 'bg-red-500 text-white'}`}
              title={micEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {micEnabled ? "🎤" : "🔇"}
            </button>
            
            <button 
              onClick={() => {
                const videoTracks = myStream.getVideoTracks();
                if (videoTracks.length > 0) {
                  const enabled = !videoTracks[0].enabled;
                  videoTracks[0].enabled = enabled;
                  setCameraEnabled(enabled);
                }
              }}
              className={`p-3 rounded-full ${cameraEnabled ? 'bg-blue-100 text-blue-700' : 'bg-red-500 text-white'}`}
              title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {cameraEnabled ? "📹" : "🚫"}
            </button>
            
            <button 
              onClick={() => {
                if (myStream) {
                  myStream.getTracks().forEach(track => track.stop());
                }
                navigate('/lobby');
              }}
              className="p-3 rounded-full bg-red-500 text-white"
              title="End call"
            >
              📴
            </button>
          </div>
        )}
        
        {/* Only show developer options if needed */}
        {false && (
          <div className="flex gap-2 border-l pl-3 ml-3 border-gray-300">
            <button 
              onClick={() => {
                if (socket) {
                  const email = prompt("Enter your email to force join:") || "patient@example.com";
                  socket.emit('room:join', { email, room: roomId });
                  socket.emit('room:check', { room: roomId });
                }
              }}
              className="px-3 py-1 bg-purple-500 text-white text-sm rounded"
            >
              Force Join
            </button>
            // Add this button near your other controls
<button 
  onClick={() => {
    console.log("🔍 Debug Info:");
    console.log("Remote Stream:", remoteStream ? {
      id: remoteStream.id,
      active: remoteStream.active,
      tracks: remoteStream.getTracks().map(t => ({
        kind: t.kind,
        enabled: t.enabled,
        muted: t.muted,
        id: t.id
      }))
    } : 'No remote stream');
    
    console.log("Peer Connection:", peer.peer ? {
      connectionState: peer.peer.connectionState,
      signalingState: peer.peer.signalingState,
      iceConnectionState: peer.peer.iceConnectionState,
      iceGatheringState: peer.peer.iceGatheringState
    } : 'No peer connection');
    
    // Try to force stream reconnection
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
      setTimeout(() => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play()
            .catch(e => console.warn("Play failed:", e));
        }
      }, 100);
    }
  }}
  className="p-3 rounded-full bg-purple-500 text-white"
  title="Debug Remote Stream"
>
  🔍 Debug
</button>
            {remoteSocketId && !autoCallAttempted && (
              <button 
                onClick={handleCallUser}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded"
              >
                Call
              </button>
            )}
            
            {myStream && (
              <button 
                onClick={sendStreams}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
              >
                Send Stream
              </button>
            )}
            
            <button 
              onClick={() => {
                peer.resetConnection();
                setConnectionStatus("Connection reset");
                setAutoCallAttempted(false);
              }}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {myStream && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3">My Stream</h2>
            <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {myStream.getAudioTracks().length > 0 && 
                  (myStream.getAudioTracks()[0].enabled ? "🎤 On" : "🔇 Off")}
                {" | "}
                {myStream.getVideoTracks().length > 0 && 
                  (myStream.getVideoTracks()[0].enabled ? "📹 On" : "🚫 Off")}
              </div>
            </div>
          </div>
        )}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-3">Remote Stream</h2>
          <div className="relative aspect-video bg-gray-100 rounded overflow-hidden">
            {remoteStream ? (
              <>
<video
  ref={remoteVideoRef}
  autoPlay
  playsInline
  key={`${remoteStream?.id}-${Date.now()}`} // Force remount on stream changes
  className="w-full h-full object-cover"
  style={{ backgroundColor: 'black' }}
  onLoadedMetadata={(e) => {
    console.log("Video metadata loaded, attempting to play...");
    const playVideo = async () => {
      try {
        await e.target.play();
        console.log("Remote video playing successfully");
      } catch (err) {
        console.warn("Initial play failed, retrying with user interaction...", err);
        
        // Create play button overlay
        const container = e.target.parentElement;
        const playButton = document.createElement('button');
        playButton.innerHTML = '▶️ Click to Play Video';
        playButton.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-opacity-90';
        
        playButton.onclick = async () => {
          try {
            await e.target.play();
            console.log("Video playing after user interaction");
            playButton.remove();
          } catch (playErr) {
            console.error("Play failed even with user interaction:", playErr);
          }
        };
        
        container.appendChild(playButton);
      }
    };
    
    // Try to play immediately
    playVideo();
  }}
  onPlay={() => {
    console.log("Video play event triggered");
  }}
  onPause={() => {
    console.log("Video paused - attempting to resume");
    remoteVideoRef.current?.play()
      .catch(err => console.warn("Auto-resume failed:", err));
  }}
/>
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {remoteStream.getVideoTracks().length ? 
            `Video: ON (${remoteStream.getVideoTracks().length} tracks)` : 
            'Video: OFF'}
          {" | "}
          {remoteStream.getAudioTracks().length ? 
            `Audio: ON (${remoteStream.getAudioTracks().length} tracks)` : 
            'Audio: OFF'}
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Waiting for remote stream...</p>
      </div>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default RoomPage;