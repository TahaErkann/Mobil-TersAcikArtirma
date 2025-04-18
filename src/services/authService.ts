import api from './api';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types';
import jwt_decode from 'jwt-decode';
import { apiRequest } from './api';

// API hata yönetimi yardımcı fonksiyonu
const handleApiError = (error: any): Error => {
  console.error('API hatası:', error);
  
  // Network hatası
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    return new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
  }
  
  // Axios hata yanıtını kontrol et
  if (error.response) {
    // 401 veya 403 - Yetkilendirme hatası
    if (error.response.status === 401 || error.response.status === 403) {
      return new Error('Yetkiniz yok veya oturum süreniz dolmuş.');
    }
    
    // Hata mesajı varsa kullan
    if (error.response.data?.message) {
      return new Error(error.response.data.message);
    }
    
    // Genel HTTP hatası
    return new Error(`Sunucu hatası: ${error.response.status}`);
  }
  
  // İstek yapıldı ama yanıt alınamadı
  if (error.request) {
    return new Error('Sunucudan yanıt alınamadı.');
  }
  
  // Diğer hatalar
  return new Error(error.message || 'Bir hata oluştu');
};

// Kullanıcı girişi
export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  try {
    console.log('Giriş yapılıyor:', email);
    
    const response = await apiRequest<{ user: User; token: string; message?: string }>(
      'post',
      '/auth/login',
      { email, password }
    );
    
    // Response doğrulama
    if (!response) {
      throw new Error('Sunucudan geçersiz yanıt alındı');
    }
    
    // User kontrolü
    if (!response.user) {
      // API'nin user olmadan token döndüğü durumu kontrol et
      if (response.token) {
        // Token'dan kullanıcı bilgisini almayı dene
        await AsyncStorage.setItem('token', response.token);
        console.log('Token kaydedildi, kullanıcı bilgisi alınıyor...');
        
        try {
          // Token'la kullanıcı bilgisini al
          const userData = await getCurrentUser();
          return { user: userData, token: response.token };
        } catch (userError) {
          console.error('Token ile kullanıcı bilgisi alınamadı:', userError);
          throw new Error('Giriş başarılı ancak kullanıcı bilgileri alınamadı');
        }
      } else {
        throw new Error('Kullanıcı bilgileri alınamadı');
      }
    }
    
    // Token'ı kaydet
    if (response.token) {
      await AsyncStorage.setItem('token', response.token);
      console.log('Token kaydedildi');
    } else {
      throw new Error('Token bilgisi alınamadı');
    }
    
    return {
      user: response.user,
      token: response.token
    };
  } catch (error: any) {
    console.error('Giriş hatası:', error);
    
    // Daha anlaşılır hata mesajları
    if (error.message && (error.message.includes('401') || error.message.includes('yetki'))) {
      throw new Error('E-posta veya şifre hatalı');
    }
    
    throw error;
  }
};

// Kullanıcı kaydı
export const register = async (
  name: string,
  email: string, 
  password: string
): Promise<{ user: User; token: string }> => {
  try {
    console.log('Kayıt yapılıyor:', email);
    
    const response = await apiRequest<{ user: User; token: string }>(
      'post',
      '/auth/register',
      { name, email, password }
    );
    
    // Token'ı kaydet
    if (response.token) {
      await AsyncStorage.setItem('token', response.token);
      console.log('Token kaydedildi');
    }
    
    return response;
  } catch (error: any) {
    console.error('Kayıt başarısız:', error.message);
    
    // Daha anlaşılır hata mesajları
    if (error.message.includes('already exists') || error.message.includes('zaten var')) {
      throw new Error('Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var');
    }
    
    throw error;
  }
};

// Kullanıcı çıkışı
export const logout = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
    console.log('Çıkış başarılı, token silindi');
  } catch (error: any) {
    console.error('Çıkış yapılırken hata:', error.message);
    throw new Error('Çıkış yaparken bir sorun oluştu');
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
    const response = await apiRequest<{ user: User }>('get', '/auth/me');
    return response.user;
  } catch (error: any) {
    console.error('Kullanıcı bilgileri alınamadı:', error.message);
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

// Firmaları getir
export const getAllCompanies = async (): Promise<User[]> => {
  try {
    const response = await api.get('/auth/companies');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Onay bekleyen şirketleri getir
export const getPendingCompanies = async (): Promise<User[]> => {
  try {
    const response = await api.get('/auth/companies/pending');
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Firmayı onayla
export const approveCompany = async (userId: string): Promise<User> => {
  try {
    const response = await api.put(`/auth/companies/${userId}/approve`);
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Firmayı reddet
export const rejectCompany = async (userId: string, reason: string): Promise<User> => {
  try {
    const response = await api.put(`/auth/companies/${userId}/reject`, { reason });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

// Token kontrolü - Kullanıcı giriş yapmış mı?
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    // Token varsa kullanıcı bilgilerini almayı dene
    // Bu işlem başarısız olursa token geçersiz demektir
    await getCurrentUser();
    return true;
  } catch (error) {
    console.log('Kimlik doğrulama başarısız, token geçersiz veya süresi dolmuş');
    await AsyncStorage.removeItem('token');
    return false;
  }
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated
}; 