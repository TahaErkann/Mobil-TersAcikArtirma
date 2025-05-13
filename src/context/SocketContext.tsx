import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import Toast from 'react-native-toast-message';

// Sabit olarak cihazlarda çalışacak IP adresi
const SOCKET_URL = 'http://192.168.254.112:5001';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    let socketInstance: Socket | null = null;

    if (user && token) {
      try {
        console.log('Socket.io bağlantısı kuruluyor:', SOCKET_URL);
        
        socketInstance = io(SOCKET_URL, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          auth: {
            token: token
          }
        });

        socketInstance.on('connect', () => {
          console.log('Socket.io bağlantısı kuruldu');
          setConnected(true);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket.io bağlantısı kesildi:', reason);
          setConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
          console.error('Socket.io bağlantı hatası:', error);
          Toast.show({
            type: 'error',
            text1: 'Bağlantı Hatası',
            text2: 'Gerçek zamanlı güncellemeler alınamıyor.'
          });
          setConnected(false);
        });

        setSocket(socketInstance);
      } catch (error) {
        console.error("Socket bağlantısı oluşturulamadı:", error);
        Toast.show({
          type: 'error',
          text1: 'Bağlantı Hatası',
          text2: 'Gerçek zamanlı bağlantı kurulamadı.'
        });
      }
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        setSocket(null);
        setConnected(false);
      }
    };
  }, [user, token]);

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const emit = (event: string, data: any) => {
    if (socket && connected) {
      socket.emit(event, data);
    } else {
      console.warn(`Socket bağlantısı olmadan "${event}" olayı tetiklenemedi.`);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, on, off, emit }}>
      {children}
    </SocketContext.Provider>
  );
}; 