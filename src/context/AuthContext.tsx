import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import authService from '../services/authService';
import { ActivityIndicator, View, Text } from 'react-native';

// Context tipleri
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'REGISTER_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextProps {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Başlangıç durumu
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Reducer fonksiyonu
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Context oluşturma
export const AuthContext = createContext<AuthContextProps>({
  ...initialState,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// Provider bileşeni
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Sayfa yüklenirken kullanıcı oturumunu kontrol et
  useEffect(() => {
    const loadUser = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Token var mı ve geçerli mi kontrol et
        const isAuth = await authService.isAuthenticated();
        
        if (isAuth) {
          try {
            // Kullanıcı bilgilerini al
            const user = await authService.getCurrentUser();
            const token = await AsyncStorage.getItem('token');
            
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token: token || '' },
            });
          } catch (userError) {
            console.error('Kullanıcı bilgileri alınamadı:', userError);
            // Kullanıcı bilgisi alınamadıysa sessiz kalmak yerine
            // token'ı temizle ve kullanıcı oturumunu kapat
            await AsyncStorage.removeItem('token');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        // Hata mesajını gösterme ancak kullanıcı oturumunu kapat
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadUser();
  }, []);

  // Login fonksiyonu
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' }); // Önceki hataları temizle
      
      // authService ile giriş yap
      const data = await authService.login(email, password);
      
      if (!data || !data.user || !data.token) {
        throw new Error('Geçersiz giriş yanıtı: Kullanıcı veya token bilgisi eksik');
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data,
      });
    } catch (error: any) {
      console.error('Giriş başarısız:', error);
      
      // Hata mesajını daha kullanıcı dostu yap
      let errorMessage = 'Giriş yapılırken bir sorun oluştu';
      
      if (error.message?.includes('E-posta veya şifre')) {
        errorMessage = 'Hatalı e-posta veya şifre girdiniz';
      } else if (error.message?.includes('Kullanıcı bilgileri alınamadı')) {
        errorMessage = 'Kullanıcı bilgileri alınamadı, lütfen tekrar deneyin';
      } else if (error.message?.includes('internet')) {
        errorMessage = 'İnternet bağlantınızı kontrol edin';
      }
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Register fonksiyonu
  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' }); // Önceki hataları temizle
      
      // authService ile kayıt ol
      const data = await authService.register(name, email, password);
      
      if (!data || !data.user || !data.token) {
        throw new Error('Geçersiz kayıt yanıtı: Kullanıcı veya token bilgisi eksik');
      }
      
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: data,
      });
    } catch (error: any) {
      console.error('Kayıt başarısız:', error);
      
      // Hata mesajını daha kullanıcı dostu yap
      let errorMessage = 'Kayıt olurken bir sorun oluştu';
      
      if (error.message?.includes('zaten var')) {
        errorMessage = 'Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var';
      } else if (error.message?.includes('geçerli')) {
        errorMessage = 'Lütfen geçerli bir e-posta adresi girin';
      } else if (error.message?.includes('internet')) {
        errorMessage = 'İnternet bağlantınızı kontrol edin';
      } else if (error.message?.includes('şifre')) {
        errorMessage = error.message; // Şifre ile ilgili hatayı doğrudan göster
      }
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage,
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout fonksiyonu
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error: any) {
      console.error('Çıkış hatası:', error.message);
    }
  };

  // Hata temizleme
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Yükleme durumunda ekranda gösterilecek içerik
  if (state.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator
          color="#4F46E5"
          size={52}
        />
        <Text style={{ marginTop: 16, color: '#4B5563' }}>Giriş bilgileri kontrol ediliyor...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 