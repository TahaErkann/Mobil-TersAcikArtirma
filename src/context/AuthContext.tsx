import React, { createContext, useReducer, useEffect } from 'react';
import { AuthContextType, AuthState, User, STORAGE_KEYS } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenValid, getCurrentUser, login as loginService, register as registerService } from '../services/authService';
import { ActivityIndicator, View, Text } from 'react-native';

// Başlangıç durumu - loading false olarak başlatıyoruz
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

// Context oluştur
export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: () => {},
  updateUser: () => {}
});

// Reducer Aksiyonları
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kullanıcı bilgilerini yükleme
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        
        if (token && isTokenValid(token)) {
          dispatch({ type: 'SET_LOADING', payload: true });
          try {
            const user = await getCurrentUser();
            dispatch({ type: 'LOGIN_SUCCESS', payload: user });
          } catch (error) {
            await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
            dispatch({ type: 'LOGIN_FAILURE', payload: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.' });
            console.error('Kullanıcı bilgilerini yüklerken hata:', error);
          }
        }
      } catch (error) {
        console.error('Kullanıcı bilgilerini yüklerken hata:', error);
      }
    };

    loadUser();
  }, []);

  // Her işlem öncesinde hata mesajını temizleme
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Giriş yap
  const login = async (email: string, password: string) => {
    try {
      // Önceki hataları temizle
      clearError();
      
      dispatch({ type: 'SET_LOADING', payload: true });
      const { token, user } = await loginService({ email, password });
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Email veya şifre hatalı.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      console.error('Giriş işlemi başarısız:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Kayıt ol
  const register = async (name: string, email: string, password: string) => {
    try {
      // Önceki hataları temizle
      clearError();
      
      dispatch({ type: 'SET_LOADING', payload: true });
      const { token, user } = await registerService({ name, email, password });
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message || 'Kayıt işlemi başarısız oldu.';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      console.error('Kayıt işlemi başarısız:', errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Çıkış yap
  const logout = async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    dispatch({ type: 'LOGOUT' });
  };

  // Kullanıcı bilgilerini güncelle
  const updateUser = async (user: User) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  // Yükleme durumunda ekranda gösterilecek içerik
  if (state.loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator
          color="#4F46E5"
          size={30}
        />
        <Text style={{ marginTop: 16, color: '#4B5563' }}>Giriş bilgileri kontrol ediliyor...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 