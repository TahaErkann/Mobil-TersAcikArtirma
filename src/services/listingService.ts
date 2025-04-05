import api from './api';
import { Listing } from '../types';

// Tüm ilanları getir
export const getAllListings = async (categoryId?: string): Promise<Listing[]> => {
  try {
    const url = categoryId ? `/listings?category=${categoryId}` : '/listings';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('İlanlar getirilirken hata:', error);
    throw error;
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

// Yeni ilan oluştur
export const createListing = async (listingData: any): Promise<Listing> => {
  try {
    const response = await api.post('/listings', listingData);
    return response.data.listing;
  } catch (error) {
    console.error('İlan oluşturulurken hata:', error);
    throw error;
  }
};

// İlanı güncelle
export const updateListing = async (id: string, listingData: any): Promise<Listing> => {
  try {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data.listing;
  } catch (error) {
    console.error('İlan güncellenirken hata:', error);
    throw error;
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