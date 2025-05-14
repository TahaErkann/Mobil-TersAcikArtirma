import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Dimensions, ImageBackground } from 'react-native';
import { Button, Card, Chip, Text, Title, useTheme, Avatar, ActivityIndicator, Surface } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { truncateText } from '../utils/stringUtils';
import { formatRemainingTime } from '../utils/dateUtils';
import { globalStyles, shadowProps } from '../components/theme';
import Toast from 'react-native-toast-message';
import { getAllListings } from '../services/listingService';
import { getAllCategories } from '../services/categoryService';
import { LinearGradient } from 'expo-linear-gradient';
import { Listing as ListingType } from '../types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

// Kategori resimlerini döndüren yardımcı fonksiyon
const getCategoryImage = (categoryName: string): string => {
  // Kategori adına göre uygun resimleri belirle (örnek resimler)
  const categoryImages: Record<string, string> = {
    "Elektronik": "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=500",
    "Mobilya": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=500",
    "Giyim": "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=500",
    "Gıda": "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=500",
    "İnşaat": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=500",
    "Kırtasiye": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=500",
    "Otomotiv": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=500",
    "Spor": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500",
    "Teknoloji": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=500",
    "Elektrik": "https://images.unsplash.com/photo-1623871590782-4129f5846c5b?q=80&w=500",
    "Hırdavat/Nalbur": "https://images.unsplash.com/photo-1562516710-6a880c0c4e5f?q=80&w=500"
  };
  
  // Kategori adı varsa ve resmi tanımlıysa, o resmi döndür
  if (categoryName && categoryImages[categoryName]) {
    return categoryImages[categoryName];
  }
  
  // Varsayılan resmi döndür
  return "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?q=80&w=500";
};

// İonicons tip hatası önleme
type IconName = 'search-outline' | 'flash-outline' | 'hammer-outline' | 'construct-outline' | 
  'car-outline' | 'business-outline' | 'water-outline' | 'laptop-outline' | 
  'desktop-outline' | 'restaurant-outline' | 'shirt-outline' | 'medkit-outline' | 'cube-outline' |
  'document-outline';

// Genişletilmiş İlan tipi, servislerden gelen tip ile uyumlu olması için
type Listing = {
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
};

type Category = {
  _id: string;
  name: string;
  count?: number;
  icon?: string;
};

interface HomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const socket = useSocket();
  
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [latestListings, setLatestListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    
    const handleBidUpdate = (data: any) => {
      // Teklif güncellemesi geldiğinde fiyatı güncelle
      if (data && data.listing && data.bid) {
        updateListingPrice(data.listing._id, data.bid.price || data.bid.amount);
      }
    };
    
    if (socket && socket.connected) {
      socket.on('bidUpdate', handleBidUpdate);
      
      return () => {
        socket.off('bidUpdate', handleBidUpdate);
      };
    }
  }, [socket?.connected]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Servisler üzerinden veri çekme
      const [categoriesData, listingsData] = await Promise.all([
        getAllCategories(),
        getAllListings()
      ]);
      
      setCategories(categoriesData || []);
      
      if (listingsData && listingsData.length > 0) {
        // Son eklenenlere göre sırala
        const sortedListings = [...listingsData].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Öne çıkan ilanlar (aktif ve fiyatı en düşük 5 ilan)
        const featured = [...listingsData]
          .filter(listing => listing.status === 'active')
          .sort((a, b) => a.currentPrice - b.currentPrice)
          .slice(0, 5);
        
        // API'den gelen verileri Listing tipine dönüştür
        const mappedFeatured = featured.map(item => {
          return {
            ...item,
            category: typeof item.category === 'string' 
              ? { _id: '', name: item.category } 
              : item.category
          } as Listing;
        });
        
        const mappedLatest = sortedListings.slice(0, 10).map(item => {
          return {
            ...item,
            category: typeof item.category === 'string' 
              ? { _id: '', name: item.category } 
              : item.category
          } as Listing;
        });
        
        setFeaturedListings(mappedFeatured);
        setLatestListings(mappedLatest);
      } else {
        setFeaturedListings([]);
        setLatestListings([]);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const updateListingPrice = (listingId: string, newPrice: number) => {
    // Öne çıkan ilanları güncelle
    setFeaturedListings(prevListings => 
      prevListings.map(listing => 
        listing._id === listingId 
          ? { ...listing, currentPrice: newPrice } 
          : listing
      )
    );
    
    // En son ilanları güncelle
    setLatestListings(prevListings => 
      prevListings.map(listing => 
        listing._id === listingId 
          ? { ...listing, currentPrice: newPrice } 
          : listing
      )
    );
  };

  const handleListingPress = (id: string) => {
    navigation.navigate('ListingDetail', { id });
  };

  const navigateToCreateListing = () => {
    navigation.navigate('CreateListing');
  };

  const navigateToCategory = (categoryId: string, categoryName: string) => {
    navigation.navigate('Kategoriler', { screen: 'Listing', params: { categoryId, categoryName } });
  };

  const navigateToAllListings = (categoryId?: string) => {
    navigation.navigate('AllListings', { categoryId });
  };

  const getCategoryIconName = (categoryName: string): IconName => {
    const categoryMap: Record<string, IconName> = {
      'Elektrik': 'flash-outline',
      'Hırdavat': 'hammer-outline',
      'Nalburiye': 'construct-outline',
      'Yedek Parça': 'car-outline',
      'İnşaat': 'business-outline',
      'Temizlik': 'water-outline',
      'Elektronik': 'laptop-outline',
      'Ofis': 'desktop-outline',
      'Gıda': 'restaurant-outline',
      'Tekstil': 'shirt-outline',
      'Sağlık': 'medkit-outline',
      'Diğer': 'cube-outline'
    };
    
    return categoryMap[categoryName] || 'cube-outline';
  };

  const getCategoryColor = (index: number): string => {
    const colors = [
      '#4F46E5', // primary
      '#F43F5E', // secondary
      '#06B6D4', // cyan
      '#10B981', // emerald
      '#F59E0B', // amber
      '#8B5CF6', // violet
      '#EC4899', // pink
    ];
    
    return colors[index % colors.length];
  };

  // Kalan süre veya bitiş zamanı gösterimi için güvenli bir fonksiyon
  const getTimeRemaining = (listing: Listing): string => {
    if (listing.expiresAt) {
      return formatRemainingTime(listing.expiresAt);
    } else if (listing.endTime) {
      return formatRemainingTime(listing.endTime);
    }
    return '';
  };

  // Yükleniyor Göstergesi
  if (loading && !refreshing) {
    return (
      <View style={[globalStyles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>İlanlar ve kategoriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <StatusBar backgroundColor={colors.background} barStyle="dark-content" />
      
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Gradient Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.welcomeContainer}>
            <Title style={styles.welcomeTitle}>
              Hoş Geldin, {user?.name?.split(' ')[0] || 'Kullanıcı'}
            </Title>
            <Text style={styles.welcomeSubtitle}>
              Ters Açık Artırma ile tasarruf edin!
            </Text>
          </View>
          
          <View style={styles.searchContainer}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => navigation.navigate('Kategoriler')}
            >
              <Ionicons name={'search-outline'} size={24} color="#4F46E5" />
              <Text style={styles.searchButtonText}>İlan veya kategori ara</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Yeni İlan Oluştur */}
        {user?.isApproved && (
          <View style={styles.createListingContainer}>
            <Button
              icon="plus-circle-outline"
              mode="contained"
              onPress={navigateToCreateListing}
              color="#4F46E5"
              style={styles.createButton}
              labelStyle={styles.createButtonLabel}
            >
              Yeni İlan Oluştur
            </Button>
          </View>
        )}
        
        {/* Öne Çıkan İlanlar */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Öne Çıkan İlanlar</Title>
            <TouchableOpacity onPress={() => navigateToAllListings()}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.featuredListingsContainer}
            contentContainerStyle={styles.featuredListingsContent}
          >
            {featuredListings.length > 0 ? featuredListings.map((listing) => (
              <TouchableOpacity 
                key={listing._id} 
                style={styles.featuredCardContainer}
                onPress={() => handleListingPress(listing._id)}
              >
                <Card style={styles.featuredCard}>
                  <ImageBackground
                    source={{ uri: getCategoryImage(listing.category.name) }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  >
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.cardImageOverlay}
                    >
                      <View style={styles.cardImageContent}>
                        <Chip 
                          style={styles.categoryBadge}
                          textStyle={{ color: '#4F46E5', fontWeight: 'bold' }}
                        >
                          {truncateText(listing.category.name, 15)}
                        </Chip>
                        
                        <Text style={styles.imageTimeRemaining}>
                          {getTimeRemaining(listing)}
                        </Text>
                      </View>
                    </LinearGradient>
                  </ImageBackground>

                  <Card.Content style={styles.featuredCardContentContainer}>
                    <Title style={styles.featuredCardTitle}>{truncateText(listing.title, 45)}</Title>
                    <View style={styles.featuredPriceContainer}>
                      <Text style={styles.featuredPrice}>{listing.currentPrice.toFixed(2)} ₺</Text>
                      <Text style={styles.featuredBidCount}>{listing.bids.length} Teklif</Text>
                    </View>
                  </Card.Content>
                </Card>
              </TouchableOpacity>
            )) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name={'cube-outline'} size={48} color="#CBD5E0" />
                <Text style={styles.emptyStateText}>Henüz öne çıkan ilan bulunmuyor</Text>
              </View>
            )}
          </ScrollView>
        </View>
        
        {/* Son Eklenen İlanlar */}
        <View style={[styles.sectionContainer, { paddingBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Son Eklenen İlanlar</Title>
            <TouchableOpacity onPress={() => navigateToAllListings()}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.latestListingsContainer}>
            {latestListings.length > 0 ? latestListings.map((listing) => (
              <Surface key={listing._id} style={styles.listingCard}>
                <TouchableOpacity 
                  style={styles.latestCardContent} 
                  onPress={() => handleListingPress(listing._id)}
                >
                  <View style={styles.latestCardLeft}>
                    <View style={styles.listingImageContainer}>
                      <ImageBackground
                        source={{ uri: getCategoryImage(listing.category.name) }}
                        style={styles.listingImage}
                        resizeMode="cover"
                      />
                    </View>
                  </View>
                  
                  <View style={styles.latestCardMiddle}>
                    <Text style={styles.latestCardTitle}>{truncateText(listing.title, 45)}</Text>
                    <Text style={styles.latestCardDescription}>{truncateText(listing.description, 60)}</Text>
                    <View style={styles.latestCardMeta}>
                      <Chip
                        style={styles.categoryChip}
                        textStyle={styles.categoryChipText}
                      >
                        {listing.category.name}
                      </Chip>
                      <Text style={styles.timeAgo}>
                        {getTimeRemaining(listing)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.latestCardRight}>
                    <Text style={styles.listingPrice}>{listing.currentPrice.toFixed(2)} ₺</Text>
                    <Text style={styles.bidCount}>{listing.bids.length} Teklif</Text>
                  </View>
                </TouchableOpacity>
              </Surface>
            )) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name={'document-outline'} size={48} color="#CBD5E0" />
                <Text style={styles.emptyStateText}>Henüz ilan bulunmuyor</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  header: {
    width: '100%',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeContainer: {
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  welcomeSubtitle: {
    fontSize: 16,
    marginTop: 5,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadowProps,
  },
  searchButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  createListingContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  createButton: {
    borderRadius: 12,
    paddingVertical: 6,
    elevation: 3,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllButton: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  featuredListingsContainer: {
    marginVertical: 5,
  },
  featuredListingsContent: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  featuredCardContainer: {
    marginHorizontal: 6,
    ...shadowProps,
  },
  featuredCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  cardImage: {
    height: 180,
    width: '100%',
    justifyContent: 'space-between',
  },
  cardImageStyle: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  cardImageContent: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    height: 28,
  },
  imageTimeRemaining: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuredCardContentContainer: {
    padding: 16,
  },
  featuredCardTitle: {
    fontSize: 16, 
    fontWeight: 'bold',
    marginBottom: 6,
  },
  featuredPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  featuredPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  featuredBidCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  latestListingsContainer: {
    paddingHorizontal: 16,
  },
  listingCard: {
    borderRadius: 16,
    marginVertical: 6,
    overflow: 'hidden',
    elevation: 2,
  },
  latestCardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  latestCardLeft: {
    marginRight: 12,
    justifyContent: 'center',
  },
  latestCardMiddle: {
    flex: 1,
    justifyContent: 'center',
  },
  latestCardRight: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  latestCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  latestCardDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  latestCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    elevation: 2,
  },
  listingImage: {
    width: '100%',
    height: '100%',
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  bidCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  timeAgo: {
    fontSize: 12,
    color: '#F59E0B',
    marginLeft: 8,
  },
  categoryChip: {
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    height: 24,
  },
  categoryChipText: {
    fontSize: 10,
    color: '#4F46E5',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginHorizontal: 16,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HomeScreen; 