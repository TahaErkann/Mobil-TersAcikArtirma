import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types';
import { Platform } from 'react-native';

// MongoDB Atlas sunucusuna bağlantı için API URL'leri
// Gerçek cihaz veya farklı ağlardaki testlerde güncelleyin
let API_URL = 'http://192.168.1.109:5001/api'; // Varsayılan (Wi-Fi aynı ağda ise)

// Platform ve ortama göre doğru URL'yi belirle
if (__DEV__) {
  // Geliştirme ortamındayız
  if (Platform.OS === 'android') {
    // Android emülatör için özel IP adresi
    API_URL = 'http://192.168.1.100:5001/api'; // Kendi IP adresinizi kullanın
  } else if (Platform.OS === 'ios') {
    // iOS simulator için localhost
    API_URL = 'http://localhost:5001/api';
  }
  
  console.log(`[DEV] ${Platform.OS} için API adresi: ${API_URL}`);
} else {
  // Production ortamındayız - Gerçek sunucu adresi
  API_URL = 'https://ters-acik-artirma-api.vercel.app/api';
  console.log(`[PROD] API adresi: ${API_URL}`);
}

// Socket.IO bağlantısı için HTTP URL'i (API yolunu içermez)
export const API_BASE_URL = API_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 saniye timeout ekle
});

// Her istekte token ekleyen interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('API isteği:', config.url, config.method);
      return config;
    } catch (error) {
      console.error('Token alma hatası:', error);
      return config;
    }
  },
  (error) => {
    console.error('İstek interceptor hatası:', error);
    return Promise.reject(error);
  }
);

// Token süresi dolduğunda otomatik çıkış yapan interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API yanıtı:', response.status, response.config?.url);
    return response;
  },
  async (error) => {
    console.error('API hata yanıtı:', 
      error.response?.status, 
      error.response?.data, 
      error.config?.url,
      error.message // Timeout gibi ağ hatalarını da logla
    );
    
    if (error.response && error.response.status === 401) {
      console.log('401 hatası, token temizleniyor');
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      // Burada navigasyon yönlendirmesi yapılabilir
    }
    return Promise.reject(error);
  }
);

export default api; 