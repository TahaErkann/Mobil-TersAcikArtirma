import api from './api';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types';
import jwt_decode from 'jwt-decode';

// Kullanıcı kaydı
export const register = async (userData: { name: string, email: string, password: string }): Promise<{ token: string, user: User }> => {
  try {
    console.log('Kayıt isteği gönderiliyor:', userData.email);
    const response = await api.post('/auth/register', userData);
    
    // Response kontrolü
    if (!response.data || !response.data.token || !response.data.user) {
      console.error('Sunucu yanıtı geçersiz:', response.data);
      throw new Error('Sunucu yanıtı geçersiz format içeriyor');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Kayıt hatası:', error);
    
    // Ağ hatası
    if (error.code === 'ECONNABORTED') {
      throw new Error('Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.');
    }
    
    // Axios hata yanıtını kontrol et
    if (error.response) {
      // Sunucu tarafından dönen hata
      console.error('Sunucu hatası:', error.response.status, error.response.data);
      
      // 400 hatası - Email zaten kullanımda
      if (error.response.status === 400) {
        throw new Error(error.response.data?.message || 'Bu email adresi zaten kullanımda');
      }
      
      // 422 hatası - Doğrulama hatası
      if (error.response.status === 422) {
        throw new Error(error.response.data?.message || 'Girilen bilgiler geçersiz');
      }
      
      // 500 hatası - Sunucu hatası
      if (error.response.status === 500) {
        throw new Error(error.response.data?.message || 'Sunucu hatası oluştu');
      }
      
      // Diğer HTTP hatası
      throw new Error(error.response.data?.message || `Sunucu hatası: ${error.response.status}`);
    }
    
    // Axios olmayan hata
    if (error.request) {
      throw new Error('Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
    
    // Genel hata
    throw new Error(error.message || 'Kayıt işlemi sırasında bir hata oluştu');
  }
};

// Kullanıcı girişi
export const login = async (credentials: { email: string, password: string }): Promise<{ token: string, user: User }> => {
  try {
    console.log('Giriş isteği gönderiliyor:', credentials.email);
    const response = await api.post('/auth/login', credentials);
    
    // Response kontrolü
    if (!response.data || !response.data.token || !response.data.user) {
      console.error('Sunucu yanıtı geçersiz:', response.data);
      throw new Error('Sunucu yanıtı geçersiz format içeriyor');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Giriş hatası:', error);
    
    // Ağ hatası
    if (error.code === 'ECONNABORTED') {
      throw new Error('Bağlantı zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.');
    }
    
    // Axios hata yanıtını kontrol et
    if (error.response) {
      // Sunucu tarafından dönen hata
      console.error('Sunucu hatası:', error.response.status, error.response.data);
      
      // 404 hatası - Kullanıcı bulunamadı
      if (error.response.status === 404) {
        throw new Error(error.response.data?.message || 'Kullanıcı bulunamadı');
      }
      
      // 401 hatası - Geçersiz şifre
      if (error.response.status === 401) {
        throw new Error(error.response.data?.message || 'Şifre hatalı');
      }
      
      // 422 hatası - Doğrulama hatası
      if (error.response.status === 422) {
        throw new Error(error.response.data?.message || 'Geçersiz email formatı');
      }
      
      // 500 hatası - Sunucu hatası
      if (error.response.status === 500) {
        throw new Error(error.response.data?.message || 'Sunucu hatası oluştu');
      }
      
      // Diğer HTTP hatası
      throw new Error(error.response.data?.message || `Sunucu hatası: ${error.response.status}`);
    }
    
    // Axios olmayan hata 
    if (error.request) {
      throw new Error('Sunucudan yanıt alınamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
    
    // Genel hata
    throw new Error(error.message || 'Giriş işlemi sırasında bir hata oluştu');
  }
};

// Token'dan kullanıcı bilgilerini çöz
export const decodeToken = (token: string): { userId: string, exp: number } => {
  return jwt_decode<{ userId: string, exp: number }>(token);
};

// Token'in geçerliliğini kontrol et
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

// Mevcut kullanıcı bilgilerini getir
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error: any) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    
    // Token artık geçerli değil
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      throw new Error('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
    }
    
    throw error;
  }
};

// Profil bilgilerini güncelle
export const updateProfile = async (profileData: Partial<User['companyInfo']>): Promise<User> => {
  const response = await api.put('/auth/profile', profileData);
  return response.data.user;
};

// Admin: Tüm kullanıcıları listele
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get('/auth/users');
  return response.data;
};

// Admin: Kullanıcıyı onayla
export const approveUser = async (userId: string): Promise<User> => {
  const response = await api.put(`/auth/users/${userId}/approve`);
  return response.data.user;
};

// Admin: Kullanıcıyı reddet
export const rejectUser = async (userId: string, reason: string): Promise<User> => {
  const response = await api.put(`/auth/users/${userId}/reject`, { reason });
  return response.data.user;
}; 