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
import { getMyBids } from '../services/listingService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

interface MyBid {
  _id: string;
  amount: number;
  createdAt: string;
  listing: {
    _id: string;
    title: string;
    description: string;
    category: any;
    startingPrice: number;
    currentPrice: number;
    endDate: string;
    status: string;
  };
}

const MyBidsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('MyBidsScreen: API çağrısı başlatılıyor...');
      const data = await getMyBids();
      console.log('MyBidsScreen: API yanıtı alındı:', data);
      console.log('MyBidsScreen: Teklif sayısı:', data?.length || 0);
      setBids(data || []);
    } catch (err) {
      console.error('Teklifler yüklenirken hata:', err);
      setError('Teklifler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyBids();
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

  const getBidStatus = (bid: any) => {
    if (!bid || !bid.listing) {
      return { label: 'Bilinmeyen', color: '#9E9E9E' };
    }

    const now = new Date();
    const endDate = new Date(bid.listing.endDate || bid.listing.expiresAt);
    const isExpired = endDate < now;
    const isWinning = bid.amount === bid.listing.currentPrice;
    const isActive = bid.listing.status === 'active';

    if (!isActive) {
      return { label: 'İlan Pasif', color: '#9E9E9E' };
    } else if (isExpired) {
      if (isWinning) {
        return { label: 'Kazandı', color: '#4CAF50' };
      } else {
        return { label: 'Kaybetti', color: '#F44336' };
      }
    } else {
      if (isWinning) {
        return { label: 'Önde', color: '#4CAF50' };
      } else {
        return { label: 'Geride', color: '#FF9800' };
      }
    }
  };

  const getTimeRemaining = (endDateString: string) => {
    if (!endDateString) {
      return 'Tarih Belirtilmemiş';
    }

    const now = new Date();
    const endDate = new Date(endDateString);
    const timeLeft = endDate.getTime() - now.getTime();

    if (timeLeft <= 0) {
      return 'Süresi Dolmuş';
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} gün ${hours} saat`;
    } else if (hours > 0) {
      return `${hours} saat`;
    } else {
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} dakika`;
    }
  };

  if (!user?.isApproved) {
    return (
      <View style={styles.container}>
        <View style={styles.notApprovedContainer}>
          <Text style={styles.notApprovedTitle}>Firma Onayı Bekleniyor</Text>
          <Text style={styles.notApprovedText}>
            Teklif verebilmek için önce firma bilgilerinizin onaylanması gerekmektedir.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tekliflerim</Text>
        <Text style={styles.subtitle}>
          Verdiğiniz teklifleri takip edin ve sonuçları görün
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
            {bids.length === 0 ? (
              <Surface style={styles.emptyContainer} elevation={2}>
                <Text style={styles.emptyTitle}>Henüz Teklif Vermediniz</Text>
                <Text style={styles.emptyText}>
                  İlanları inceleyerek teklif vermeye başlayabilirsiniz.
                </Text>
              </Surface>
            ) : (
              <View style={styles.bidsContainer}>
                {bids.map((bid) => {
                  if (!bid || !bid.listing) {
                    return null;
                  }

                  const bidStatus = getBidStatus(bid);
                  
                  return (
                    <Surface key={bid._id} style={styles.bidCard} elevation={3}>
                      <View style={styles.cardHeader}>
                        <Chip
                          style={[styles.statusChip, { backgroundColor: bidStatus.color }]}
                          textStyle={styles.statusChipText}
                        >
                          {bidStatus.label}
                        </Chip>
                      </View>

                      <Text style={styles.listingTitle}>{bid.listing.title || 'İlan Başlığı'}</Text>
                      
                      <Text style={styles.listingDescription} numberOfLines={2}>
                        {bid.listing.description || 'Açıklama bulunmuyor'}
                      </Text>

                      <Chip style={styles.categoryChip} textStyle={styles.categoryChipText}>
                        {typeof bid.listing.category === 'string' ? bid.listing.category : bid.listing.category?.name || 'Kategori'}
                      </Chip>

                      <View style={styles.priceContainer}>
                        <View style={styles.priceItem}>
                          <Text style={styles.priceLabel}>Verdiğim Teklif</Text>
                          <Text style={[
                            styles.priceValue,
                            { color: bid.amount === bid.listing.currentPrice ? '#4CAF50' : '#333' }
                          ]}>
                            {formatPrice(bid.amount || 0)}
                          </Text>
                        </View>

                        <View style={styles.priceItem}>
                          <Text style={styles.priceLabel}>Güncel En Düşük</Text>
                          <Text style={styles.priceValue}>
                            {formatPrice(bid.listing.currentPrice || 0)}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Başlangıç Fiyatı:</Text>
                          <Text style={styles.infoValue}>
                            {formatPrice(bid.listing.startingPrice || 0)}
                          </Text>
                        </View>

                        <View style={styles.infoItem}>
                          <Text style={styles.infoLabel}>Kalan Süre:</Text>
                          <Text style={[
                            styles.infoValue,
                            { color: new Date(bid.listing.endDate || bid.listing.expiresAt) < new Date() ? '#666' : '#FF9800' }
                          ]}>
                            {getTimeRemaining(bid.listing.endDate || bid.listing.expiresAt)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity 
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('ListingDetail', { id: bid.listing._id })}
                      >
                        <Text style={styles.viewButtonText}>İlanı Görüntüle</Text>
                      </TouchableOpacity>
                    </Surface>
                  );
                })}
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
  bidsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  bidCard: {
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
    textAlign: 'center',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
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

export default MyBidsScreen; 