import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types';

// API URLs - api.ts dosyasındakiyle aynı olmalı
const API_URLS = {
  ANDROID_EMULATOR: 'http://10.0.2.2:5001',
  IOS_SIMULATOR: 'http://localhost:5001',
  DEVELOPMENT: 'http://192.168.69.112:5001',
  TEST: 'http://192.168.69.112:5001',
};

// Aktif API URL - kendi sunucunuza göre ayarlayın
const ACTIVE_API_URL = API_URLS.TEST;

// Socket Context tipleri
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Context'i oluştur
export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  // Geriye dönük uyumluluk için on, off, emit metodlarını ekle
  const on = (event: string, callback: (data: any) => void) => {
    if (context.socket) {
      context.socket.on(event, callback);
    } else {
      console.warn(`Socket bağlantısı olmadan "${event}" olayı dinlenemedi.`);
    }
  };
  
  const off = (event: string, callback: (data: any) => void) => {
    if (context.socket) {
      context.socket.off(event, callback);
    } else {
      console.warn(`Socket bağlantısı olmadan "${event}" olayı durdurulamadı.`);
    }
  };
  
  const emit = (event: string, data: any) => {
    if (context.socket) {
      context.socket.emit(event, data);
    } else {
      console.warn(`Socket bağlantısı olmadan "${event}" olayı gönderilemedi.`);
    }
  };
  
  // Hem eski hem yeni arayüzü dön
  return {
    ...context,
    on,
    off,
    emit,
    connected: context.isConnected
  };
};

// Provider
interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let socketInstance: Socket | null = null;

    const connectSocket = () => {
      if (isAuthenticated && user) {
        try {
          // Socket.io bağlantısını ana URL'e yap, namespace kullanma
          socketInstance = io(ACTIVE_API_URL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 5000,
            // Namespace yerine auth parametresi ile yetkilendirme
            auth: {
              userId: user._id
            },
            // Otomatik yeniden bağlanma
            reconnection: true,
            // Bağlantı zaman aşımı (30 saniye)
            timeout: 30000,
          });

          socketInstance.on('connect', () => {
            console.log('Socket.io bağlantısı kuruldu');
            setIsConnected(true);
          });

          socketInstance.on('disconnect', (reason) => {
            console.log(`Socket.io bağlantısı kapandı: ${reason}`);
            setIsConnected(false);
          });

          socketInstance.on('connect_error', (error) => {
            console.error('Socket.io bağlantı hatası:', error.message);
            // Bağlantı hataları yok sayılabilir, uygulama çalışmaya devam edebilir
            setIsConnected(false);
          });

          socketInstance.on('error', (error) => {
            console.error('Socket.io hatası:', error);
            setIsConnected(false);
          });

          setSocket(socketInstance);
        } catch (error) {
          console.error('Socket.io başlatma hatası:', error);
          setIsConnected(false);
        }
      } else {
        // Kullanıcı giriş yapmamışsa, socket bağlantısını kapat
        if (socketInstance) {
          console.log('Socket bağlantısı kapatılıyor (kullanıcı oturumu kapalı)');
          socketInstance.disconnect();
          socketInstance = null;
          setSocket(null);
          setIsConnected(false);
        }
      }
    };

    connectSocket();

    // Temizleme işlevi
    return () => {
      if (socketInstance) {
        console.log('SocketProvider temizleniyor');
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}; 