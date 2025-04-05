import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types';

// Socket Context tipleri
interface SocketContextType {
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
  connected: boolean;
}

// Context'i oluştur
export const SocketContext = createContext<SocketContextType>({
  on: () => {},
  off: () => {},
  emit: () => {},
  connected: false
});

// Hook
export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Provider
interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        console.log('Socket bağlantısı kapatılıyor (kullanıcı oturumu kapalı)');
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const setupSocket = async () => {
      try {
        // Token'ı AsyncStorage'dan al
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        if (!token) {
          console.error('Socket bağlantısı için token bulunamadı');
          return;
        }

        // Socket.io bağlantısı kur
        const socketInstance = io(api.defaults.baseURL || 'http://192.168.1.109:5001', {
          transports: ['websocket'],
          auth: {
            token: token
          }
        });

        // Bağlantı olaylarını dinle
        socketInstance.on('connect', () => {
          console.log('Socket.io bağlantısı kuruldu');
          setConnected(true);
        });

        socketInstance.on('connect_error', (err) => {
          console.error('Socket.io bağlantı hatası:', err.message);
          setConnected(false);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('Socket.io bağlantısı kesildi:', reason);
          setConnected(false);
        });

        setSocket(socketInstance);

        return socketInstance;
      } catch (error) {
        console.error('Socket başlatma hatası:', error);
        setConnected(false);
        return null;
      }
    };

    const socketInstance = setupSocket();

    // Temizleme işlevi
    return () => {
      socketInstance.then(socket => {
        if (socket) {
          console.log('SocketProvider temizleniyor');
          socket.disconnect();
        }
      });
    };
  }, [user]);

  // Socket olaylarını dinleme
  const on = (event: string, callback: (data: any) => void) => {
    if (!socket) return;
    socket.on(event, callback);
  };

  // Dinlemeyi durdurma
  const off = (event: string, callback: (data: any) => void) => {
    if (!socket) return;
    socket.off(event, callback);
  };

  // Olay tetikleme
  const emit = (event: string, data: any) => {
    if (!socket) {
      console.warn(`Socket bağlantısı olmadan "${event}" olayı tetiklenemedi.`);
      return;
    }
    socket.emit(event, data);
  };

  return (
    <SocketContext.Provider value={{ on, off, emit, connected }}>
      {children}
    </SocketContext.Provider>
  );
}; 