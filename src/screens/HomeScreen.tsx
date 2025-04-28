import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { 
  Appbar, 
  FAB, 
  Card, 
  Title, 
  Paragraph, 
  Searchbar, 
  Chip, 
  Badge, 
  Text,
  Divider,
  Button,
  Portal,
  Dialog,
  Menu
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getAllListings, getListingsByCategory } from '../services/listingService';
import { getAllCategories } from '../services/categoryService';
import { Listing, Category } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow, isPast } from 'date-fns';
import { tr } from 'date-fns/locale';

type HomeScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Kategori dialog durumu
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  
  // Filtre menüsü durumu
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'price'>('all');
  
  // İlanları ve kategorileri yükle
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Kategorileri yükle
      const categoriesData = await getAllCategories();
      setCategories(categoriesData.filter(c => c.isActive));
      
      // Filtrelenmiş ilanları veya tüm ilanları yükle
      let listingsData: Listing[];
      if (selectedCategory) {
        listingsData = await getListingsByCategory(selectedCategory);
      } else {
        listingsData = await getAllListings();
      }
      
      // Sadece onaylı ilanları göster
      const approvedListings = listingsData.filter(listing => listing.isApproved);
      
      setListings(approvedListings);
      applyFilters(approvedListings, searchQuery, activeFilter);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery, activeFilter]);
  
  // İlk yükleme
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };
  
  // Arama ve filtreleme işlemleri
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(listings, query, activeFilter);
  };
  
  // Filtreleri uygula
  const applyFilters = (listingsToFilter: Listing[], query: string, filter: string) => {
    // Önce arama sorgusuna göre filtrele
    let filtered = listingsToFilter.filter(listing => 
      listing.title.toLowerCase().includes(query.toLowerCase()) ||
      listing.description.toLowerCase().includes(query.toLowerCase())
    );
    
    // Sonra seçilen filtreye göre filtrele ve sırala
    switch (filter) {
      case 'active':
        filtered = filtered.filter(listing => listing.status === 'active' && !isPast(new Date(listing.expiresAt)));
        break;
      case 'price':
        filtered.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
    }
    
    setFilteredListings(filtered);
  };
  
  // Kategori filtresi uygula
  const applyCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCategoryDialogVisible(false);
  };
  
  // İlan durumuna göre etiket oluştur
  const getStatusBadge = (listing: Listing) => {
    const expiryDate = new Date(listing.expiresAt);
    const isExpired = isPast(expiryDate);
    
    if (isExpired) {
      return <Badge style={[styles.badge, styles.expiredBadge]}>Süresi Doldu</Badge>;
    }
    
    switch (listing.status) {
      case 'active':
        return <Badge style={[styles.badge, styles.activeBadge]}>Aktif</Badge>;
      case 'completed':
        return <Badge style={[styles.badge, styles.completedBadge]}>Tamamlandı</Badge>;
      case 'cancelled':
        return <Badge style={[styles.badge, styles.cancelledBadge]}>İptal Edildi</Badge>;
      default:
        return null;
    }
  };
  
  // Kategori başlığını getir
  const getCategoryTitle = () => {
    if (!selectedCategory) {
      return 'Tüm İlanlar';
    }
    
    const category = categories.find(c => c._id === selectedCategory);
    return category ? category.name : 'Tüm İlanlar';
  };
  
  // İlanı göster
  const viewListing = (id: string) => {
    navigation.navigate('ListingDetail', { id });
  };
  
  // Yeni ilan oluşturma ekranına git
  const createNewListing = () => {
    navigation.navigate('CreateListing');
  };
  
  // İçerik yükleniyor
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Ters Açık Artırma" />
        {user?.isAdmin && (
          <Appbar.Action 
            icon="cog" 
            onPress={() => navigation.navigate('AdminDashboard')} 
          />
        )}
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="İlan ara..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterMenuVisible(true)}
        >
          <Ionicons name="filter" size={22} color="#4F46E5" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.categorySection}>
        <TouchableOpacity 
          style={styles.categoryButton}
          onPress={() => setCategoryDialogVisible(true)}
        >
          <Text style={styles.categoryButtonText}>{getCategoryTitle()}</Text>
          <Ionicons name="chevron-down" size={16} color="#4B5563" />
        </TouchableOpacity>
        
        {activeFilter !== 'all' && (
          <Chip 
            mode="outlined"
            onClose={() => {
              setActiveFilter('all');
              applyFilters(listings, searchQuery, 'all');
            }}
            style={styles.filterChip}
          >
            {activeFilter === 'active' ? 'Aktif İlanlar' : 'Fiyata Göre'}
          </Chip>
        )}
      </View>
      
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const category = typeof item.category === 'object' ? item.category.name : 'Kategori';
          const expiryDate = new Date(item.expiresAt);
          
          return (
            <TouchableOpacity onPress={() => viewListing(item._id)}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Title style={styles.cardTitle} numberOfLines={1}>{item.title}</Title>
                    {getStatusBadge(item)}
                  </View>
                  
                  <Paragraph numberOfLines={2} style={styles.description}>
                    {item.description}
                  </Paragraph>
                  
                  <Divider style={styles.divider} />
                  
                  <View style={styles.cardFooter}>
                    <View style={styles.itemInfo}>
                      <Chip icon="tag" style={styles.chip} textStyle={styles.chipText}>
                        {category}
                      </Chip>
                      
                      {!isPast(expiryDate) && item.status === 'active' && (
                        <Text style={styles.timeLeft}>
                          {formatDistanceToNow(expiryDate, { locale: tr, addSuffix: true })}
                        </Text>
                      )}
                    </View>
                    
                    <View style={styles.priceContainer}>
                      <Text style={styles.priceLabel}>Mevcut Fiyat:</Text>
                      <Text style={styles.price}>{item.currentPrice} TL</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>İlan bulunamadı</Text>
            {selectedCategory && (
              <Button 
                mode="outlined" 
                onPress={() => applyCategoryFilter(null)}
                style={styles.resetButton}
              >
                Tümünü Göster
              </Button>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
        }
      />
      
      {user?.isApproved && (
        <FAB
          style={styles.fab}
          icon="plus"
          label="Yeni İlan"
          onPress={createNewListing}
        />
      )}
      
      {/* Kategori Seçme Dialog */}
      <Portal>
        <Dialog
          visible={categoryDialogVisible}
          onDismiss={() => setCategoryDialogVisible(false)}
        >
          <Dialog.Title>Kategori Seçin</Dialog.Title>
          <Dialog.Content>
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() => applyCategoryFilter(null)}
            >
              <Text style={[styles.categoryItemText, !selectedCategory && styles.selectedCategory]}>
                Tüm Kategoriler
              </Text>
              {!selectedCategory && <Ionicons name="checkmark" size={18} color="#4F46E5" />}
            </TouchableOpacity>
            
            {categories.map((category) => (
              <TouchableOpacity
                key={category._id}
                style={styles.categoryItem}
                onPress={() => applyCategoryFilter(category._id)}
              >
                <Text 
                  style={[
                    styles.categoryItemText, 
                    selectedCategory === category._id && styles.selectedCategory
                  ]}
                >
                  {category.name}
                </Text>
                {selectedCategory === category._id && (
                  <Ionicons name="checkmark" size={18} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCategoryDialogVisible(false)}>Kapat</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Filtre Menüsü */}
      <Menu
        visible={filterMenuVisible}
        onDismiss={() => setFilterMenuVisible(false)}
        anchor={{ x: 300, y: 100 }}
      >
        <Menu.Item 
          title="Tüm İlanlar" 
          onPress={() => {
            setActiveFilter('all');
            applyFilters(listings, searchQuery, 'all');
            setFilterMenuVisible(false);
          }}
          leadingIcon="format-list-bulleted"
        />
        <Menu.Item 
          title="Sadece Aktif İlanlar" 
          onPress={() => {
            setActiveFilter('active');
            applyFilters(listings, searchQuery, 'active');
            setFilterMenuVisible(false);
          }}
          leadingIcon="clock-outline"
        />
        <Menu.Item 
          title="Fiyata Göre Sırala (Düşükten Yükseğe)" 
          onPress={() => {
            setActiveFilter('price');
            applyFilters(listings, searchQuery, 'price');
            setFilterMenuVisible(false);
          }}
          leadingIcon="cash"
        />
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  filterButton: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  categorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryButtonText: {
    marginRight: 4,
    fontSize: 14,
    color: '#4B5563',
  },
  filterChip: {
    marginLeft: 8,
    backgroundColor: '#EBF5FF',
  },
  listContent: {
    padding: 8,
    paddingBottom: 80, // FAB için boşluk
  },
  card: {
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  badge: {
    marginLeft: 4,
  },
  activeBadge: {
    backgroundColor: '#10B981',
  },
  completedBadge: {
    backgroundColor: '#3B82F6',
  },
  expiredBadge: {
    backgroundColor: '#F59E0B',
  },
  cancelledBadge: {
    backgroundColor: '#EF4444',
  },
  divider: {
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  timeLeft: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
  resetButton: {
    marginTop: 16,
    borderColor: '#4F46E5',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4F46E5',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#4B5563',
  },
  selectedCategory: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
});

export default HomeScreen; 