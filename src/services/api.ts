import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URLs - bunları kendi ortamınıza göre değiştirin
const API_URLS = {
  // Android Emülatör için
  ANDROID_EMULATOR: 'http://10.0.2.2:5001/api',
  
  // iOS Simulator için
  IOS_SIMULATOR: 'http://localhost:5001/api',
  
  // Development ortamı için (kendi IP adresiniz)
  DEVELOPMENT: 'http://192.168.69.112:5001/api',
  
  // Test ortamı için (sabit IP)
  TEST: 'http://192.168.69.112:5001/api',
};

// Aktif API URL - kendi sunucunuza göre ayarlayın
const ACTIVE_API_URL = API_URLS.TEST;

// API bağlantı kontrolü
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    console.log('API sunucusu bağlantı kontrolü başlatılıyor...');
    
    // Health endpoint'i kontrol et
    const response = await axios.get(`${ACTIVE_API_URL.replace('/api', '')}/auth/health`, { 
      timeout: 5000 
    });
    
    if (response.status === 200) {
      console.log(`✅ ${ACTIVE_API_URL.replace('/api', '')} adresine başarıyla bağlanıldı!`);
      return true;
    }
    
    return false;
  } catch (error: any) {
    console.log(`❌ ${ACTIVE_API_URL.replace('/api', '')} adresine bağlanılamadı: ${error.code || error.message}`);
    return false;
  }
};

// Ana API instance oluştur
const api = axios.create({
  baseURL: ACTIVE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - her istekte token ekler
api.interceptors.request.use(
  async (config) => {
    // Token varsa ekle
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // API URL'i logla
    console.log(`API isteği: ${config.url} ${config.method} ${config.baseURL}`);
    
    return config;
  },
  (error) => {
    console.error('API istek hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - yetkilendirme hatalarını yakalar
api.interceptors.response.use(
  (response) => {
    // Başarılı yanıtları logla
    console.log(`API yanıtı: ${response.status} ${response.config.url}`);
    
    if (response.status >= 200 && response.status < 300) {
      console.log(`API yanıtı başarılı: ${response.status}`, response.data ? JSON.stringify(response.data).substring(0, 150) + '...' : '');
    }
    
    return response;
  },
  async (error: AxiosError) => {
    if (error.response) {
      console.error(`API hata yanıtı: ${error.response.status} ${JSON.stringify(error.response.data)} ${error.config?.url}`, error.message);
      
      // 401 Unauthorized hatası - token süresi doldu
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('token'); // Token'ı temizle
        // Burada istersen login sayfasına yönlendirme yapabilirsin
      }
    } else if (error.request) {
      // İstek yapıldı ama yanıt alınamadı - network hatası
      console.error('NETWORK HATASI: Sunucuya erişilemiyor!', error.config);
      console.error('Sunucu çalışıyor mu kontrol edilmeli: npm run dev');
    } else {
      // İstek yapılamadı
      console.error('API istek hatası:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API istekleri için yardımcı fonksiyon
export const apiRequest = async <T>(
  method: 'get' | 'post' | 'put' | 'delete', 
  url: string, 
  data?: any,
  params?: any
): Promise<T> => {
  try {
    console.log('API URL:', ACTIVE_API_URL);
    
    const response = await api.request({
      method,
      url,
      data,
      params
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      // HTTP hata yanıtı
      const status = error.response.status;
      
      if (status === 400) {
        throw new Error('Geçersiz istek: ' + (error.response.data?.message || 'Hatalı bir istek yapıldı'));
      } else if (status === 401) {
        throw new Error('Yetkilendirme hatası: Lütfen tekrar giriş yapın');
      } else if (status === 403) {
        throw new Error('Erişim izniniz yok');
      } else if (status === 404) {
        throw new Error('Kaynak bulunamadı: ' + (error.response.data?.message || 'İstenen kaynak sunucuda bulunamadı'));
      } else if (status === 500) {
        throw new Error('Sunucu hatası: ' + (error.response.data?.message || 'Sunucuda bir sorun oluştu'));
      } else {
        throw new Error(`Sunucu hatası (${status}): ` + (error.response.data?.message || 'Bir sorun oluştu'));
      }
    } else if (error.request) {
      // Network hatası - sunucuya ulaşılamadı
      console.error('NETWORK HATASI: API sunucusuna erişilemiyor');
      throw new Error('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı ve sunucunun çalıştığından emin olun.');
    } else {
      // Diğer hatalar
      throw new Error('API isteği yapılırken bir hata oluştu: ' + error.message);
    }
  }
};

export default api; 