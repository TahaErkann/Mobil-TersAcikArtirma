import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, ToastAndroid, Platform } from 'react-native';
import { Text, Title, Headline, Card, Chip, ActivityIndicator, Button, Searchbar, Snackbar } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { getAllListings } from '../services/listingService';
import { getAllCategories } from '../services/categoryService';
import { Listing, Category } from '../types';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listingsData, categoriesData] = await Promise.all([
        getAllListings(selectedCategory),
        getAllCategories()
      ]);
      setListings(listingsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Verileri başlangıçta yükle
  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  // Socket.io dinleyicileri
  useEffect(() => {
    // Yeni teklif geldiğinde
    const handleBidUpdate = (data) => {
      console.log('Yeni teklif:', data);
      
      // Mevcut listeyi güncelle
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === data.listing._id ? data.listing : listing
        )
      );
      
      // Bildirim göster
      showNotification(`${data.bid.bidder.name} ${data.listing.title} için ${data.bid.price} TL teklif verdi.`);
    };

    // Yeni ilan eklendiğinde
    const handleNewListing = (data) => {
      console.log('Yeni ilan:', data);
      
      // İlan seçili kategori filtresine uyuyorsa listeye ekle
      if (!selectedCategory || data.category?._id === selectedCategory) {
        setListings(prevListings => [data, ...prevListings]);
        showNotification('Yeni bir ilan oluşturuldu: ' + data.title);
      }
    };

    // İlan güncellendiğinde
    const handleListingUpdated = (data) => {
      console.log('İlan güncellendi:', data);
      
      // Listeyi güncelle
      setListings(prevListings => 
        prevListings.map(listing => 
          listing._id === data._id ? data : listing
        )
      );
    };

    // İlan silindiğinde
    const handleListingDeleted = (data) => {
      console.log('İlan silindi:', data);
      
      // Listeden kaldır
      setListings(prevListings => 
        prevListings.filter(listing => listing._id !== data.listingId)
      );
    };

    // Kategori güncellendiğinde
    const handleCategoryChanged = (data) => {
      console.log('Kategori değişimi:', data);
      
      if (data.type === 'create') {
        setCategories(prev => [...prev, data.category]);
      } 
      else if (data.type === 'update') {
        setCategories(prev => 
          prev.map(cat => 
            cat._id === data.category._id ? data.category : cat
          )
        );
      } 
      else if (data.type === 'delete') {
        setCategories(prev => 
          prev.filter(cat => cat._id !== data.categoryId)
        );
        
        // Eğer silinen kategori seçiliyse, seçimi kaldır
        if (selectedCategory === data.categoryId) {
          setSelectedCategory(null);
        }
      }
    };

    // Socket dinleyicilerini ekle
    on('bidUpdate', handleBidUpdate);
    on('listingCreated', handleNewListing);
    on('listingUpdated', handleListingUpdated);
    on('listingDeleted', handleListingDeleted);
    on('categoryChanged', handleCategoryChanged);

    // Temizleme
    return () => {
      off('bidUpdate', handleBidUpdate);
      off('listingCreated', handleNewListing);
      off('listingUpdated', handleListingUpdated);
      off('listingDeleted', handleListingDeleted);
      off('categoryChanged', handleCategoryChanged);
    };
  }, [on, off, selectedCategory]);

  const showNotification = (message) => {
    setSnackMessage(message);
    setSnackVisible(true);
    
    // Android için native bildirim
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeLeft = (expiresAt: string) => {
    const expiryTime = new Date(expiresAt).getTime();
    const currentTime = new Date().getTime();
    const timeLeft = expiryTime - currentTime;
    
    if (timeLeft <= 0) return 'Süresi doldu';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}s ${minutes}dk`;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size={50}
          color="#4F46E5"
          animating={true}
        />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Headline style={styles.headline}>Ters Açık Artırma</Headline>
          <Text style={styles.subheadline}>
            En uygun fiyatları bulmak için ters açık artırma platformu
          </Text>
        </View>

        <Searchbar
          placeholder="İlan ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Kategoriler */}
        <Title style={styles.sectionTitle}>Kategoriler</Title>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity 
              key={category._id} 
              onPress={() => handleCategorySelect(category._id)}
              style={[
                styles.categoryChip,
                selectedCategory === category._id && styles.selectedCategoryChip
              ]}
            >
              <Text 
                style={[
                  styles.categoryChipText, 
                  selectedCategory === category._id && styles.selectedCategoryChipText
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Aktif İlanlar */}
        <Title style={styles.sectionTitle}>Aktif İlanlar</Title>
        {filteredListings.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? "Aramanızla eşleşen ilan bulunamadı" 
                  : selectedCategory 
                    ? "Bu kategoride aktif ilan bulunmamaktadır" 
                    : "Aktif ilan bulunmamaktadır"}
              </Text>
            </Card.Content>
          </Card>
        ) : (
          filteredListings.map(listing => (
            <Card 
              key={listing._id} 
              style={styles.card}
              onPress={() => navigation.navigate('ListingDetail', { id: listing._id })}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.cardTitle}>{listing.title}</Title>
                  <Chip style={styles.priceChip} textStyle={styles.priceChipText}>
                    {formatPrice(listing.currentPrice || listing.initialMaxPrice)}
                  </Chip>
                </View>
                
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {listing.description}
                </Text>
                
                <View style={styles.cardDetails}>
                  <Text style={styles.detailText}>
                    Miktar: {listing.quantity} {listing.unit}
                  </Text>
                  <Text style={styles.detailText}>
                    Kalan Süre: {calculateTimeLeft(listing.expiresAt)}
                  </Text>
                  <Text style={styles.detailText}>
                    Son Teklif: {formatPrice(listing.currentPrice || listing.initialMaxPrice)}
                  </Text>
                </View>
              </Card.Content>
              
              <Card.Actions style={styles.cardActions}>
                <Button 
                  mode="contained" 
                  onPress={() => navigation.navigate('ListingDetail', { id: listing._id })}
                  style={styles.viewButton}
                >
                  Detayları Gör
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}

        {/* Yeni İlan Oluştur Butonu (sadece giriş yapmış ve onaylanmış kullanıcılar için) */}
        {/* Şu an CreateListing ekranı bulunmadığı için bu buton geçici olarak devre dışı bırakıldı
        {user && user.isApproved && (
          <Button 
            mode="contained" 
            icon="plus" 
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateListing')}
          >
            Yeni İlan Oluştur
          </Button>
        )}
        */}
      </ScrollView>
      
      {/* Bildirim Snackbar */}
      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={3000}
        action={{
          label: 'Tamam',
          onPress: () => setSnackVisible(false),
        }}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  header: {
    padding: 16,
    backgroundColor: '#4F46E5',
  },
  headline: {
    color: 'white',
    fontWeight: 'bold',
  },
  subheadline: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    paddingHorizontal: 8,
    marginVertical: 8,
  },
  categoryChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    elevation: 2,
  },
  selectedCategoryChip: {
    backgroundColor: '#4F46E5',
  },
  categoryChipText: {
    color: '#4B5563',
  },
  selectedCategoryChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  emptyCard: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#4B5563',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    marginRight: 8,
    fontSize: 18,
  },
  priceChip: {
    backgroundColor: '#EBF5FF',
  },
  priceChipText: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  cardDescription: {
    color: '#4B5563',
    marginBottom: 8,
  },
  cardDetails: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    marginVertical: 2,
    color: '#374151',
  },
  cardActions: {
    justifyContent: 'flex-end',
    padding: 8,
  },
  viewButton: {
    borderRadius: 20,
  },
  createButton: {
    margin: 16,
    paddingVertical: 8,
    backgroundColor: '#10B981',
  },
});

export default HomeScreen; 