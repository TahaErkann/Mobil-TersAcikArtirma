import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { Text, Title, Card, Chip, Button, TextInput, ActivityIndicator, Divider, Banner } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { getListingById, placeBid } from '../services/listingService';
import { Listing } from '../types';

type RouteParams = {
  id: string;
};

const ListingDetailScreen = ({ route, navigation }: { route: { params: RouteParams }, navigation: any }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const { on, off } = useSocket();
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [error, setError] = useState('');
  const [bannerVisible, setBannerVisible] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');

  // İlan bilgilerini getir
  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      try {
        const data = await getListingById(id);
        setListing(data);
      } catch (error) {
        console.error('İlan detayları getirilirken hata:', error);
        setError('İlan bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);
  
  // Socket.io dinleyicileri
  useEffect(() => {
    const handleBidUpdate = (data: any) => {
      if (data.listing._id === id) {
        setListing(data.listing);
        
        // Eğer yeni teklif başka bir kullanıcıdan geldiyse bildirim göster
        if (data.bid.bidder._id !== user?._id) {
          showBanner(`Yeni teklif: ${formatPrice(data.bid.price)}`);
        }
      }
    };
    
    const handleListingUpdated = (data: any) => {
      if (data._id === id) {
        setListing(data);
      }
    };
    
    on('bidUpdate', handleBidUpdate);
    on('listingUpdated', handleListingUpdated);
    
    return () => {
      off('bidUpdate', handleBidUpdate);
      off('listingUpdated', handleListingUpdated);
    };
  }, [id, user, on, off]);

  const showBanner = (message: string) => {
    setBannerMessage(message);
    setBannerVisible(true);
    
    // 3 saniye sonra banner'ı kapat
    setTimeout(() => {
      setBannerVisible(false);
    }, 3000);
  };

  const handlePlaceBid = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    
    if (!user.isApproved) {
      Alert.alert('Yetkisiz İşlem', 'Teklif vermek için firmanızın onaylanması gerekiyor.');
      return;
    }
    
    // Teklif sahibinin kendi ilanına teklif vermesini engelle
    if (listing?.owner._id === user._id) {
      Alert.alert('Hata', 'Kendi ilanınıza teklif veremezsiniz.');
      return;
    }
    
    // Giriş değerini kontrol et
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Lütfen geçerli bir teklif tutarı giriniz.');
      return;
    }
    
    // Mevcut en düşük tekliften daha yüksek teklif verilmesini engelle
    const currentLowestBid = listing?.currentPrice || listing?.initialMaxPrice || 0;
    
    if (amount >= currentLowestBid) {
      setError(`Teklifiniz, mevcut en düşük tekliften (${formatPrice(currentLowestBid)}) daha düşük olmalıdır.`);
      return;
    }
    
    // Mevcut en düşük tekliften en az %5 daha düşük olmalı
    if (amount > currentLowestBid * 0.95) {
      setError(`Teklifiniz, mevcut en düşük tekliften en az %5 daha düşük olmalıdır.`);
      return;
    }
    
    setBidLoading(true);
    setError('');
    
    try {
      await placeBid(id, amount);
      setBidAmount('');
      showBanner('Teklifiniz başarıyla kaydedildi!');
    } catch (error: any) {
      console.error('Teklif verilirken hata:', error);
      setError(error.response?.data?.message || 'Teklif verme işlemi başarısız oldu.');
    } finally {
      setBidLoading(false);
    }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator 
          size={50} 
          color="#4F46E5"
          animating={true}
        />
        <Text style={styles.loadingText}>İlan yükleniyor...</Text>
      </View>
    );
  }

  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'İlan bulunamadı.'}</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Geri Dön
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Banner
        visible={bannerVisible}
        actions={[
          {
            label: 'Tamam',
            onPress: () => setBannerVisible(false),
          },
        ]}
      >
        {bannerMessage}
      </Banner>
      
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>{listing.title}</Title>
            
            <View style={styles.chipContainer}>
              <Chip 
                style={styles.statusChip} 
                textStyle={{ color: listing.status === 'active' ? '#047857' : '#DC2626' }}
              >
                {listing.status === 'active' ? 'Aktif' : 
                 listing.status === 'completed' ? 'Tamamlandı' : 
                 listing.status === 'cancelled' ? 'İptal Edildi' : 'Süresi Doldu'}
              </Chip>
              
              <Chip style={styles.priceChip}>
                {formatPrice(listing.currentPrice || listing.initialMaxPrice)}
              </Chip>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>İlan Detayları</Text>
            <Text style={styles.description}>{listing.description}</Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Miktar:</Text>
                <Text style={styles.detailValue}>{listing.quantity} {listing.unit}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kategori:</Text>
                <Text style={styles.detailValue}>{listing.category?.name || 'Belirtilmemiş'}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>İlan Sahibi:</Text>
                <Text style={styles.detailValue}>{listing.owner?.companyInfo?.companyName || listing.owner?.name}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>İlan Tarihi:</Text>
                <Text style={styles.detailValue}>{formatDate(listing.createdAt)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Kalan Süre:</Text>
                <Text style={styles.detailValue}>{calculateTimeLeft(listing.expiresAt)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Başlangıç Fiyatı:</Text>
                <Text style={styles.detailValue}>{formatPrice(listing.initialMaxPrice)}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mevcut En Düşük Teklif:</Text>
                <Text style={styles.detailValue}>{formatPrice(listing.currentPrice || listing.initialMaxPrice)}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Son Teklifler</Text>
            {listing.bids && listing.bids.length > 0 ? (
              listing.bids.map((bid, index) => (
                <Card key={index} style={styles.bidCard}>
                  <Card.Content>
                    <View style={styles.bidRow}>
                      <Text style={styles.bidderName}>{bid.bidder?.name || 'Bilinmeyen Kullanıcı'}</Text>
                      <Text style={styles.bidAmount}>{formatPrice(bid.price)}</Text>
                    </View>
                    <Text style={styles.bidTime}>{formatDate(bid.createdAt)}</Text>
                  </Card.Content>
                </Card>
              ))
            ) : (
              <Text style={styles.noBidsText}>Henüz teklif verilmemiş.</Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Teklif verme formu (sadece aktif ilanlar için) */}
        {listing.status === 'active' && user && user._id !== listing.owner._id && (
          <Card style={styles.bidFormCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Teklif Ver</Text>
              <TextInput
                label="Teklif Tutarı (TL)"
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
                mode="outlined"
                error={!!error}
                disabled={bidLoading}
                style={styles.bidInput}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <Button
                mode="contained"
                onPress={handlePlaceBid}
                loading={bidLoading}
                disabled={bidLoading}
                style={styles.bidButton}
              >
                Teklif Ver
              </Button>
              
              <Text style={styles.bidInfo}>
                * Teklifiniz mevcut en düşük tekliften en az %5 daha düşük olmalıdır.
              </Text>
            </Card.Content>
          </Card>
        )}
        
        {/* İlan sahibi için iptal/tamamla butonları */}
        {listing.status === 'active' && user && user._id === listing.owner._id && (
          <Card style={styles.ownerActionsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>İlan İşlemleri</Text>
              <Button
                mode="contained"
                onPress={() => Alert.alert(
                  'İlan İptal',
                  'Bu ilanı iptal etmek istediğinize emin misiniz?',
                  [
                    { text: 'Vazgeç', style: 'cancel' },
                    { text: 'İptal Et', style: 'destructive', onPress: () => {} }
                  ]
                )}
                style={[styles.actionButton, { backgroundColor: '#DC2626' }]}
              >
                İlanı İptal Et
              </Button>
              
              {listing.bids && listing.bids.length > 0 && (
                <Button
                  mode="contained"
                  onPress={() => Alert.alert(
                    'İlan Tamamla',
                    'Bu ilanı tamamlamak ve en düşük teklifi kabul etmek istediğinize emin misiniz?',
                    [
                      { text: 'Vazgeç', style: 'cancel' },
                      { text: 'Tamamla', style: 'default', onPress: () => {} }
                    ]
                  )}
                  style={[styles.actionButton, { backgroundColor: '#059669' }]}
                >
                  İlanı Tamamla
                </Button>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
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
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 10,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statusChip: {
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  priceChip: {
    backgroundColor: '#EBF5FF',
  },
  divider: {
    marginVertical: 15,
    height: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  description: {
    fontSize: 16,
    marginBottom: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailValue: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  bidCard: {
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 0,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  bidTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  noBidsText: {
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  bidFormCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 3,
  },
  bidInput: {
    marginBottom: 5,
  },
  bidButton: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#059669',
  },
  bidInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  ownerActionsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 3,
  },
  actionButton: {
    marginVertical: 5,
  },
});

export default ListingDetailScreen; 