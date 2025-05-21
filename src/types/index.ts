// Kullanıcı
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  companyInfo?: {
    companyName?: string;
    address?: string;
    city?: string;
    phone?: string;
    taxNumber?: string;
    taxOffice?: string; // Vergi dairesi
    description?: string;
  };
  birthDate?: string; // Doğum tarihi
  gender?: string; // Cinsiyet
  nationalId?: string; // T.C. Kimlik No
  isAdmin: boolean;
  isApproved: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Kategori
export interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// İlan öğesi - ilan içindeki her bir ürün
export interface ListingItem {
  name: string;
  quantity: number;
  unit: string; // "Adet", "Koli", "Takım" vb.
  description?: string;
}

// Teklif
export interface Bid {
  _id: string;
  bidder: User | string;
  user?: User | string; // bidder ile aynı, geriye dönük uyumluluk için
  price: number;
  amount?: number; // price ile aynı, geriye dönük uyumluluk için
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  isApproved?: boolean; // Onay durumu, status ile eşgüdümlü
  expiresAt: string;
  timestamp?: string; // createdAt ile aynı, geriye dönük uyumluluk için
  createdAt: string;
  updatedAt?: string;
  acceptedAt?: string; // Teklifin kabul edildiği tarih
}

// İlan
export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: Category | string;
  owner: User | string;
  items: ListingItem[];
  initialMaxPrice: number;
  currentPrice: number;
  bids: Bid[];
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  expiresAt: string;
  isApproved: boolean;
  winner?: User | string;
  createdAt: string;
  updatedAt: string;
}

// Bildirim
export interface Notification {
  _id: string;
  type: 'bid' | 'expiry' | 'approval' | 'rejection' | 'winner';
  title: string;
  message: string;
  relatedListing?: string;
  relatedBid?: string;
  isRead: boolean;
  createdAt: string;
}

// API yanıt tipleri
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

// Login/Register sonucu
export interface AuthResult {
  success: boolean;
  error?: unknown;
}

// Auth Context
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Auth State
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// AsyncStorage anahtar isimleri
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};

// Socket Context
export interface SocketContextType {
  socket: any | null;
  connected: boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  emit: (event: string, data: any) => void;
}

// Bildirim Yanıtı
export interface NotificationResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

// Bildirim Context
export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loadNotifications: () => Promise<void>;
}

// Stats - İstatistik verileri
export interface Stats {
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