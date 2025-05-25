import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Text, Surface, Chip } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { getMyListings } from '../services/listingService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

const MyListingsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyListings();
      setListings(data || []);
    } catch (err) {
      console.error('İlanlar yüklenirken hata:', err);
      setError('İlanlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyListings();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getStatusColor = (listing: any) => {
    const now = new Date();
    const endDate = new Date(listing.endDate || listing.expiresAt);
    const isExpired = endDate < now;
    const isActive = listing.status === 'active';

    if (!isActive) return '#9E9E9E';
    if (isExpired) return '#FF9800';
    return '#4CAF50';
  };

  const getStatusText = (listing: any) => {
    const now = new Date();
    const endDate = new Date(listing.endDate || listing.expiresAt);
    const isExpired = endDate < now;
    const isActive = listing.status === 'active';

    if (!isActive) return 'Pasif';
    if (isExpired) return 'Süresi Dolmuş';
    return 'Aktif';
  };

  if (!user?.isApproved) {
    return (
      <View style={styles.container}>
        <View style={styles.notApprovedContainer}>
          <Text style={styles.notApprovedTitle}>Firma Onayı Bekleniyor</Text>
          <Text style={styles.notApprovedText}>
            İlan oluşturabilmek için önce firma bilgilerinizin onaylanması gerekmektedir.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>İlanlarım</Text>
        <Text style={styles.subtitle}>
          Oluşturduğunuz ilanları yönetin ve teklifleri takip edin
        </Text>
      </View>

      {/* Loading */}
      {loading && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {!loading && !error && (
          <>
            {listings.length === 0 ? (
              <Surface style={styles.emptyContainer} elevation={2}>
                <Text style={styles.emptyTitle}>Henüz İlan Oluşturmadınız</Text>
                <Text style={styles.emptyText}>
                  İlk ilanınızı oluşturarak ters açık artırma sürecini başlatabilirsiniz.
                </Text>
              </Surface>
            ) : (
              <View style={styles.listingsContainer}>
                {listings.map((listing) => (
                  <Surface key={listing._id} style={styles.listingCard} elevation={3}>
                    <View style={styles.cardHeader}>
                      <Chip
                        style={[styles.statusChip, { backgroundColor: getStatusColor(listing) }]}
                        textStyle={styles.statusChipText}
                      >
                        {getStatusText(listing)}
                      </Chip>
                    </View>

                    <Text style={styles.listingTitle}>{listing.title}</Text>
                    
                    <Text style={styles.listingDescription} numberOfLines={2}>
                      {listing.description}
                    </Text>

                    <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                      {typeof listing.category === 'string' ? listing.category : listing.category?.name || 'Kategori'}
                    </Chip>

                    <View style={styles.priceContainer}>
                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Başlangıç</Text>
                        <Text style={styles.priceValue}>
                          {formatPrice(listing.startingPrice || listing.initialMaxPrice || 0)}
                        </Text>
                      </View>

                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Güncel</Text>
                        <Text style={[
                          styles.priceValue,
                          { color: (listing.currentPrice || 0) < (listing.startingPrice || listing.initialMaxPrice || 0) ? '#4CAF50' : '#333' }
                        ]}>
                          {formatPrice(listing.currentPrice || listing.initialMaxPrice || 0)}
                        </Text>
                      </View>

                      <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Teklif</Text>
                        <Text style={styles.priceValue}>
                          {listing.bids?.length || 0}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.dateContainer}>
                      <Text style={styles.dateLabel}>Bitiş Tarihi:</Text>
                      <Text style={styles.dateValue}>
                        {formatDate(listing.endDate || listing.expiresAt)}
                      </Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => navigation.navigate('ListingDetail', { id: listing._id })}
                    >
                      <Text style={styles.viewButtonText}>Detayları Gör</Text>
                    </TouchableOpacity>
                  </Surface>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F8',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#667eea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  notApprovedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notApprovedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  notApprovedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    margin: 20,
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  listingsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  listingCard: {
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  listingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    marginBottom: 16,
  },
  categoryChipText: {
    color: '#1976D2',
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  viewButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyListingsScreen; 