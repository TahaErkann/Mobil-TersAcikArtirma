/**
 * API yapılandırma dosyası
 * Tüm API istekleri için baz URL ve ayarlar
 */

// API baz URL - Gerçek cihazlar için IP adresi ile güncellenmiş
export const API_URL = 'http://192.168.254.112:5001/api';

// API sürüm - API URL zaten /api içerdiği için sürüm bilgisini boş bırakıyoruz
export const API_VERSION = '';

// API tam URL (baz URL + sürüm)
export const API_BASE_URL = API_URL; // Sürüm bilgisi kullanılmıyor

// API istek zaman aşımı (milisaniye)
export const API_TIMEOUT = 30000; // 30 saniye

// Yeniden deneme sayısı
export const API_RETRY_COUNT = 3;

// API ana endpoint'leri
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
  },
  LISTINGS: {
    BASE: '/listings',
    ACTIVE: '/listings/active',
    FEATURED: '/listings/featured',
    LATEST: '/listings/latest',
    BY_CATEGORY: (categoryId: string) => `/listings?category=${categoryId}`,
    BY_USER: (userId: string) => `/listings?user=${userId}`,
    DETAIL: (id: string) => `/listings/${id}`,
    BID: (id: string) => `/listings/${id}/bid`,
    BIDS: (id: string) => `/listings/${id}/bids`,
  },
  CATEGORIES: {
    BASE: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },
  ADMIN: {
    USERS: '/admin/users',
    LISTINGS: '/admin/listings',
    CATEGORIES: '/admin/categories',
    ANALYTICS: '/admin/analytics',
    APPROVE_USER: (id: string) => `/admin/users/${id}/approve`,
    REJECT_USER: (id: string) => `/admin/users/${id}/reject`,
  },
};

// HTTP durum kodları
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

export default {
  API_URL,
  API_VERSION,
  API_BASE_URL,
  API_TIMEOUT,
  API_RETRY_COUNT,
  API_ENDPOINTS,
  HTTP_STATUS,
}; 