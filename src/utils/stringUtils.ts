/**
 * Metni belirli bir uzunlukta kesmek için yardımcı fonksiyon
 * @param text Kesilecek metin
 * @param maxLength Maksimum karakter sayısı
 * @returns Kesilmiş metin
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Metin uzun değilse olduğu gibi döndür, uzunsa kısalt
 * @param text Uzun metin
 * @param length Kısaltılmış metin uzunluğu
 * @returns Kısaltılmış veya orijinal metin
 */
export const shortenText = (text: string, length: number = 50): string => {
  if (!text) return '';
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

/**
 * Slugify - metni URL için uygun hale getirir
 * @param text Dönüştürülecek metin
 * @returns URL-friendly metin
 */
export const slugify = (text: string): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * İlk harfi büyük yapma
 * @param text Dönüştürülecek metin
 * @returns İlk harfi büyük metin
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Para formatı - 1000.50 -> 1,000.50 ₺
 * @param value Sayısal değer
 * @returns Para birimi formatında metin
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Metni HTML'den temizleme
 * @param html HTML içeren metin
 * @returns Temizlenmiş metin
 */
export const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<\/?[^>]+(>|$)/g, '');
};

export default {
  truncateText,
  shortenText,
  slugify,
  capitalizeFirstLetter,
  formatCurrency,
  stripHtml
}; 