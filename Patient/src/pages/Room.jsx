import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [error, setError] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);
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
  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Room Page</h1>
      
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

      <h4 className="mb-4">
        {remoteSocketId ? "Connected" : "No one in room"}
      </h4>

      {isRequestingMedia && (
        <div className="text-blue-600 mb-4">
          Requesting camera and microphone access...
        </div>
      )}

      <div className="space-x-4 mb-4">
        {myStream && <button 
          onClick={sendStreams}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Stream
        </button>}
        
        {remoteSocketId && <button 
          onClick={handleCallUser}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          CALL
        </button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myStream && (
          <div>
            <h2 className="text-xl font-bold mb-2">My Stream</h2>
            <ReactPlayer
              playing
              muted
              height="240px"
              width="320px"
              url={myStream}
            />
          </div>
        )}

        {remoteStream && (
          <div>
            <h2 className="text-xl font-bold mb-2">Remote Stream</h2>
            <ReactPlayer
              playing
              muted
              height="240px"
              width="320px"
              url={remoteStream}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomPage;

// import React, { useEffect, useCallback, useState } from "react";
// import ReactPlayer from "react-player";
// import peer from "../service/peer";
// import { useSocket } from "../context/SocketProvider";

// const RoomPage = () => {
//   const socket = useSocket();
//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [myStream, setMyStream] = useState();
//   const [remoteStream, setRemoteStream] = useState();
//   const [error, setError] = useState(null);
//   const [isRequestingMedia, setIsRequestingMedia] = useState(false);
//   if (!socket) {
//     return <div>Waiting for connection...</div>;
//   }

//   const handleUserJoined = useCallback(({ email, id }) => {
//     console.log(`Email ${email} joined room`);
//     setRemoteSocketId(id);
//   }, []);

//   const getMediaStream = async () => {
//     try {
//       setIsRequestingMedia(true);
//       setError(null);
      
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: true,
//         video: {
//           width: { ideal: 640 },
//           height: { ideal: 480 }
//         }
//       });
      
//       setMyStream(stream);
//       return stream;
//     } catch (err) {
//       console.error('Media access error:', err);
      
//       let errorMessage = 'Could not access camera or microphone.';
//       if (err.name === 'NotAllowedError') {
//         errorMessage = 'Camera/microphone access was denied. Please allow access in your browser settings.';
//       } else if (err.name === 'NotFoundError') {
//         errorMessage = 'No camera or microphone found. Please connect a device and try again.';
//       } else if (err.name === 'NotReadableError') {
//         errorMessage = 'Your camera or microphone is already in use by another application.';
//       }
      
//       setError(errorMessage);
//       throw err;
//     } finally {
//       setIsRequestingMedia(false);
//     }
//   };

//   const handleCallUser = useCallback(async () => {
//     try {
//       const stream = await getMediaStream();
//       const offer = await peer.getOffer();
//       socket.emit("user:call", { to: remoteSocketId, offer });
//     } catch (err) {
//       console.error('Call failed:', err);
//     }
//   }, [remoteSocketId, socket]);

//   const handleIncommingCall = useCallback(
//     async ({ from, offer }) => {
//       try {
//         setRemoteSocketId(from);
//         const stream = await getMediaStream();
//         console.log(`Incoming Call`, from, offer);
//         const ans = await peer.getAnswer(offer);
//         socket.emit("call:accepted", { to: from, ans });
//       } catch (err) {
//         console.error('Failed to accept incoming call:', err);
//       }
//     },
//     [socket]
//   );

//   const sendStreams = useCallback(() => {
//     if (!myStream) {
//       console.warn('No local stream to send');
//       return;
//     }

//     for (const track of myStream.getTracks()) {
//       peer.peer.addTrack(track, myStream);
//     }
//   }, [myStream]);

//   // ... rest of your existing event handlers ...

//   // Add cleanup for media streams
//   useEffect(() => {
//     return () => {
//       if (myStream) {
//         myStream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [myStream]);

//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-bold mb-4">Room Page</h1>
      
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//           <button 
//             onClick={() => setError(null)}
//             className="text-sm underline mt-2"
//           >
//             Try Again
//           </button>
//         </div>
//       )}

//       <h4 className="mb-4">
//         {remoteSocketId ? "Connected" : "No one in room"}
//       </h4>

//       {isRequestingMedia && (
//         <div className="text-blue-600 mb-4">
//           Requesting camera and microphone access...
//         </div>
//       )}

//       <div className="space-x-4 mb-4">
//         {myStream && <button 
//           onClick={sendStreams}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Send Stream
//         </button>}
        
//         {remoteSocketId && <button 
//           onClick={handleCallUser}
//           className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//         >
//           CALL
//         </button>}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {myStream && (
//           <div>
//             <h2 className="text-xl font-bold mb-2">My Stream</h2>
//             <ReactPlayer
//               playing
//               muted
//               height="240px"
//               width="320px"
//               url={myStream}
//             />
//           </div>
//         )}

//         {remoteStream && (
//           <div>
//             <h2 className="text-xl font-bold mb-2">Remote Stream</h2>
//             <ReactPlayer
//               playing
//               muted
//               height="240px"
//               width="320px"
//               url={remoteStream}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RoomPage;