import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
  Linking
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
import { listingDetailStyles as styles } from '../styles/ListingDetailStyles';
import { 
  safeFormatDate, 
  safeFormatDistanceToNow, 
  safeIsPast,
  getBidStatusColor,
  getBidStatusText
} from '../utils/formatters';

type ListingDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ListingDetail'>;
  navigation: StackNavigationProp<RootStackParamList, 'ListingDetail'>;
};

// Dialog içeriği bileşeni
const BidderDetailDialog = ({ 
  selectedBid, 
  onRefresh, 
  onClose,
  getBidStatusColor,
  getBidStatusText,
  safeFormatDate
}: { 
  selectedBid: Bid | null;
  onRefresh: () => void;
  onClose: () => void;
  getBidStatusColor: (status: string, isExpired: boolean) => string;
  getBidStatusText: (status: string, isExpired: boolean) => string;
  safeFormatDate: (dateStr: string | undefined | null, formatStr?: string) => string;
}) => {
  if (!selectedBid) {
    return (
      <Dialog.Content>
        <Text>Seçilen teklif bulunamadı.</Text>
        <Button 
          mode="contained" 
          onPress={() => {
            onClose();
            onRefresh();
          }}
          style={{ marginTop: 16 }}
        >
          Sayfayı Yenile
        </Button>
      </Dialog.Content>
    );
  }

  // Teklif veren kullanıcı bilgisi - bidder veya user alanından
  const bidder = (typeof selectedBid.bidder === 'object' && selectedBid.bidder) 
    ? selectedBid.bidder 
    : (typeof selectedBid.user === 'object' && selectedBid.user)
      ? selectedBid.user 
      : null;
  
  // Debug için kullanıcı bilgilerini konsola yazdır
  console.log("Teklif Veren Kullanıcı Detayları:", bidder ? 
    JSON.stringify({
      _id: bidder._id, 
      name: bidder.name,
      email: bidder.email,
      phone: bidder.phone,
      address: bidder.address,
      companyInfo: bidder.companyInfo
    }) : "Bilgi yok"
  );
  
  if (!bidder) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Kullanıcı bilgileri yüklenemedi</Text>
          <Text style={{ marginBottom: 8 }}>Teklif veren kullanıcı bilgileri eksik veya hatalı.</Text>
          <Text style={{ marginBottom: 16 }}>Lütfen önce sayfayı yenileyip tekrar deneyiniz.</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              onClose();
              onRefresh();
            }}
            style={{ marginTop: 8 }}
          >
            Sayfayı Yenile
          </Button>
        </View>
      </Dialog.Content>
    );
  }
  
  // Yeterli bilgi var mı kontrol et
  const hasDetailedInfo = bidder.email || bidder.phone || bidder.address || 
                         (bidder.companyInfo && Object.keys(bidder.companyInfo).length > 0);
  
  if (!hasDetailedInfo) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Detaylı kullanıcı bilgileri bulunamadı</Text>
          <Text style={{ marginBottom: 8 }}>Teklif sahibinin bilgileri sistem tarafından tam olarak alınamadı.</Text>
          <Text style={{ marginBottom: 16 }}>Bilgileri almak için lütfen önce sayfayı yenileyin.</Text>
          
          <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Mevcut Bilgiler:</Text>
            <Text>Ad: {bidder.name || 'Belirtilmemiş'}</Text>
            {bidder.companyInfo && bidder.companyInfo.companyName && (
              <Text>Firma: {bidder.companyInfo.companyName}</Text>
            )}
          </View>
          
          <Button 
            mode="contained" 
            onPress={() => {
              onClose();
              onRefresh();
            }}
            style={{ marginTop: 8 }}
          >
            Sayfayı Yenile
          </Button>
        </View>
      </Dialog.Content>
    );
  }
  
  // Firma bilgileri varsa
  const hasCompanyInfo = bidder.companyInfo && Object.keys(bidder.companyInfo || {}).length > 0;
  
  return (
    <Dialog.Content>
      <ScrollView style={{ maxHeight: 400 }}>
        <View style={styles.bidderInfoDialog}>
          <Avatar.Text 
            size={50} 
            label={bidder.name?.charAt(0) || '?'} 
          />
          <View style={styles.bidderNameContainer}>
            <Text style={styles.bidderNameDialog}>
              {bidder.name || 'İsimsiz Kullanıcı'}
            </Text>
            <Chip 
              style={[
                styles.statusChip, 
                { backgroundColor: getBidStatusColor(selectedBid.status, false) }
              ]}
              textStyle={{ color: '#FFFFFF' }}
            >
              {getBidStatusText(selectedBid.status, false)}
            </Chip>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Section title="Teklif Bilgileri">
          <List.Item
            title="Teklif Tutarı"
            description={`${selectedBid.price || selectedBid.amount || 0} TL`}
            left={props => <List.Icon {...props} icon="cash" />}
          />
          
          <List.Item
            title="Teklif Tarihi"
            description={safeFormatDate(selectedBid.createdAt || selectedBid.timestamp)}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
        </List.Section>
        
        <Divider style={styles.divider} />
        
        <List.Section title="İletişim Bilgileri">
          {bidder.email && (
            <List.Item
              title="E-posta"
              description={bidder.email}
              left={props => <List.Icon {...props} icon="email" />}
              right={props => 
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`mailto:${bidder.email}`)}
                  style={{ justifyContent: 'center' }}
                >
                  <Ionicons name="mail-open-outline" size={24} color="#4F46E5" />
                </TouchableOpacity>
              }
            />
          )}
          
          {bidder.phone && (
            <List.Item
              title="Telefon"
              description={bidder.phone}
              left={props => <List.Icon {...props} icon="phone" />}
              right={props => 
                <TouchableOpacity 
                  onPress={() => Linking.openURL(`tel:${bidder.phone}`)}
                  style={{ justifyContent: 'center' }}
                >
                  <Ionicons name="call-outline" size={24} color="#4F46E5" />
                </TouchableOpacity>
              }
            />
          )}
          
          {bidder.address && (
            <List.Item
              title="Adres"
              description={bidder.address}
              left={props => <List.Icon {...props} icon="map-marker" />}
            />
          )}
        </List.Section>
        
        {hasCompanyInfo && (
          <>
            <Divider style={styles.divider} />
            
            <List.Section title="Firma Bilgileri">
              {bidder.companyInfo?.companyName && (
                <List.Item
                  title="Firma Adı"
                  description={bidder.companyInfo.companyName}
                  left={props => <List.Icon {...props} icon="domain" />}
                />
              )}
              
              {bidder.companyInfo?.address && (
                <List.Item
                  title="Firma Adresi"
                  description={bidder.companyInfo.address}
                  left={props => <List.Icon {...props} icon="map-marker-outline" />}
                />
              )}
              
              {bidder.companyInfo?.city && (
                <List.Item
                  title="Şehir"
                  description={bidder.companyInfo.city}
                  left={props => <List.Icon {...props} icon="city" />}
                />
              )}
              
              {bidder.companyInfo?.taxNumber && (
                <List.Item
                  title="Vergi Numarası"
                  description={bidder.companyInfo.taxNumber}
                  left={props => <List.Icon {...props} icon="identifier" />}
                />
              )}
              
              {bidder.companyInfo?.phone && bidder.companyInfo?.phone !== bidder.phone && (
                <List.Item
                  title="Firma Telefonu"
                  description={bidder.companyInfo.phone}
                  left={props => <List.Icon {...props} icon="phone-outline" />}
                  right={props => 
                    <TouchableOpacity 
                      onPress={() => Linking.openURL(`tel:${bidder.companyInfo?.phone}`)}
                      style={{ justifyContent: 'center' }}
                    >
                      <Ionicons name="call-outline" size={24} color="#4F46E5" />
                    </TouchableOpacity>
                  }
                />
              )}
            </List.Section>
          </>
        )}
      </ScrollView>
    </Dialog.Content>
  );
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
  
  // Teklif detay dialogu için state
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [bidderDetailsVisible, setBidderDetailsVisible] = useState(false);
  
  // İlanı yükle
  const loadListing = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
        const data = await getListingById(id);
      
      // Gelen verileri debug amaçlı logla
      console.log("Gelen ilan verileri özeti:", {
        id: data._id,
        title: data.title,
        bids: data.bids ? data.bids.length : 0,
        bidTypes: data.bids ? data.bids.map(b => ({
          id: b._id,
          bidderType: typeof b.bidder,
          userType: typeof b.user,
          bidderPop: b.bidder && typeof b.bidder === 'object' ? 'populated' : 'reference',
          userPop: b.user && typeof b.user === 'object' ? 'populated' : 'reference'
        })) : []
      });
      
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
        'Teklifiniz başarıyla kaydedildi. Teklifinizin geçerlilik süresi 12 saattir. Sizden daha yüksek fiyat teklifi verenler otomatik olarak reddedildi, diğer tekliflerin onay durumları sıfırlandı.',
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
      'Sadece en düşük fiyat teklifini kabul edebilirsiniz. Kabul ettiğinizde teklif sahibinin iletişim bilgilerine erişebilirsiniz. Bu tekliften daha yüksek olan tüm teklifler otomatik olarak reddedilecektir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Kabul Et', 
          onPress: async () => {
            try {
              setLoading(true);
              await acceptBid(listing._id, bidId);
              Alert.alert('Başarılı', 'Teklif başarıyla kabul edildi. Artık sadece bu teklifin iletişim bilgilerine erişebilirsiniz. Daha yüksek teklifler otomatik olarak reddedildi.');
              loadListing();
            } catch (err: any) {
              console.error('Teklif kabul hatası:', err);
              
              // Hata mesajını göster
              let errorMessage = 'Teklif kabul edilirken bir hata oluştu.';
              if (err.message && typeof err.message === 'string') {
                if (err.message.includes('en düşük teklif değil')) {
                  errorMessage = 'Yalnızca en düşük fiyat teklifini kabul edebilirsiniz. Başka bir teklif daha düşük olabilir.';
                }
              }
              
              Alert.alert('Hata', errorMessage);
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
      'Sadece en düşük fiyat teklifini reddedebilirsiniz. Reddettiğinizde bu teklifin durumu değişecek ve daha yüksek teklifler otomatik olarak reddedilecektir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Reddet', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await rejectBid(listing._id, bidId);
              Alert.alert('Başarılı', 'Teklif başarıyla reddedildi. Daha yüksek teklifler de otomatik olarak reddedildi.');
              loadListing();
            } catch (err: any) {
              console.error('Teklif reddetme hatası:', err);
              
              // Hata mesajını göster
              let errorMessage = 'Teklif reddedilirken bir hata oluştu.';
              if (err.message && typeof err.message === 'string') {
                if (err.message.includes('en düşük teklif değil')) {
                  errorMessage = 'Yalnızca en düşük fiyat teklifini reddedebilirsiniz. Başka bir teklif daha düşük olabilir.';
                } else {
                  errorMessage = err.message;
                }
              }
              
              Alert.alert('Hata', errorMessage);
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
  
  // Teklif veren kullanıcının ne kadar görülebilir olduğunu kontrol et
  const getBidderVisibility = (bid: Bid) => {
    // Bidder, user alanını veya bidder alanını kontrol et
    const bidder = typeof bid.bidder === 'object' ? bid.bidder : null;
    
    if (!bidder) return { showName: false, showDetails: false };
    
    // İlan sahibiyse
    if (isOwner()) {
      // Sadece kullanıcı adını her zaman göster, detayları sadece onaylanmış tekliflerde göster
      return { 
        showName: true, 
        showDetails: bid.status === 'accepted' || bid.isApproved === true 
      };
    }
    
    // İlan sahibi değilse hiçbir şey gösterme
    return { showName: false, showDetails: false };
  };
  
  // Teklif detaylarını göster
  const showBidderDetails = async (bid: Bid) => {
    console.log("Teklif detayları gösteriliyor. Teklif ID:", bid._id);
    console.log("Mevcut teklif veren bilgileri:", 
      typeof bid.bidder === 'object' ? JSON.stringify(bid.bidder, null, 2) : 'Nesne değil: ' + typeof bid.bidder, 
      typeof bid.user === 'object' ? JSON.stringify(bid.user, null, 2) : 'Nesne değil: ' + typeof bid.user
    );
    
    try {
      if (bid.status === 'accepted' || bid.isApproved === true) {
        // Önce mevcut teklifi göster
        setSelectedBid(bid);
        
        // İlanı tam detaylarla yeniden yükle
        try {
          setLoading(true);
          
          // fullDetails=true parametresi ile tam kullanıcı detaylarını getir
          const detailedListing = await getListingById(id, true);
          console.log("Tam detaylar ile getirilen listeleme:", {
            id: detailedListing._id,
            bidsCount: detailedListing.bids?.length || 0
          });
          
          // Dönen listingde, aynı bid ID'ye sahip teklifi bul
          const updatedBid = detailedListing.bids.find(b => b._id === bid._id);
          
          if (updatedBid) {
            console.log("Güncellenmiş teklif bulundu:", {
              bidId: updatedBid._id,
              status: updatedBid.status,
              bidderType: typeof updatedBid.bidder,
              userType: typeof updatedBid.user,
              hasUserInfo: !!updatedBid.bidder || !!updatedBid.user
            });
            
            // Detaylı bilgileri logla
            if (typeof updatedBid.bidder === 'object') {
              console.log("Teklif veren bilgileri (bidder):", JSON.stringify(updatedBid.bidder, null, 2));
            }
            
            if (typeof updatedBid.user === 'object') {
              console.log("Teklif veren bilgileri (user):", JSON.stringify(updatedBid.user, null, 2)); 
            }
            
            // Güncellenmiş teklifi göster
            setSelectedBid(updatedBid);
          }
          
          // Tüm listing'i de güncelle
          setListing(detailedListing);
        } catch (error) {
          console.error("Detaylı ilan yüklenirken hata:", error);
        } finally {
          setLoading(false);
        }
        
        // Detay modalını göster
        setBidderDetailsVisible(true);
      }
    } catch (error) {
      console.error("Teklif detayları gösterilirken hata:", error);
      Alert.alert("Hata", "Teklif detayları gösterilirken bir hata oluştu.");
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
                  const isListingOwner = isOwner();
                  const bidderVisibility = getBidderVisibility(bid);
                  const isAccepted = bid.status === 'accepted' || bid.isApproved === true;
                  
                  return (
                    <TouchableOpacity 
                      key={bid._id}
                      onPress={() => isListingOwner && isAccepted ? showBidderDetails(bid) : null}
                      disabled={!isListingOwner || !isAccepted}
                      style={{ opacity: (!isListingOwner || !isAccepted) ? 0.9 : 1 }}
                    >
                      <Surface style={styles.bidCard}>
                        <View style={styles.bidHeader}>
                          <View style={styles.bidderInfo}>
                            <Avatar.Text 
                              size={36} 
                              label={bidder && bidderVisibility.showName ? bidder.name.charAt(0) : '?'} 
                            />
                            <View style={styles.bidderDetails}>
                              <Text style={styles.bidderName}>
                                {bidder 
                                  ? (bidderVisibility.showName 
                                    ? bidder.name 
                                    : 'Anonim Teklif Veren') 
                                  : 'Kullanıcı'}
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
            
                        {/* Teklif sahibinin detaylı bilgileri - sadece ilan sahibi ve onaylanan teklifler için */}
                        {bidderVisibility.showDetails && bidder && (
                          <View style={styles.bidderDetailedInfo}>
            <Divider style={styles.divider} />
                            <Text style={styles.bidderDetailTitle}>Teklif Sahibi Bilgileri:</Text>
                            
                            {bidder.email && (
                              <View style={styles.bidderDetailRow}>
                                <Text style={styles.bidderDetailLabel}>E-posta:</Text>
                                <Text style={styles.bidderDetailValue}>{bidder.email}</Text>
                              </View>
                            )}
                            
                            {bidder.phone && (
                              <View style={styles.bidderDetailRow}>
                                <Text style={styles.bidderDetailLabel}>Telefon:</Text>
                                <Text style={styles.bidderDetailValue}>{bidder.phone}</Text>
                              </View>
                            )}
                            
                            {bidder.address && (
                              <View style={styles.bidderDetailRow}>
                                <Text style={styles.bidderDetailLabel}>Adres:</Text>
                                <Text style={styles.bidderDetailValue}>{bidder.address}</Text>
                              </View>
                            )}
                          </View>
                        )}
                        
                        {(bid.status === 'pending' && !safeIsPast(bid.expiresAt)) && isListingOwner && (
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
                        
                        {isAccepted && isListingOwner && (
                          <Text style={styles.tapForDetails}>
                            Detaylar için tıklayın
                          </Text>
                        )}
                      </Surface>
                    </TouchableOpacity>
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
            
            <Paragraph style={styles.bidWarning}>
              Önemli: Yeni bir teklif verdiğinizde, sizden daha yüksek fiyat teklifi verenler otomatik olarak reddedilecek, diğer tüm tekliflerin onay durumları sıfırlanacaktır. Satıcı sadece en düşük fiyat teklifini kabul edebilir.
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
      
      {/* Teklif Veren Kullanıcı Detay Dialog - Tamamen yenilenmiş */}
      <Portal>
        <Dialog
          visible={bidderDetailsVisible}
          onDismiss={() => setBidderDetailsVisible(false)}
          style={{ maxWidth: '90%', borderRadius: 12 }}
        >
          <Dialog.Title>Teklif Sahibi Bilgileri</Dialog.Title>
          <BidderDetailDialog 
            selectedBid={selectedBid} 
            onRefresh={onRefresh} 
            onClose={() => setBidderDetailsVisible(false)}
            getBidStatusColor={getBidStatusColor}
            getBidStatusText={getBidStatusText}
            safeFormatDate={safeFormatDate}
          />
          <Dialog.Actions>
            <Button onPress={() => setBidderDetailsVisible(false)}>Kapat</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default ListingDetailScreen; 