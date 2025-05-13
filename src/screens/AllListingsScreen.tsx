import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  StatusBar, 
  ImageBackground,
  ActivityIndicator,
  Dimensions,
  ScrollView
} from 'react-native';
import { 
  Appbar, 
  Button, 
  Card, 
  Chip, 
  Text, 
  Title, 
  Paragraph, 
  Searchbar, 
  useTheme,
  FAB,
  Surface
} from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { getAllListings } from '../services/listingService';
import { getAllCategories } from '../services/categoryService';
import { formatRemainingTime } from '../utils/dateUtils';
import { truncateText } from '../utils/stringUtils';
import { globalStyles, shadowProps } from '../components/theme';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const GRID_SPACING = 12;
const NUM_COLUMNS = 2;
const CARD_WIDTH = (width - (GRID_SPACING * (NUM_COLUMNS + 1))) / NUM_COLUMNS;

// Kullanacağımız tip tanımları
interface Listing {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  currentPrice: number;
  createdAt: string;
  endTime?: string;
  expiresAt?: string;
  status?: string;
  bids: Array<any>;
  initialMaxPrice?: number;
}

type Category = {
  _id: string;
  name: string;
};

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'end-time';
type ViewType = 'grid' | 'list';

interface AllListingsScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: any;
}

const AllListingsScreen = ({ navigation, route }: AllListingsScreenProps) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewType, setViewType] = useState<ViewType>('grid');

  useEffect(() => {
    fetchData();
    
    // Eğer route params'tan bir kategori gelirse, onu seçili kategori olarak belirle
    if (route.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
  }, [route.params]);

  // Filtreleme ve sıralama değişikliklerinde filtrelenmiş listeyi güncelle
  useEffect(() => {
    filterAndSortListings();
  }, [listings, selectedCategory, searchQuery, sortOption]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, listingsData] = await Promise.all([
        getAllCategories(),
        getAllListings()
      ]);
      
      setCategories(categoriesData || []);
      
      if (listingsData && listingsData.length > 0) {
        // API'den gelen verileri Listing tipine dönüştür
        const mappedListings = listingsData.map(item => {
          return {
            ...item,
            category: typeof item.category === 'string' 
              ? { _id: '', name: item.category } 
              : item.category
          } as Listing;
        });
        
        setListings(mappedListings);
      } else {
        setListings([]);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
      Toast.show({
        type: 'error',
        text1: 'Veri yüklenemedi',
        text2: 'Lütfen internet bağlantınızı kontrol edin'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortListings = () => {
    let result = [...listings];
    
    // Kategori filtresi
    if (selectedCategory) {
      result = result.filter(listing => 
        typeof listing.category === 'object' && 
        listing.category._id === selectedCategory
      );
    }
    
    // Arama filtresi
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(query) || 
        listing.description.toLowerCase().includes(query)
      );
    }
    
    // Sıralama
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case 'end-time':
        result.sort((a, b) => {
          const aEndTime = a.expiresAt || a.endTime || '';
          const bEndTime = b.expiresAt || b.endTime || '';
          return new Date(aEndTime).getTime() - new Date(bEndTime).getTime();
        });
        break;
    }
    
    setFilteredListings(result);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleListingPress = (id: string) => {
    navigation.navigate('ListingDetail', { id });
  };

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const formatRemainingTimeText = (listing: Listing): string => {
    if (listing.expiresAt) {
      return formatRemainingTime(listing.expiresAt);
    } else if (listing.endTime) {
      return formatRemainingTime(listing.endTime);
    }
    return '';
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Kategori';
  };

  const toggleViewType = () => {
    setViewType(viewType === 'grid' ? 'list' : 'grid');
  };

  const toggleSortOption = () => {
    const options: SortOption[] = ['newest', 'price-asc', 'price-desc', 'end-time'];
    const currentIndex = options.indexOf(sortOption);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortOption(options[nextIndex]);
  };

  const getSortOptionText = (): string => {
    switch (sortOption) {
      case 'newest': return 'En Yeni';
      case 'price-asc': return 'Fiyat: Artan';
      case 'price-desc': return 'Fiyat: Azalan';
      case 'end-time': return 'Bitiş Tarihi';
    }
  };

  // Liste görünümünde her bir ilanı render et
  const renderListItem = ({ item }: { item: Listing }) => (
    <Surface style={styles.listItemContainer}>
      <TouchableOpacity 
        style={styles.listItemTouchable}
        onPress={() => handleListingPress(item._id)}
      >
        <View style={styles.listImageContainer}>
          <ImageBackground
            source={{ uri: `https://source.unsplash.com/random/300x300/?${item.category.name}` }}
            style={styles.listItemImage}
            imageStyle={{ borderRadius: 8 }}
          >
            <View style={styles.statusBadgeContainer}>
              <Chip 
                style={[
                  styles.statusBadge, 
                  { 
                    backgroundColor: item.status === 'active' ? '#10B981' : 
                                      item.status === 'completed' ? '#3B82F6' : 
                                      item.status === 'cancelled' ? '#EF4444' : '#F59E0B'
                  }
                ]}
                textStyle={styles.statusBadgeText}
              >
                {item.status === 'active' ? 'Aktif' :
                 item.status === 'completed' ? 'Tamamlandı' :
                 item.status === 'cancelled' ? 'İptal' : 'Süresi Doldu'}
              </Chip>
            </View>
          </ImageBackground>
        </View>
        
        <View style={styles.listItemContent}>
          <View style={styles.listItemHeader}>
            <Title style={styles.listItemTitle} numberOfLines={2} ellipsizeMode="tail">
              {item.title}
            </Title>
            <Text style={styles.listItemPrice}>{item.currentPrice.toFixed(2)} ₺</Text>
          </View>
          
          <Text style={styles.listItemDescription} numberOfLines={2} ellipsizeMode="tail">
            {item.description}
          </Text>
          
          <View style={styles.listItemFooter}>
            <Chip 
              style={styles.categoryChip}
              textStyle={styles.categoryChipText}
            >
              {truncateText(item.category.name, 15)}
            </Chip>
            
            <View style={styles.listItemMeta}>
              <View style={styles.bidCountContainer}>
                <Ionicons name="cash-outline" size={14} color="#6B7280" />
                <Text style={styles.bidCountText}>{item.bids.length} Teklif</Text>
              </View>
              
              <Text style={styles.timeRemainingText}>
                {formatRemainingTimeText(item)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );

  // Grid görünümünde her bir ilanı render et
  const renderGridItem = ({ item }: { item: Listing }) => (
    <TouchableOpacity 
      style={styles.gridItemContainer}
      onPress={() => handleListingPress(item._id)}
    >
      <Card style={styles.gridCard}>
        <ImageBackground
          source={{ uri: `https://source.unsplash.com/random/300x300/?${item.category.name}` }}
          style={styles.gridCardImage}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gridCardOverlay}
          >
            <Chip 
              style={styles.gridCategoryChip}
              textStyle={{ fontSize: 10, color: '#4F46E5', fontWeight: '600' }}
            >
              {truncateText(item.category.name, 15)}
            </Chip>
          </LinearGradient>
        </ImageBackground>
        
        <Card.Content style={styles.gridCardContent}>
          <Title style={styles.gridCardTitle} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </Title>
          
          <View style={styles.gridCardPriceRow}>
            <Text style={styles.gridCardPrice}>{item.currentPrice.toFixed(2)} ₺</Text>
            <Text style={styles.gridCardBidCount}>{item.bids.length} Teklif</Text>
          </View>
          
          <Text style={styles.gridCardTimeRemaining}>
            {formatRemainingTimeText(item)}
          </Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  // Loading indicator
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>İlanlar yükleniyor...</Text>
      </View>
    );
  }

  const categoriesList = () => (
    <View style={styles.filterContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <Chip
            key={category._id}
            selected={selectedCategory === category._id}
            selectedColor="#4F46E5"
            style={[
              styles.filterChip,
              selectedCategory === category._id && styles.filterChipSelected
            ]}
            textStyle={[
              styles.filterChipText,
              selectedCategory === category._id && styles.filterChipTextSelected
            ]}
            onPress={() => selectCategory(category._id)}
          >
            {category.name}
          </Chip>
        ))}
      </ScrollView>

      <View style={styles.sortOptionContainer}>
        <Text style={styles.sortOptionText}>
          {getSortOptionText()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
      
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#FFFFFF" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Tüm İlanlar" color="#FFFFFF" />
        
        <Appbar.Action 
          icon={viewType === 'grid' ? 'view-list' : 'view-grid'} 
          color="#FFFFFF" 
          onPress={toggleViewType} 
        />
        <Appbar.Action 
          icon="sort" 
          color="#FFFFFF" 
          onPress={toggleSortOption} 
        />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="İlanlarda ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ fontSize: 16 }}
        />
      </View>
      
      {/* Kategori filtreleri */}
      {categoriesList()}
      
      {/* İlanları listele */}
      {filteredListings.length > 0 ? (
        <FlatList
          data={filteredListings}
          keyExtractor={item => item._id}
          renderItem={viewType === 'grid' ? renderGridItem : renderListItem}
          contentContainerStyle={
            viewType === 'grid' ? styles.gridListContent : styles.listContent
          }
          numColumns={viewType === 'grid' ? NUM_COLUMNS : 1}
          key={viewType} // Görünüm tipi değişince yeniden render et
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4F46E5"]} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={60} color="#CBD5E0" />
          <Text style={styles.emptyTitle}>İlan Bulunamadı</Text>
          <Text style={styles.emptyText}>
            {searchQuery 
              ? 'Aramanızla eşleşen ilan bulunamadı.' 
              : selectedCategory 
                ? 'Bu kategoride aktif ilan yok.' 
                : 'Henüz ilan eklenmemiş.'}
          </Text>
          
          {user?.isApproved && (
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('CreateListing')} 
              style={styles.createButton}
            >
              Yeni İlan Oluştur
            </Button>
          )}
        </View>
      )}
      
      {/* Yeni ilan oluşturma butonu */}
      {user?.isApproved && filteredListings.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          color="#FFFFFF"
          onPress={() => navigation.navigate('CreateListing')}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  appbar: {
    backgroundColor: '#4F46E5',
    elevation: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#4F46E5',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  categoriesScroll: {
    flexGrow: 0,
    paddingVertical: 4,
  },
  categoriesContent: {
    paddingHorizontal: 8,
  },
  filterChip: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  filterChipSelected: {
    backgroundColor: 'rgba(79, 70, 229, 0.3)',
  },
  filterChipText: {
    color: '#4F46E5',
  },
  filterChipTextSelected: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  sortOptionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
  },
  sortOptionText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  // Grid View Styles
  gridListContent: {
    padding: GRID_SPACING,
  },
  gridItemContainer: {
    width: CARD_WIDTH,
    marginBottom: GRID_SPACING,
    marginHorizontal: GRID_SPACING / 2,
  },
  gridCard: {
    overflow: 'hidden',
    borderRadius: 12,
    elevation: 3,
    height: 210,
  },
  gridCardImage: {
    height: 120,
    justifyContent: 'flex-end',
  },
  gridCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    justifyContent: 'flex-end',
    padding: 8,
  },
  gridCategoryChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    height: 24,
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    maxWidth: 110,
  },
  gridCardContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 10,
    height: 90,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    height: 36,
  },
  gridCardPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gridCardPrice: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gridCardBidCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  gridCardTimeRemaining: {
    fontSize: 12,
    color: '#F59E0B',
  },
  // List View Styles
  listContent: {
    padding: 16,
  },
  listItemContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  listItemTouchable: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  listImageContainer: {
    width: 120,
    height: 120,
  },
  listItemImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 8,
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statusBadge: {
    height: 22,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 10,
  },
  listItemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  listItemPrice: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 4,
  },
  listItemDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  listItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    height: 24,
    paddingHorizontal: 6,
    maxWidth: 110,
  },
  categoryChipText: {
    color: '#4F46E5',
    fontSize: 11,
    fontWeight: '500',
  },
  listItemMeta: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  bidCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidCountText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  timeRemainingText: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 2,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#4B5563',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4F46E5',
  },
});

export default AllListingsScreen; 