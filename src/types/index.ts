// Kullanıcı
export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  companyInfo?: {
    companyName?: string;
    address?: string;
    city?: string;
    phone?: string;
    taxNumber?: string;
    description?: string;
  };
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

// Teklif
export interface Bid {
  _id: string;
  bidder: User | string;
  price: number;
  createdAt: string;
}

// İlan
export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: Category | string;
  owner: User | string;
  quantity: number;
  unit: string;
  initialMaxPrice: number;
  currentPrice?: number;
  images: string[];
  bids: Bid[];
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  expiresAt: string;
  isApproved: boolean;
  winner?: User | string;
  createdAt: string;
  updatedAt: string;
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