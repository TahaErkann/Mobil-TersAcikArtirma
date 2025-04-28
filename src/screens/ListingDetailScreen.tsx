import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList
} from 'react-native';
import { 
  Text, 
  Appbar, 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  Button, 
  Divider,
  Avatar,
  Badge,
  Surface,
  Portal,
  Dialog,
  TextInput,
  List,
  Subheading,
  ActivityIndicator,
  Caption
} from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { getListingById, placeBid, acceptBid, rejectBid } from '../services/listingService';
import { Listing, Bid, User, ListingItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatDistanceToNow, format, isPast, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

type ListingDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ListingDetail'>;
  navigation: StackNavigationProp<RootStackParamList, 'ListingDetail'>;
};

const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params;
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bidDialogVisible, setBidDialogVisible] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // İlanı yükle
  const loadListing = useCallback(async () => {
    try {
      setError(null);
      const data = await getListingById(id);
      console.log("Gelen ilan verileri:", JSON.stringify(data, null, 2));
      console.log("Ürün listesi:", data.items ? JSON.stringify(data.items, null, 2) : "Ürün yok");
      setListing(data);
    } catch (err) {
      console.error('İlan detayı yüklenirken hata:', err);
      setError('İlan detayı yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);
  
  // İlk yükleme
  useEffect(() => {
    loadListing();
  }, [loadListing]);
  
  // Yenileme durumu
  const onRefresh = () => {
    setRefreshing(true);
    loadListing();
  };
  
  // Teklif verme dialogunu aç
  const openBidDialog = () => {
    if (!user) {
      Alert.alert('Giriş Yapın', 'Teklif vermek için giriş yapmanız gerekmektedir.');
      return;
    }
    
    if (!user.isApproved) {
      Alert.alert('Onay Bekliyor', 'Teklif vermek için hesabınızın onaylanması gerekmektedir.');
      return;
    }
    
    if (listing?.owner === user._id || 
        (typeof listing?.owner === 'object' && listing?.owner._id === user._id)) {
      Alert.alert('İzin Verilmedi', 'Kendi ilanınıza teklif veremezsiniz.');
      return;
    }
    
    setBidAmount(listing?.currentPrice.toString() || '');
    setBidDialogVisible(true);
  };
  
  // Teklif ver
  const handleBid = async () => {
    if (!listing) return;
    
    const bidValue = Number(bidAmount);
    
    if (isNaN(bidValue) || bidValue <= 0) {
      Alert.alert('Geçersiz Tutar', 'Lütfen geçerli bir teklif tutarı girin.');
      return;
    }
    
    if (bidValue > listing.currentPrice) {
      Alert.alert('Geçersiz Tutar', 'Teklifiniz mevcut fiyattan düşük olmalıdır. Bu bir ters açık artırmadır.');
      return;
    }
    
    try {
      setSubmitting(true);
      await placeBid(listing._id, bidValue);
      setBidDialogVisible(false);
      Alert.alert(
        'Teklif Verildi', 
        'Teklifiniz başarıyla kaydedildi. Teklifinizin geçerlilik süresi 12 saattir.',
        [{ text: 'Tamam', onPress: onRefresh }]
      );
    } catch (err) {
      console.error('Teklif verme hatası:', err);
      Alert.alert('Hata', 'Teklif verilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Teklifi kabul et
  const handleAcceptBid = async (bidId: string) => {
    if (!listing) return;
    
    Alert.alert(
      'Teklifi Kabul Et',
      'Bu teklifi kabul etmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Kabul Et', 
          onPress: async () => {
            try {
              setLoading(true);
              await acceptBid(listing._id, bidId);
              Alert.alert('Başarılı', 'Teklif başarıyla kabul edildi.');
              loadListing();
            } catch (err) {
              console.error('Teklif kabul hatası:', err);
              Alert.alert('Hata', 'Teklif kabul edilirken bir hata oluştu.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Teklifi reddet
  const handleRejectBid = async (bidId: string) => {
    if (!listing) return;
    
    Alert.alert(
      'Teklifi Reddet',
      'Bu teklifi reddetmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Reddet', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await rejectBid(listing._id, bidId);
              Alert.alert('Başarılı', 'Teklif başarıyla reddedildi.');
              loadListing();
            } catch (err) {
              console.error('Teklif reddetme hatası:', err);
              Alert.alert('Hata', 'Teklif reddedilirken bir hata oluştu.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // İlanın sahibi olup olmadığını kontrol et
  const isOwner = () => {
    if (!user || !listing) return false;
    
    return listing.owner === user._id || 
           (typeof listing.owner === 'object' && listing.owner._id === user._id);
  };
  
  // Durum etiketini al 
  const getStatusBadge = () => {
    if (!listing) return null;
    
    let badgeText = '';
    let badgeColor = '';
    
    switch (listing.status) {
      case 'active':
        badgeText = 'Aktif';
        badgeColor = '#10B981'; // Yeşil
        break;
      case 'completed':
        badgeText = 'Tamamlandı';
        badgeColor = '#3B82F6'; // Mavi
        break;
      case 'cancelled':
        badgeText = 'İptal Edildi';
        badgeColor = '#EF4444'; // Kırmızı
        break;
      case 'expired':
        badgeText = 'Süresi Doldu';
        badgeColor = '#F59E0B'; // Sarı
        break;
      default:
        badgeText = 'Bilinmiyor';
        badgeColor = '#6B7280'; // Gri
    }
    
    return (
      <Chip 
        mode="outlined" 
        style={[styles.badge, { borderColor: badgeColor }]}
        textStyle={{ color: badgeColor }}
      >
        {badgeText}
      </Chip>
    );
  };
  
  // İlanın süresi dolmuş mu kontrol et
  const isExpired = (): boolean => {
    if (!listing || !listing.expiresAt) return false;
    return safeIsPast(listing.expiresAt);
  };
  
  // Tarih işleme güvenlik fonksiyonları
  const safeFormatDate = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "Belirtilmemiş";
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error("Geçersiz tarih formatı:", dateStr);
        return "Geçersiz tarih";
      }
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      console.error("Tarih formatı hatası:", error);
      return "Geçersiz tarih";
    }
  };

  const safeFormatDistanceToNow = (dateStr: string | undefined | null): string => {
    if (!dateStr) return "Belirtilmemiş";
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error("Geçersiz tarih formatı:", dateStr);
        return "Geçersiz tarih";
      }
      return formatDistanceToNow(date, { locale: tr, addSuffix: true });
    } catch (error) {
      console.error("Tarih formatı hatası:", error);
      return "Geçersiz tarih";
    }
  };

  const safeIsPast = (dateStr: string | undefined | null): boolean => {
    if (!dateStr) return false;
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error("Geçersiz tarih formatı:", dateStr);
        return false;
      }
      return isPast(date);
    } catch (error) {
      console.error("Tarih kontrol hatası:", error);
      return false;
    }
  };
  
  // Teklif durumuna göre renk döndür
  const getBidStatusColor = (status: string, isExpired: boolean): string => {
    if (isExpired && status === 'pending') return '#9CA3AF'; // Gri
    
    switch (status) {
      case 'accepted': return '#10B981'; // Yeşil
      case 'rejected': return '#EF4444'; // Kırmızı
      case 'expired': return '#9CA3AF'; // Gri
      case 'pending': return '#3B82F6'; // Mavi
      default: return '#6B7280'; // Gri
    }
  };
  
  // Teklif durumunun metin açıklamasını döndür
  const getBidStatusText = (status: string, isExpired: boolean): string => {
    switch (status) {
      case 'pending':
        return isExpired ? 'Süresi Doldu' : 'Beklemede';
      case 'accepted':
        return 'Kabul Edildi';
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };
  
  // Yükleme durumu
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>İlan yükleniyor...</Text>
      </View>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={loadListing} style={styles.retryButton}>
          Tekrar Dene
        </Button>
      </View>
    );
  }
  
  // İlan bulunamadı
  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="document-outline" size={50} color="#6B7280" />
        <Text style={styles.errorText}>İlan bulunamadı</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Geri Dön
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="İlan Detayı" />
      </Appbar.Header>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.detailContainer}>
          {/* Başlık Kısmı */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                  <Title style={styles.title}>{listing.title}</Title>
                  {getStatusBadge()}
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Chip icon="tag" style={styles.chip}>
                  {typeof listing.category === 'object' 
                    ? listing.category.name 
                    : 'Kategori'}
                </Chip>
                <Chip 
                  icon="calendar" 
                  style={styles.chip}
                >
                  {listing.createdAt ? safeFormatDate(listing.createdAt) : 'Belirtilmemiş'}
                </Chip>
                <Chip 
                  icon="clock-outline" 
                  style={styles.chip}
                  textStyle={{ color: isExpired() ? '#EF4444' : '#4B5563' }}
                >
                  {isExpired() 
                    ? 'Süresi Doldu' 
                    : listing.expiresAt 
                      ? safeFormatDistanceToNow(listing.expiresAt) 
                      : 'Belirtilmemiş'
                  }
                </Chip>
              </View>
              
              {listing.description && (
                <Paragraph style={styles.description}>
                  {listing.description}
                </Paragraph>
              )}
              
              <Divider style={styles.divider} />
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Mevcut Fiyat:</Text>
                <Text style={styles.price}>{listing.currentPrice} TL</Text>
              </View>
              
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Başlangıç Fiyatı:</Text>
                <Text style={styles.initialPrice}>{listing.initialMaxPrice} TL</Text>
              </View>
              
              {!isOwner() && listing.status === 'active' && !isExpired() && (
                <Button 
                  mode="contained" 
                  icon="cash" 
                  onPress={openBidDialog}
                  style={styles.bidButton}
                >
                  Teklif Ver
                </Button>
              )}
            </Card.Content>
          </Card>
          
          {/* Ürünler Listesi */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Ürün Listesi</Title>
              
              {/* Debug bilgisi */}
              <View style={styles.debugContainer}>
                <Text style={styles.debugText}>
                  Items tipi: {typeof listing.items} | 
                  Array mi?: {Array.isArray(listing.items) ? 'Evet' : 'Hayır'} | 
                  Uzunluk: {Array.isArray(listing.items) ? listing.items.length : 'Bilinmiyor'}
                </Text>
              </View>
              
              {Array.isArray(listing.items) && listing.items.length > 0 ? (
                <View>
                  {listing.items.map((item, index) => (
                    <Surface key={`item-${index}`} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{item.name || 'İsimsiz Ürün'}</Text>
                        <Chip style={styles.quantityChip}>
                          {item.quantity || 0} {item.unit || 'Adet'}
                        </Chip>
                      </View>
                      
                      {item.description && (
                        <Paragraph style={styles.itemDescription}>
                          {item.description}
                        </Paragraph>
                      )}
                    </Surface>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Surface style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemName}>{listing.title || 'İlan Ürünü'}</Text>
                      <Chip style={styles.quantityChip}>
                        {(listing as any).quantity || 0} {(listing as any).unit || 'Adet'}
                      </Chip>
                    </View>
                    
                    {listing.description && (
                      <Paragraph style={styles.itemDescription}>
                        {listing.description}
                      </Paragraph>
                    )}
                  </Surface>
                  <Caption style={styles.emptyStateCaption}>
                    Bu ilanda detaylı ürün listesi bulunmuyor. Genel ürün bilgileri gösteriliyor.
                  </Caption>
                </View>
              )}
            </Card.Content>
          </Card>
          
          {/* Teklifler Listesi */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.headerRow}>
                <Title style={styles.sectionTitle}>Teklifler</Title>
                <Chip icon="gavel">{listing.bids && listing.bids.length || 0} Teklif</Chip>
              </View>
              
              {!listing.bids || listing.bids.length === 0 ? (
                <View style={styles.emptyState}>
                  <Caption>Henüz teklif bulunmamaktadır</Caption>
                </View>
              ) : (
                listing.bids.map((bid) => {
                  const bidder = typeof bid.bidder === 'object' ? bid.bidder : null;
                  
                  return (
                    <Surface key={bid._id} style={styles.bidCard}>
                      <View style={styles.bidHeader}>
                        <View style={styles.bidderInfo}>
                          <Avatar.Text 
                            size={36} 
                            label={bidder ? bidder.name.charAt(0) : '?'} 
                          />
                          <View style={styles.bidderDetails}>
                            <Text style={styles.bidderName}>
                              {bidder ? bidder.name : 'Kullanıcı'}
                            </Text>
                            <Text style={styles.bidTime}>
                              {safeFormatDate(bid.createdAt)}
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.bidAmount}>
                          <Text style={styles.bidPrice}>{bid.price} TL</Text>
                          <Chip 
                            style={[
                              styles.statusChip, 
                              { backgroundColor: getBidStatusColor(bid.status, safeIsPast(bid.expiresAt)) }
                            ]}
                            textStyle={{ color: '#FFFFFF' }}
                          >
                            {getBidStatusText(bid.status, safeIsPast(bid.expiresAt))}
                          </Chip>
                        </View>
                      </View>
                      
                      {(bid.status === 'pending' && !safeIsPast(bid.expiresAt)) && isOwner() && (
                        <View style={styles.bidActions}>
                          <Button 
                            mode="outlined" 
                            onPress={() => handleRejectBid(bid._id)}
                            style={[styles.actionButton, styles.rejectButton]}
                          >
                            Reddet
                          </Button>
                          <Button 
                            mode="contained" 
                            onPress={() => handleAcceptBid(bid._id)}
                            style={[styles.actionButton, styles.acceptButton]}
                          >
                            Kabul Et
                          </Button>
                        </View>
                      )}
                      
                      {(bid.status === 'pending' && !safeIsPast(bid.expiresAt)) && (
                        <Text style={styles.expiryInfo}>
                          {safeIsPast(bid.expiresAt)
                            ? 'Teklif süresi doldu' 
                            : `Teklif süresi: ${safeFormatDate(bid.expiresAt)}`}
                        </Text>
                      )}
                    </Surface>
                  );
                })
              )}
            </Card.Content>
          </Card>
          
          {/* Satıcı Bilgileri */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Satıcı Bilgileri</Title>
              
              <View style={styles.sellerInfo}>
                <Avatar.Text 
                  size={50} 
                  label={
                    typeof listing.owner === 'object' 
                      ? listing.owner.name.charAt(0) 
                      : '?'
                  } 
                />
                
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>
                    {typeof listing.owner === 'object' 
                      ? listing.owner.name 
                      : 'Satıcı'}
                  </Text>
                  
                  {typeof listing.owner === 'object' && listing.owner.companyInfo?.companyName && (
                    <Text style={styles.companyName}>
                      {listing.owner.companyInfo.companyName}
                    </Text>
                  )}
                  
                  <Text style={styles.memberSince}>
                    Kayıt Tarihi: {
                      typeof listing.owner === 'object' && listing.owner.createdAt
                        ? safeFormatDate(listing.owner.createdAt)
                        : 'Belirtilmemiş'
                    }
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
          
          {/* İlan İçeriği */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>İlan İçeriği</Title>
              
              <View style={styles.contentContainer}>
                {/* İlan Miktar ve Birim Bilgileri */}
                {(listing as any).quantity !== undefined && (
                  <View style={styles.contentRow}>
                    <Text style={styles.contentLabel}>Toplam Miktar:</Text>
                    <Text style={styles.contentValue}>
                      {(listing as any).quantity || 0} {(listing as any).unit || 'Adet'}
                    </Text>
                  </View>
                )}
                
                {/* Konum Bilgisi */}
                {(listing as any).location && (
                  <View style={styles.contentRow}>
                    <Text style={styles.contentLabel}>Konum:</Text>
                    <Text style={styles.contentValue}>{(listing as any).location}</Text>
                  </View>
                )}

                {/* Açıklama */}
                {listing.description && (
                  <View style={styles.contentDescription}>
                    <Text style={styles.contentLabel}>Detaylı Açıklama:</Text>
                    <Paragraph style={styles.contentDescriptionText}>
                      {listing.description}
                    </Paragraph>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
      
      {/* Teklif Verme Dialog */}
      <Portal>
        <Dialog
          visible={bidDialogVisible}
          onDismiss={() => setBidDialogVisible(false)}
        >
          <Dialog.Title>Teklif Ver</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.bidNote}>
              Bu bir ters açık artırmadır. Teklifiniz mevcut fiyattan düşük olmalıdır.
            </Paragraph>
            <Paragraph style={styles.bidNote}>
              Mevcut Fiyat: {listing.currentPrice} TL
            </Paragraph>
            
            <TextInput
              label="Teklif Tutarı (TL)"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.bidInput}
              maxFontSizeMultiplier={1}
              autoComplete="off"
              autoCorrect={false}
              dense={true}
              textContentType="none"
              spellCheck={false}
              allowFontScaling={false}
            />
            
            <Paragraph style={styles.bidWarning}>
              Not: Teklifiniz 12 saat boyunca geçerli olacaktır. Bu süre içinde satıcı teklifinizi kabul edebilir veya reddedebilir.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBidDialogVisible(false)}>İptal</Button>
            <Button 
              onPress={handleBid} 
              loading={submitting}
              disabled={submitting}
            >
              Teklif Ver
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  detailContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
    marginBottom: 8,
    color: '#4B5563',
  },
  divider: {
    marginVertical: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  initialPrice: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  bidButton: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  itemCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityChip: {
    backgroundColor: '#E5E7EB',
  },
  itemDescription: {
    color: '#6B7280',
  },
  bidCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bidderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidderDetails: {
    marginLeft: 8,
  },
  bidderName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bidTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  bidAmount: {
    alignItems: 'flex-end',
  },
  bidPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
  bidActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    minWidth: 100,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    borderColor: '#EF4444',
  },
  expiryInfo: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerDetails: {
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 14,
    color: '#4B5563',
  },
  memberSince: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginVertical: 16,
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  bidNote: {
    marginBottom: 12,
  },
  bidInput: {
    marginVertical: 12,
  },
  bidWarning: {
    marginTop: 12,
    fontSize: 12,
    color: '#EF4444',
    fontStyle: 'italic',
  },
  contentContainer: {
    padding: 12,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentLabel: {
    fontSize: 16,
    color: '#4B5563',
  },
  contentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  contentDescription: {
    marginTop: 12,
  },
  contentDescriptionText: {
    color: '#6B7280',
  },
  debugContainer: {
    marginBottom: 12,
  },
  debugText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyStateCaption: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default ListingDetailScreen; 