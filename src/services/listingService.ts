import api, { apiRequest } from './api';
import { Listing, ApiResponse, Bid, ListingItem } from '../types';

/**
 * Tüm ilanları getir
 */
export const getAllListings = async (): Promise<Listing[]> => {
  try {
    // Direkt API istek fonksiyonunu kullan
    const data = await apiRequest<Listing[]>('get', '/listings');
    return data;
  } catch (error) {
    console.error('İlan listeleme hatası:', error);
    throw new Error('İlanlar yüklenirken bir hata oluştu');
  }
};

/**
 * Kategori ID'sine göre ilanları getir
 */
export const getListingsByCategory = async (categoryId: string): Promise<Listing[]> => {
  try {
    const data = await apiRequest<Listing[]>('get', `/listings/category/${categoryId}`);
    return data;
  } catch (error) {
    console.error('Kategoriye göre ilan listeleme hatası:', error);
    throw new Error('İlanlar yüklenirken bir hata oluştu');
  }
};

/**
 * ID'ye göre ilan detayını getir
 * @param id İlan ID'si
 * @param includeFullDetails true ise, teklif veren kullanıcıların tüm bilgilerini (email, phone, address) dahil eder
 */
export const getListingById = async (id: string, includeFullDetails: boolean = false): Promise<Listing> => {
  try {
    console.log(`İlan detayı getiriliyor: ${id}, Tam detaylar: ${includeFullDetails}`);
    
    // Tam detaylar isteniyorsa özel bir parametre ekle
    const url = includeFullDetails 
      ? `/listings/${id}?fullDetails=true` 
      : `/listings/${id}`;
      
    console.log("API istek URL:", url);
    
    const response = await api.get(url);
    
    // Sadece önemli alanları logla, tüm veriyi değil
    const bids = response.data.bids || [];
    console.log(`API yanıtı alındı: ${response.status}, Teklif sayısı: ${bids.length}`);
    
    if (bids.length > 0) {
      // Tam detaylar istendiğinde teklif veren bilgilerini daha ayrıntılı kontrol et
      if (includeFullDetails) {
        console.log("Tam teklif detayları kontrol ediliyor...");
        
        // Kabul edilmiş teklifleri kontrol et
        const acceptedBids = bids.filter(bid => bid.status === 'accepted' || bid.isApproved === true);
        if (acceptedBids.length > 0) {
          console.log(`${acceptedBids.length} kabul edilmiş teklif bulundu.`);
          
          // Teklif veren bilgilerini detaylı kontrol et
          acceptedBids.forEach((bid: Bid) => {
            console.log(`Kabul edilen teklif ID: ${bid._id}, Status: ${bid.status}`);
            
            if (typeof bid.bidder === 'object' && bid.bidder) {
              console.log("Teklif veren (bidder) detayları:", {
                id: bid.bidder._id,
                name: bid.bidder.name,
                hasEmail: !!bid.bidder.email,
                hasPhone: !!bid.bidder.phone,
                hasAddress: !!bid.bidder.address,
                hasCompanyInfo: !!bid.bidder.companyInfo && Object.keys(bid.bidder.companyInfo).length > 0
              });
            }
            
            if (typeof bid.user === 'object' && bid.user) {
              console.log("Teklif veren (user) detayları:", {
                id: bid.user._id,
                name: bid.user.name,
                hasEmail: !!bid.user.email,
                hasPhone: !!bid.user.phone,
                hasAddress: !!bid.user.address,
                hasCompanyInfo: !!bid.user.companyInfo && Object.keys(bid.user.companyInfo).length > 0
              });
            }
          });
        }
      } else {
        // Normal durum için temel bilgileri logla
        const firstBid = bids[0];
        console.log("İlk teklif örneği:", {
          id: firstBid._id,
          status: firstBid.status,
          bidderType: typeof firstBid.bidder,
          userType: typeof firstBid.user
        });
      }
    }
    
    // Veri dönüşümü ve doğrulama
    let data = response.data;
    
    // Items kontrolü
    if (!data.items) {
      console.warn('API yanıtında items alanı yok, oluşturuluyor');
      
      // İlanda quantity ve unit bilgisi varsa, bunları kullanarak varsayılan bir öğe oluştur
      if (data.quantity !== undefined && data.unit) {
        console.log(`API yanıtındaki quantity (${data.quantity}) ve unit (${data.unit}) kullanılarak varsayılan ürün oluşturuluyor`);
        
        // İlan başlığını kullanarak bir ürün oluştur
        data.items = [{
          name: data.title || 'Ürün',
          quantity: data.quantity || 1,
          unit: data.unit || 'Adet',
          description: data.description || ''
        }];
      } else {
        // Hiçbir bilgi yoksa boş dizi olarak ayarla
        data.items = [];
      }
    } else if (!Array.isArray(data.items)) {
      console.warn('API yanıtında items bir dizi değil, dönüştürülüyor:', data.items);
      try {
        // String olarak gelmişse parse etmeyi dene
        if (typeof data.items === 'string') {
          data.items = JSON.parse(data.items);
        }
        
        // Yine de dizi değilse, ve quantity/unit bilgisi varsa kullan
        if (!Array.isArray(data.items)) {
          if (data.quantity !== undefined && data.unit) {
            data.items = [{
              name: data.title || 'Ürün',
              quantity: data.quantity || 1,
              unit: data.unit || 'Adet',
              description: data.description || ''
            }];
          } else {
            data.items = [];
          }
        }
      } catch (parseError) {
        console.error('Items dizisi parselenirken hata:', parseError);
        
        // Parse hatası durumunda ve quantity/unit bilgisi varsa kullan
        if (data.quantity !== undefined && data.unit) {
          data.items = [{
            name: data.title || 'Ürün',
            quantity: data.quantity || 1,
            unit: data.unit || 'Adet',
            description: data.description || ''
          }];
        } else {
          data.items = [];
        }
      }
    }
    
    // Dizi olsa bile elemanlarının geçerli olduğunu kontrol et
    if (Array.isArray(data.items)) {
      // Items dizisi boşsa ve quantity/unit bilgisi varsa, bir öğe ekle
      if (data.items.length === 0 && data.quantity !== undefined && data.unit) {
        data.items.push({
          name: data.title || 'Ürün',
          quantity: data.quantity || 1,
          unit: data.unit || 'Adet',
          description: data.description || ''
        });
      }
      
      data.items = data.items.map((item: any) => {
        // Her bir öğenin geçerli bir ListingItem olduğundan emin ol
        if (item && typeof item === 'object') {
          return {
            name: item.name || 'İsimsiz Ürün',
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
            unit: item.unit || 'Adet',
            description: item.description || ''
          };
        }
        // Geçersiz öğe ise varsayılan öğe oluştur
        return {
          name: 'Geçersiz Ürün',
          quantity: 1,
          unit: 'Adet',
          description: ''
        };
      });
    }
    
    return data;
  } catch (error) {
    console.error('İlan detay hatası:', error);
    throw new Error('İlan detayı yüklenirken bir hata oluştu');
  }
};

/**
 * Kullanıcının kendi ilanlarını getir
 */
export const getMyListings = async (): Promise<Listing[]> => {
  try {
    const response = await api.get('/listings/my-listings');
    return response.data;
  } catch (error) {
    console.error('Kullanıcı ilanları hatası:', error);
    throw new Error('İlanlarınız yüklenirken bir hata oluştu');
  }
};

/**
 * Kullanıcının verdiği teklifleri getir
 */
export const getMyBids = async (): Promise<Bid[]> => {
  try {
    const response = await api.get('/bids/my-bids');
    return response.data;
  } catch (error) {
    console.error('Kullanıcı teklifleri hatası:', error);
    throw new Error('Teklifleriniz yüklenirken bir hata oluştu');
  }
};

/**
 * Yeni ilan oluştur
 */
export const createListing = async (listingData: {
  title: string; 
  description: string;
  category: string;
  location?: string;
  items: ListingItem[];
  initialMaxPrice: number;
  expiresAt: string;
  quantity: number;
  unit: string;
}): Promise<Listing> => {
  try {
    const response = await api.post('/listings', listingData);
    return response.data;
  } catch (error) {
    console.error('İlan oluşturma hatası:', error);
    throw error;
  }
};

/**
 * İlan güncelle
 */
export const updateListing = async (id: string, listingData: Partial<Listing>): Promise<Listing> => {
  try {
    const response = await api.put(`/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error('İlan güncelleme hatası:', error);
    throw new Error('İlan güncellenirken bir hata oluştu');
  }
};

/**
 * İlan sil
 */
export const deleteListing = async (id: string): Promise<void> => {
  try {
    await api.delete(`/listings/${id}`);
  } catch (error) {
    console.error('İlan silme hatası:', error);
    throw new Error('İlan silinirken bir hata oluştu');
  }
};

/**
 * İlana teklif ver
 */
export const placeBid = async (listingId: string, price: number): Promise<Bid> => {
  try {
    const response = await api.post(`/listings/${listingId}/bid`, { price });
    return response.data;
  } catch (error) {
    console.error('Teklif verme hatası:', error);
    throw new Error('Teklif verilirken bir hata oluştu');
  }
};

/**
 * Teklifi kabul et
 */
export const acceptBid = async (listingId: string, bidId: string): Promise<Listing> => {
  try {
    const response = await api.post(`/listings/${listingId}/bids/${bidId}/accept`);
    return response.data;
  } catch (error) {
    console.error('Teklif kabul hatası:', error);
    throw new Error('Teklif kabul edilirken bir hata oluştu');
  }
};

/**
 * Teklifi reddet
 */
export const rejectBid = async (listingId: string, bidId: string): Promise<Listing> => {
  try {
    const response = await api.post(`/listings/${listingId}/bids/${bidId}/reject`);
    return response.data;
  } catch (error) {
    console.error('Teklif reddetme hatası:', error);
    throw new Error('Teklif reddedilirken bir hata oluştu');
  }
};

/**
 * İlanı iptal et
 */
export const cancelListing = async (id: string): Promise<Listing> => {
  try {
    const response = await api.post(`/listings/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('İlan iptal hatası:', error);
    throw new Error('İlan iptal edilirken bir hata oluştu');
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

// İlanı güncelleme
export const updateListingAdmin = async (listingId: string, data: Partial<Listing>): Promise<ApiResponse<Listing>> => {
  try {
    const response = await api.put(`/admin/listings/${listingId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('İlan güncellenirken hata:', error);
    throw new Error(error.message || 'İlan güncellenirken bir hata oluştu');
  }
};

// Yeni ilan oluşturma
export const createListingAdmin = async (data: Partial<Listing>): Promise<ApiResponse<Listing>> => {
  try {
    const response = await api.post('/admin/listings', data);
    return response.data;
  } catch (error: any) {
    console.error('İlan oluşturulurken hata:', error);
    throw new Error(error.message || 'İlan oluşturulurken bir hata oluştu');
  }
};

// İlanı sil
export const deleteListingAdmin = async (id: string): Promise<void> => {
  try {
    await api.delete(`/admin/listings/${id}`);
  } catch (error) {
    console.error('İlan silinirken hata:', error);
    throw error;
  }
}; 