import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io } from "socket.io-client";

// Create the context
const SocketContext = createContext(null);

// Hook to use socket
export const useSocket = () => useContext(SocketContext);

// Provider
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null);

  const socketUrl = useMemo(() => "http://localhost:6005", []);

  useEffect(() => {
    let socketServer;

    try {
      socketServer = io(socketUrl, {
        transports: ["websocket", "polling"],
      });

      socketServer.on("connect", () => {
        console.log("✅ Socket connected:", socketServer.id);
        setSocket(socketServer);
        setError(null);
      });

      socketServer.on("connect_error", (err) => {
        console.warn("⚠️ Socket connection failed:", err.message);
        setError("WebSocket unavailable. Some features may not work.");
      });

      socketServer.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        if (reason === "io server disconnect") {
          socketServer.connect(); // try reconnecting
        }
      });
    } catch (err) {
      console.warn("Socket init error:", err);
      setError("WebSocket init failed.");
    }

    return () => {
      socketServer?.disconnect();
    };
  }, [socketUrl]);

  return (
    <SocketContext.Provider value={socket}>
      <>
        {error && (
          <div className="bg-yellow-100 text-yellow-800 border border-yellow-400 p-2 text-sm text-center">
            ⚠️ {error}
          </div>
        )}
        {children}
      </>
    </SocketContext.Provider>
  );
};
