import api from './api';
import { Listing, ApiResponse } from '../types';

// İlanları getir - İsteğe bağlı kategori filtresi ile
export const getAllListings = async (categoryId?: string): Promise<Listing[]> => {
  try {
    // Kategori ID'si varsa, buna göre filtrele
    const endpoint = categoryId 
      ? `/listings?category=${categoryId}` 
      : '/listings';
      
    const response = await api.get(endpoint);
    // API yanıt formatına göre kontrol et
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.warn('API listing format uyumsuzluğu:', response.data);
    // En kötü durumda boş array dön
    return [];
  } catch (error: any) {
    console.error('İlanlar alınırken hata:', error);
    throw new Error(error.response?.data?.message || 'İlanlar yüklenirken bir hata oluştu');
  }
};

// Admin için ilanları getir (onay bekleyenler dahil)
export const getAdminListings = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/admin/listings');
    return response.data.data || [];
  } catch (error: any) {
    // Admin endpoint yoksa normal listeyi kullan
    try {
      return await getAllListings();
    } catch (innerError: any) {
      console.error('Admin ilanları alınırken hata:', innerError);
      throw new Error(innerError.message || 'Admin ilanları alınırken bir hata oluştu');
    }
  }
};

// İlanı ID'ye göre getir
export const getListingById = async (id: string): Promise<Listing> => {
  try {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`${id} ID'li ilan getirilirken hata:`, error);
    throw error;
  }
};

// Kullanıcının kendi ilanlarını getir
export const getMyListings = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/listings/user/mylistings');
    return response.data;
  } catch (error) {
    console.error('Kullanıcı ilanları getirilirken hata:', error);
    throw error;
  }
};

// Kullanıcının teklif verdiği ilanları getir
export const getMyBids = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/listings/user/mybids');
    return response.data;
  } catch (error) {
    console.error('Kullanıcı teklifleri getirilirken hata:', error);
    throw error;
  }
};

// İlanı iptal et
export const cancelListing = async (id: string): Promise<Listing> => {
  try {
    const response = await api.put(`/listings/${id}/cancel`);
    return response.data.listing;
  } catch (error) {
    console.error('İlan iptal edilirken hata:', error);
    throw error;
  }
};

// İlana teklif ver
export const placeBid = async (id: string, price: number): Promise<any> => {
  try {
    const response = await api.post(`/listings/${id}/bid`, { price });
    return response.data;
  } catch (error) {
    console.error('Teklif verilirken hata:', error);
    throw error;
  }
};

// İlanı tamamla/reddet
export const completeListing = async (id: string, accept: boolean): Promise<Listing> => {
  try {
    const response = await api.put(`/listings/${id}/complete`, { accept });
    return response.data.listing;
  } catch (error) {
    console.error('İlan tamamlanırken hata:', error);
    throw error;
  }
};

// İlan onaylama
export const approveListing = async (listingId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.put(`/admin/listings/${listingId}/approve`);
    return response.data;
  } catch (error: any) {
    console.error('İlan onaylanırken hata:', error);
    throw new Error(error.message || 'İlan onaylanırken bir hata oluştu');
  }
};

// İlan reddetme/silme
export const rejectListing = async (listingId: string): Promise<ApiResponse<any>> => {
  try {
    const response = await api.delete(`/admin/listings/${listingId}`);
    return response.data;
  } catch (error: any) {
    console.error('İlan reddedilirken hata:', error);
    throw new Error(error.message || 'İlan reddedilirken bir hata oluştu');
  }
};

// İlan güncelleme
export const updateListing = async (listingId: string, data: Partial<Listing>): Promise<ApiResponse<Listing>> => {
  try {
    const response = await api.put(`/listings/${listingId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('İlan güncellenirken hata:', error);
    throw new Error(error.message || 'İlan güncellenirken bir hata oluştu');
  }
};

// Yeni ilan oluşturma
export const createListing = async (data: Partial<Listing>): Promise<ApiResponse<Listing>> => {
  try {
    const response = await api.post('/listings', data);
    return response.data;
  } catch (error: any) {
    console.error('İlan oluşturulurken hata:', error);
    throw new Error(error.message || 'İlan oluşturulurken bir hata oluştu');
  }
};

// İlanı sil
export const deleteListing = async (id: string): Promise<void> => {
  try {
    await api.delete(`/listings/${id}`);
  } catch (error) {
    console.error('İlan silinirken hata:', error);
    throw error;
  }
}; 