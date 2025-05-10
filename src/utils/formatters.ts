import { formatDistanceToNow, format, isPast as dateFnIsPast } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Tarihi formatlar (gün, ay, yıl, saat)
 * @param dateStr Tarih string'i
 * @param formatStr Format string'i
 * @returns Formatlanmış tarih string'i
 */
export const safeFormatDate = (dateStr: string | undefined | null, formatStr: string = 'dd MMMM yyyy, HH:mm'): string => {
  if (!dateStr) return "Belirtilmemiş";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error("Geçersiz tarih formatı:", dateStr);
      return "Geçersiz tarih";
    }
    return format(date, formatStr, { locale: tr });
  } catch (error) {
    console.error("Tarih formatı hatası:", error);
    return "Geçersiz tarih";
  }
};

/**
 * Tarihi şimdiki zamana göre formatlar (örn: 3 saat önce)
 * @param dateStr Tarih string'i
 * @returns Şimdiki zamana göre formatlanmış tarih string'i
 */
export const safeFormatDistanceToNow = (dateStr: string | undefined | null): string => {
  if (!dateStr) return "Belirtilmemiş";
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error("Geçersiz tarih formatı:", dateStr);
      return "Geçersiz tarih";
    }
    return formatDistanceToNow(date, { locale: tr, addSuffix: true });
  } catch (error) {
    console.error("Tarih formatı hatası:", error);
    return "Geçersiz tarih";
  }
};

/**
 * Tarih geçmiş mi kontrol eder
 * @param dateStr Tarih string'i
 * @returns Boolean
 */
export const safeIsPast = (dateStr: string | undefined | null): boolean => {
  if (!dateStr) return false;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error("Geçersiz tarih formatı:", dateStr);
      return false;
    }
    return dateFnIsPast(date);
  } catch (error) {
    console.error("Tarih kontrol hatası:", error);
    return false;
  }
};

/**
 * Teklif durumuna göre renk döndürür
 * @param status Teklif durumu (pending, accepted, rejected, expired)
 * @param isExpired Süresinin dolup dolmadığı
 * @returns Renk hex kodu
 */
export const getBidStatusColor = (status: string, isExpired: boolean): string => {
  if (isExpired && status === 'pending') return '#9CA3AF'; // Gri
  
  switch (status) {
    case 'accepted': return '#10B981'; // Yeşil
    case 'rejected': return '#EF4444'; // Kırmızı
    case 'expired': return '#9CA3AF'; // Gri
    case 'pending': return '#3B82F6'; // Mavi
    default: return '#6B7280'; // Gri
  }
};

/**
 * Teklif durumunun metin açıklamasını döndürür
 * @param status Teklif durumu (pending, accepted, rejected, expired)
 * @param isExpired Süresinin dolup dolmadığı
 * @returns Durum açıklaması
 */
export const getBidStatusText = (status: string, isExpired: boolean): string => {
  switch (status) {
    case 'pending':
      return isExpired ? 'Süresi Doldu' : 'Beklemede';
    case 'accepted':
      return 'Kabul Edildi';
    case 'rejected':
      return 'Reddedildi';
    default:
      return status;
  }
}; 