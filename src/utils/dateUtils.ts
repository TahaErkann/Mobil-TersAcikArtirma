import { 
  formatDistanceToNow, 
  formatRelative, 
  format, 
  differenceInSeconds, 
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  isValid,
  parseISO,
  isAfter,
  isPast
} from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Bir tarihin görüntülenecek formatını oluşturur
 * @param dateString ISO tarih string'i
 * @returns Formatlanmış tarih
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Geçersiz Tarih';
    return format(date, 'dd MMMM yyyy', { locale: tr });
  } catch (error) {
    console.error('Tarih formatı hatası:', error);
    return 'Geçersiz Tarih';
  }
};

/**
 * Bir tarihin saat ve dakikasını oluşturur
 * @param dateString ISO tarih string'i
 * @returns Formatlanmış saat
 */
export const formatTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Geçersiz Saat';
    return format(date, 'HH:mm', { locale: tr });
  } catch (error) {
    console.error('Saat formatı hatası:', error);
    return 'Geçersiz Saat';
  }
};

/**
 * Bir tarihin tam formatını oluşturur (tarih + saat)
 * @param dateString ISO tarih string'i
 * @returns Formatlanmış tarih ve saat
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Geçersiz Tarih';
    return format(date, 'dd MMMM yyyy HH:mm', { locale: tr });
  } catch (error) {
    console.error('Tarih ve saat formatı hatası:', error);
    return 'Geçersiz Tarih';
  }
};

/**
 * Verilen tarihten şimdiye kadar geçen süreyi gösterir (1 saat önce, 2 gün önce gibi)
 * @param dateString ISO tarih string'i
 * @returns Geçen süre (1 saat önce gibi)
 */
export const formatRelativeTime = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Geçersiz Tarih';
    return formatDistanceToNow(date, { addSuffix: true, locale: tr });
  } catch (error) {
    console.error('Göreceli zaman formatı hatası:', error);
    return 'Geçersiz Tarih';
  }
};

/**
 * Kalan süreyi biçimlendirir (1s, 2d, 5sa gibi)
 * @param endTimeString ISO tarih string'i
 * @returns Kalan süre
 */
export const formatRemainingTime = (endTimeString: string): string => {
  try {
    const endTime = parseISO(endTimeString);
    if (!isValid(endTime)) return 'Geçersiz Tarih';
    
    const now = new Date();
    
    // Bitiş tarihi geçtiyse
    if (isPast(endTime)) {
      return 'Süresi Doldu';
    }
    
    const diffSeconds = differenceInSeconds(endTime, now);
    const diffMinutes = differenceInMinutes(endTime, now);
    const diffHours = differenceInHours(endTime, now);
    const diffDays = differenceInDays(endTime, now);
    
    if (diffDays > 0) {
      return `${diffDays} gün`;
    } else if (diffHours > 0) {
      return `${diffHours} saat`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} dakika`;
    } else {
      return `${diffSeconds} saniye`;
    }
  } catch (error) {
    console.error('Kalan süre formatı hatası:', error);
    return 'Geçersiz Tarih';
  }
};

/**
 * Verilen bir tarih string'inin geçerli olup olmadığını kontrol eder
 * @param dateString ISO tarih string'i
 * @returns Boolean - tarih geçerli mi?
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    return isValid(date);
  } catch (error) {
    return false;
  }
};

/**
 * Verilen tarihin gelecekte olup olmadığını kontrol eder
 * @param dateString ISO tarih string'i
 * @returns Boolean - tarih gelecekte mi?
 */
export const isFutureDate = (dateString: string): boolean => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return false;
    return isAfter(date, new Date());
  } catch (error) {
    return false;
  }
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatRemainingTime,
  isValidDate,
  isFutureDate
}; 