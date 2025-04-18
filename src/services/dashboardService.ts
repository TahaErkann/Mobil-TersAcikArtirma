import { apiRequest } from './api';
import { getAllUsers } from './authService';
import { getAllListings } from './listingService';
import { getAllCategories } from './categoryService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  totalListings: number;
  pendingListings: number;
  activeListings: number;
  completedListings: number;
  totalCategories: number;
  totalBids: number;
}

// API endpoint kontrol anahtarı
const DASHBOARD_API_DISABLED_KEY = 'dashboard_api_disabled';

/**
 * Admin paneli için istatistikler alır
 * API endpoint'i çalışmadığından doğrudan manuel hesaplama yapar
 */
export const getStats = async (): Promise<Stats> => {
  try {
    // API'yi kullanmadan direkt manuel hesaplama yap
    // Bu endpoint backend'de mevcut olmadığından gereksiz istekler göndermeyelim
    return await calculateStatsManually();
  } catch (error) {
    console.error('İstatistik hesaplama hatası:', error);
    
    // Hata durumunda boş değerler dön
    return {
      totalUsers: 0,
      pendingUsers: 0,
      activeUsers: 0,
      totalListings: 0,
      pendingListings: 0,
      activeListings: 0,
      completedListings: 0,
      totalCategories: 0,
      totalBids: 0
    };
  }
};

/**
 * Kullanıcı sayısı, ilan sayısı ve kategori sayısı üzerinden
 * istatistikleri manuel olarak hesaplar
 */
const calculateStatsManually = async (): Promise<Stats> => {
  try {
    console.log('İstatistikler manuel olarak hesaplanıyor...');
    
    // Tüm servislere paralel istek gönder
    const [users, listings, categories] = await Promise.all([
      getAllUsers().catch(err => {
        console.error('Kullanıcı listesi alınamadı:', err);
        return [];
      }),
      getAllListings().catch(err => {
        console.error('İlan listesi alınamadı:', err);
        return [];
      }),
      getAllCategories().catch(err => {
        console.error('Kategori listesi alınamadı:', err);
        return [];
      })
    ]);
    
    // Her bir hata için geri dönüş değeri sağlandığından, burada sıfır kontrolü yapmamıza gerek yok
    
    // Kullanıcı istatistikleri
    const pendingUsers = users.filter(u => !u.isApproved && !u.isRejected).length;
    const activeUsers = users.filter(u => u.isApproved).length;
    
    // İlan istatistikleri
    const pendingListings = listings.filter(l => l.status && l.status.toString().toLowerCase() === 'pending' || !l.isApproved).length;
    const activeListings = listings.filter(l => l.status && l.status.toString().toLowerCase() === 'active' && l.isApproved).length;
    const completedListings = listings.filter(l => l.status && l.status.toString().toLowerCase() === 'completed').length;
    
    // Toplam teklif sayısı
    const totalBids = listings.reduce((total, listing) => total + (listing.bids?.length || 0), 0);
    
    console.log('İstatistikler manuel olarak hesaplandı');
    
    return {
      totalUsers: users.length,
      pendingUsers,
      activeUsers,
      totalListings: listings.length,
      pendingListings,
      activeListings,
      completedListings,
      totalCategories: categories.length,
      totalBids
    };
  } catch (error) {
    console.error('Manuel istatistik hesaplama hatası:', error);
    
    // Hata durumunda varsayılan değerler döndür
    return {
      totalUsers: 0,
      pendingUsers: 0,
      activeUsers: 0,
      totalListings: 0,
      pendingListings: 0,
      activeListings: 0,
      completedListings: 0,
      totalCategories: 0,
      totalBids: 0
    };
  }
}; 