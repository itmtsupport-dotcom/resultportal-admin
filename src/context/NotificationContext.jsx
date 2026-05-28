import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { fetchUnreadCount } from "../services/api";

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Initialize Socket.IO
  useEffect(() => {
    let socketUrl = window.location.origin;
    try {
      if (import.meta.env.VITE_API_BASE_URL) {
        // If it's a full URL, use origin. If relative, use window.location.origin
        const url = new URL(import.meta.env.VITE_API_BASE_URL, window.location.origin);
        socketUrl = url.origin;
      }
    } catch (e) {
      console.warn("Failed to parse socket URL, using default", e);
    }

    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("newNotification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      newSocket.off("newNotification");
      newSocket.close();
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    const loadCount = async () => {
      try {
        const data = await fetchUnreadCount();
        setUnreadCount(data.count);
      } catch (error) {
        console.error("Failed to fetch unread count", error);
      }
    };
    loadCount();
  }, []);

  const refreshCount = async () => {
    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshCount }}>
      {children}
    </NotificationContext.Provider>
  );
};
