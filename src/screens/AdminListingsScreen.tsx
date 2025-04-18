import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllListings, approveListing, deleteListing } from '../services/listingService';
import { getAllCategories } from '../services/categoryService';
import { Listing, Category } from '../types';

const AdminListingsScreen = ({ navigation }: any) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'expired'>('all');

  // İlanları yükle
  const loadListings = async () => {
    try {
      setLoading(true);
      const [listingsResponse, categoriesResponse] = await Promise.all([
        getAllListings(),
        getAllCategories()
      ]);
      setListings(listingsResponse);
      setCategories(categoriesResponse);
      filterListings(listingsResponse, searchQuery, filterStatus);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İlanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  // Başlangıçta ilanları yükle
  useEffect(() => {
    loadListings();
  }, []);

  // Arama ve filtreleme
  const filterListings = (listingList: Listing[], query: string, status: 'all' | 'pending' | 'approved' | 'expired') => {
    let filtered = listingList;
    
    // Durum filtresi
    if (status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(listing => !listing.isApproved);
      } else if (status === 'approved') {
        filtered = filtered.filter(listing => listing.isApproved && listing.status === 'active');
      } else if (status === 'expired') {
        filtered = filtered.filter(listing => listing.status === 'expired' || listing.status === 'completed');
      }
    }
    
    // Arama filtresi
    if (query) {
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query.toLowerCase()) || 
        listing.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    setFilteredListings(filtered);
  };

  useEffect(() => {
    filterListings(listings, searchQuery, filterStatus);
  }, [searchQuery, filterStatus]);

  // İlanı onayla
  const handleApproveListing = async (listing: Listing) => {
    try {
      setLoading(true);
      await approveListing(listing._id);
      Alert.alert('Başarılı', `${listing.title} ilanı onaylandı`);
      loadListings();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'İlan onaylanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İlanı sil
  const handleDeleteListing = async (listing: Listing) => {
    Alert.alert(
      'İlanı Sil',
      `"${listing.title}" ilanını silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteListing(listing._id);
              Alert.alert('Başarılı', `${listing.title} ilanı silindi`);
              loadListings();
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'İlan silinirken bir hata oluştu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // İlan detaylarını göster
  const handleViewListing = (listing: Listing) => {
    // Kategori adını bul
    const categoryName = typeof listing.category === 'string'
      ? categories.find(c => c._id === listing.category)?.name || 'Bilinmeyen'
      : listing.category.name;
    
    // Sahibi bul  
    const ownerName = typeof listing.owner === 'string'
      ? 'ID: ' + listing.owner
      : listing.owner.name;
    
    Alert.alert(
      `${listing.title}`,
      `Açıklama: ${listing.description}\n\n` +
      `Kategori: ${categoryName}\n` +
      `Miktar: ${listing.quantity} ${listing.unit}\n` +
      `Başlangıç Fiyatı: ${listing.initialMaxPrice} TL\n` +
      `Güncel Teklif: ${listing.currentPrice || '-'} TL\n` +
      `Durum: ${getStatusText(listing)}\n` +
      `Onay Durumu: ${listing.isApproved ? 'Onaylı' : 'Onay Bekliyor'}\n` +
      `Sahibi: ${ownerName}\n` +
      `Bitiş Tarihi: ${new Date(listing.expiresAt).toLocaleString('tr-TR')}\n` +
      `Teklif Sayısı: ${listing.bids?.length || 0}`,
      [
        { text: 'Kapat', style: 'cancel' },
        { 
          text: 'Detayları Göster', 
          onPress: () => navigation.navigate('ListingDetail', { id: listing._id })
        }
      ]
    );
  };

  // İlan durumuna göre renk
  const getStatusColor = (listing: Listing) => {
    if (!listing.isApproved) return '#f59e0b'; // turuncu (onay bekliyor)
    if (listing.status === 'active') return '#4ade80'; // yeşil (aktif)
    if (listing.status === 'completed') return '#3b82f6'; // mavi (tamamlandı)
    if (listing.status === 'expired') return '#6b7280'; // gri (süresi doldu)
    return '#ef4444'; // kırmızı (iptal edildi)
  };

  // İlan durumu metni
  const getStatusText = (listing: Listing) => {
    if (!listing.isApproved) return 'Onay Bekliyor';
    if (listing.status === 'active') return 'Aktif';
    if (listing.status === 'completed') return 'Tamamlandı';
    if (listing.status === 'expired') return 'Süresi Doldu';
    return 'İptal Edildi';
  };

  // Fiyat formatla
  const formatPrice = (price?: number) => {
    if (price === undefined) return '-';
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // İlan öğesi
  const renderListingItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={[styles.listingItem, { borderLeftColor: getStatusColor(item), borderLeftWidth: 4 }]}
      onPress={() => handleViewListing(item)}
    >
      <View style={styles.listingImageContainer}>
        {item.images && item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={24} color="#d1d5db" />
          </View>
        )}
      </View>
      
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.listingPrice}>{formatPrice(item.initialMaxPrice)}</Text>
        <Text style={styles.listingDetails}>{item.quantity} {item.unit}</Text>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item) }]}>
          <Text style={styles.statusText}>{getStatusText(item)}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {!item.isApproved && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveListing(item)}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteListing(item)}
        >
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İlan Yönetimi</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="İlan ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[
            styles.filterText, 
            filterStatus === 'all' ? styles.activeFilterText : null
          ]}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'pending' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[
            styles.filterText, 
            filterStatus === 'pending' ? styles.activeFilterText : null
          ]}>Onay Bekleyenler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'approved' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('approved')}
        >
          <Text style={[
            styles.filterText, 
            filterStatus === 'approved' ? styles.activeFilterText : null
          ]}>Aktif İlanlar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'expired' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('expired')}
        >
          <Text style={[
            styles.filterText, 
            filterStatus === 'expired' ? styles.activeFilterText : null
          ]}>Biten İlanlar</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={52} color="#4F46E5" />
          <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item._id}
          renderItem={renderListingItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="newspaper-outline" size={50} color="#d1d5db" />
              <Text style={styles.emptyText}>İlan bulunamadı</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  activeFilter: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 12,
    color: '#4b5563',
  },
  activeFilterText: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  listContent: {
    padding: 8,
  },
  listingItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginVertical: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listingImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
  },
  listingDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  approveButton: {
    backgroundColor: '#4ade80',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default AdminListingsScreen; 