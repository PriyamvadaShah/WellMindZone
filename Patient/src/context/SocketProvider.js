import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  const socketUrl = useMemo(() => "http://localhost:6005", []);

  useEffect(() => {
    let socketInstance;

    try {
      socketInstance = io(socketUrl, {
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket connected:", socketInstance.id);
        setSocket(socketInstance);
      });

      socketInstance.on("connect_error", (err) => {
        console.warn("⚠️ Socket connection error:", err.message);
        setSocket(null); // don't crash UI
      });

      socketInstance.on("disconnect", (reason) => {
        console.warn("⚠️ Socket disconnected:", reason);
      });
    } catch (err) {
      console.error("Socket init error:", err.message);
    }

    return () => {
      socketInstance?.disconnect();
    };
  }, [socketUrl]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
