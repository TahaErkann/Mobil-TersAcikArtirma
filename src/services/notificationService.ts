import api from './api';
import { Notification, NotificationResponse } from '../types';

/**
 * Kullanıcının bildirimlerini getirir
 */
export const getUserNotifications = async (page = 1, limit = 10): Promise<NotificationResponse> => {
  try {
    const response = await api.get(`/notifications?page=${page}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Bildirimler alınırken hata:', error);
    throw error;
  }
};

/**
 * Okunmamış bildirim sayısını getirir
 */
export const getUnreadCount = async (): Promise<number> => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data.data.count;
  } catch (error) {
    console.error('Okunmamış bildirim sayısı alınırken hata:', error);
    throw error;
  }
};

/**
 * Bildirimi okundu olarak işaretler
 */
export const markAsRead = async (notificationId: string): Promise<Notification> => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data.data;
  } catch (error) {
    console.error('Bildirim okundu olarak işaretlenirken hata:', error);
    throw error;
  }
};

/**
 * Tüm bildirimleri okundu olarak işaretler
 */
export const markAllAsRead = async (): Promise<{ updated: number }> => {
  try {
    const response = await api.put('/notifications/mark-all-read');
    return response.data.data;
  } catch (error) {
    console.error('Tüm bildirimler okundu olarak işaretlenirken hata:', error);
    throw error;
  }
};

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
}; 