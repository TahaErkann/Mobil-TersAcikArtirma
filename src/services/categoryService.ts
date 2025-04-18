import api from './api';
import { Category } from '../types';

/**
 * Tüm kategorileri getir
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    throw new Error('Kategoriler yüklenirken bir hata oluştu');
  }
};

/**
 * ID'ye göre kategori getir
 */
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Kategori detay hatası:', error);
    throw new Error('Kategori detayı yüklenirken bir hata oluştu');
  }
};

/**
 * Yeni kategori oluştur
 */
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  try {
    const response = await api.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Kategori oluşturma hatası:', error);
    throw new Error('Kategori oluşturulurken bir hata oluştu');
  }
};

/**
 * Kategori güncelle
 */
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  try {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    throw new Error('Kategori güncellenirken bir hata oluştu');
  }
};

/**
 * Kategori sil
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`/categories/${id}`);
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    throw new Error('Kategori silinirken bir hata oluştu');
  }
};

/**
 * Kategori durumunu değiştir (aktif/pasif)
 */
export const toggleCategoryStatus = async (id: string): Promise<Category> => {
  try {
    const response = await api.patch(`/categories/${id}/toggle-status`);
    return response.data;
  } catch (error) {
    console.error('Kategori durumu değiştirme hatası:', error);
    throw new Error('Kategori durumu değiştirilirken bir hata oluştu');
  }
}; 