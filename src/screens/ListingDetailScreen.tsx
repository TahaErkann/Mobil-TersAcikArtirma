import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
  Linking,
  ImageBackground,
  Dimensions
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
  Caption,
  IconButton
} from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { getListingById, placeBid, acceptBid, rejectBid } from '../services/listingService';
import { Listing, Bid, User, ListingItem, Category } from '../types';
import { useAuth } from '../hooks/useAuth';
import { listingDetailStyles as styles } from '../styles/ListingDetailStyles';
import { 
  safeFormatDate, 
  safeFormatDistanceToNow, 
  safeIsPast,
  getBidStatusColor,
  getBidStatusText
} from '../utils/formatters';
import { LinearGradient } from 'expo-linear-gradient';

type ListingDetailScreenProps = {
  route: RouteProp<RootStackParamList, 'ListingDetail'>;
  navigation: StackNavigationProp<RootStackParamList, 'ListingDetail'>;
};

// Fiyat formatlamak için yardımcı fonksiyon
const formatPrice = (price: number | undefined | null): string => {
  if (price === undefined || price === null) return '0 TL';
  return `${price.toLocaleString('tr-TR')} TL`;
};

// Dialog içeriği bileşeni
const BidderDetailDialog = ({ 
  selectedBid, 
  onRefresh, 
  onClose,
  getBidStatusColor,
  getBidStatusText,
  safeFormatDate,
  isOwner
}: { 
  selectedBid: Bid | null;
  onRefresh: () => void;
  onClose: () => void;
  getBidStatusColor: (status: string, isExpired: boolean) => string;
  getBidStatusText: (status: string, isExpired: boolean) => string;
  safeFormatDate: (dateStr: string | undefined | null, formatStr?: string) => string;
  isOwner: boolean;
}) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // Kullanıcı bilgileri yüklendiğinde loading'i kapat
  useEffect(() => {
    // Teklif ve teklif sahibi bilgileri var mı kontrol et
    if (selectedBid && (
      (typeof selectedBid.bidder === 'object' && 
       selectedBid.bidder && 
       (selectedBid.bidder.email || selectedBid.bidder.phone)) ||
      (typeof selectedBid.user === 'object' && 
       selectedBid.user && 
       (selectedBid.user.email || selectedBid.user.phone))
    )) {
      // Bilgiler yüklendiyse loading'i kapat
      setIsLoading(false);
    } else if (selectedBid) {
      // Teklif var ama detaylı bilgi yoksa kısa bir süre bekleyip loading'i kapat
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedBid]);
  
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
  
  if (!bidder) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Kullanıcı bilgileri yüklenemedi</Text>
          <Text style={{ marginBottom: 8 }}>Teklif veren kullanıcı bilgileri eksik veya hatalı.</Text>
          <Text style={{ marginBottom: 16 }}>Lütfen önce sayfı yenileyip tekrar deneyiniz.</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              onClose();
              onRefresh();
            }}
            style={{ marginTop: 8 }}
          >
            Sayfı Yenile
          </Button>
        </View>
      </Dialog.Content>
    );
  }
  
  // Teklif durumu ve izin kontrolü
  const isAccepted = selectedBid.status === 'accepted' || selectedBid.isApproved === true;
  const isRejected = selectedBid.status === 'rejected';
  
  // İlan sahibi değilse ve teklif kabul edilmemişse veya reddedilmişse, sınırlı bilgi göster
  if ((!isOwner && !isAccepted) || isRejected) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Teklif Detayları</Text>
          {isRejected ? (
            <Text style={{ marginBottom: 16, color: '#EF4444' }}>Bu teklif reddedilmiştir. Detay bilgilerine erişilemez.</Text>
          ) : (
            <>
              <Text style={{ marginBottom: 8 }}>Bu teklifin detaylı bilgilerine erişim izniniz yok.</Text>
              <Text style={{ marginBottom: 16 }}>Teklif bilgileri gizlilik politikası gereği korunmaktadır.</Text>
            </>
          )}
          
          <View style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Teklif Özeti:</Text>
            <Text>Teklif Tutarı: {selectedBid.price || selectedBid.amount || 0} TL</Text>
            <Text>Durum: {getBidStatusText(selectedBid.status, false)}</Text>
            <Text>Tarih: {safeFormatDate(selectedBid.createdAt || selectedBid.timestamp)}</Text>
          </View>
        </View>
      </Dialog.Content>
    );
  }
  
  // Yeterli bilgi var mı kontrol et
  const hasDetailedInfo = bidder.email || bidder.phone || bidder.address || 
                         (bidder.companyInfo && Object.keys(bidder.companyInfo).length > 0) ||
                         bidder.nationalId || bidder.birthDate || bidder.gender;
  
  // Yükleniyor göstergesi
  if (isLoading && isAccepted && isOwner) {
    return (
      <Dialog.Content>
        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={{ marginTop: 16, textAlign: 'center' }}>
            Teklif sahibi bilgileri yükleniyor...
          </Text>
        </View>
      </Dialog.Content>
    );
  }
  
  // Kabul edilmiş teklifte detaylı bilgi yoksa, tam bilgileri yeniden yükleme seçeneği sun
  if (isAccepted && isOwner && !hasDetailedInfo) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Detaylı kullanıcı bilgileri bulunamadı</Text>
          <Text style={{ marginBottom: 8 }}>Teklif sahibinin bilgileri sistem tarafından tam olarak alınamadı.</Text>
          <Text style={{ marginBottom: 16 }}>Bilgileri almak için lütfen sayfayı yenileyiniz.</Text>
          
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
          
          {isAccepted && (
            <List.Item
              title="Kabul Edilme Tarihi"
              description={safeFormatDate(selectedBid.updatedAt || selectedBid.acceptedAt)}
              left={props => <List.Icon {...props} icon="check-circle" />}
            />
          )}
        </List.Section>
        
        {/* İletişim bilgileri - Sadece ilan sahibi veya kabul edilmiş teklif ise göster */}
        {(isOwner && isAccepted) && (
          <>
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
                  
                  {bidder.companyInfo?.taxNumber && (
                    <List.Item
                      title="Vergi Numarası"
                      description={bidder.companyInfo.taxNumber}
                      left={props => <List.Icon {...props} icon="identifier" />}
                    />
                  )}
                  
                  {bidder.companyInfo?.taxOffice && (
                    <List.Item
                      title="Vergi Dairesi"
                      description={bidder.companyInfo.taxOffice}
                      left={props => <List.Icon {...props} icon="office-building" />}
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
                  
                  {bidder.companyInfo?.description && (
                    <List.Item
                      title="Firma Açıklaması"
                      description={bidder.companyInfo.description}
                      left={props => <List.Icon {...props} icon="information-outline" />}
                    />
                  )}
                </List.Section>
              </>
            )}
            
            {/* Kullanıcı TC Kimlik bilgileri bölümü */}
            {(bidder.nationalId || bidder.birthDate || bidder.gender) && (
              <>
                <Divider style={styles.divider} />
                
                <List.Section title="Kimlik Bilgileri">
                  {bidder.nationalId && (
                    <List.Item
                      title="T.C. Kimlik No"
                      description={bidder.nationalId}
                      left={props => <List.Icon {...props} icon="card-account-details" />}
                    />
                  )}
                  
                  {bidder.birthDate && (
                    <List.Item
                      title="Doğum Tarihi"
                      description={safeFormatDate(bidder.birthDate)}
                      left={props => <List.Icon {...props} icon="cake-variant" />}
                    />
                  )}
                  
                  {bidder.gender && (
                    <List.Item
                      title="Cinsiyet"
                      description={bidder.gender === 'male' ? 'Erkek' : bidder.gender === 'female' ? 'Kadın' : bidder.gender}
                      left={props => <List.Icon {...props} icon="human-male-female" />}
                    />
                  )}
                </List.Section>
              </>
            )}
          </>
        )}
      </ScrollView>
    </Dialog.Content>
  );
};

// Kategori resimlerini döndüren yardımcı fonksiyon
const getCategoryImage = (category: any): string => {
  // Eğer kategori bir obje ise ve image alanı varsa, backend'den gelen resmi kullan
  if (typeof category === 'object' && category?.image) {
    return `http://192.168.254.112:5001${category.image}`;
  }
  
  // Varsayılan resmi döndür
  return "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=500";
};

const ListingDetailScreen: React.FC<ListingDetailScreenProps> = ({ route, navigation }) => {
  // useAuth hook'undan user bilgilerini alalım
  const { user, token } = useAuth();
  // route.params'dan id bilgisini alalım
  const { id } = route.params || {};
  
  console.log("ScreenParams:", route.params);
  console.log("İlan ID:", id);
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidLoading, setBidLoading] = useState<boolean>(false);
  const [bidDialogVisible, setBidDialogVisible] = useState<boolean>(false);
  
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [bidderDialogVisible, setBidderDialogVisible] = useState<boolean>(false);
  
  const [allBidsDialogVisible, setAllBidsDialogVisible] = useState<boolean>(false);
  
  // Ekran genişliğine göre yüksekliği belirle
  const screenWidth = Dimensions.get('window').width;
  const cardHeight = screenWidth * 0.6; // 16:9 oranı için
  
  // Sayfa yüklendiğinde ilan detaylarını getir
  useEffect(() => {
    if (id) {
      console.log("İlk yükleme - İlan ID:", id);
      loadListing();
    } else {
      setError('İlan ID bilgisi bulunamadı');
      setLoading(false);
    }
  }, [id]);

  const loadListing = async (fullDetails = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // İlan ID'sini al
      if (!id) {
        console.error('İlan ID bulunamadı');
        setError('İlan ID bulunamadı');
        setLoading(false);
        return;
      }
      
      console.log(`İlan detayları yükleniyor: ${id}, tam detay: ${fullDetails}`);
      
      // getListingById servisini kullan
      const data = await getListingById(id, fullDetails);
      
      console.log("İlan detayları başarıyla alındı:", data?._id);
      
      // İlanı state'e kaydet
      setListing(data);
      setBidAmount('');
      
      // İlan sahibi ya da teklif kabul edilmiş ve tam detay istenmişse
      // kullanıcı bilgilerini yeniden çek
      if (fullDetails && data.bids && data.bids.length > 0) {
        // Aktif olan seçili teklifi de güncelle
        if (selectedBid) {
          const updatedSelectedBid = data.bids.find((b: any) => b._id === selectedBid._id);
          if (updatedSelectedBid) {
            console.log("Seçili teklif güncellendi:", updatedSelectedBid);
            // Seçilen teklifin verileri eksikse, yeniden tam detay isteği yap
            if (updatedSelectedBid.status === 'accepted' && 
                (typeof updatedSelectedBid.bidder === 'object' && 
                 (!updatedSelectedBid.bidder.email || !updatedSelectedBid.bidder.phone || 
                  !updatedSelectedBid.bidder.address))) {
              console.log("Kabul edilmiş teklifin bilgileri eksik, tam detayları yüklüyorum...");
              // Hemen yeniden detayları yükle
              setTimeout(async () => {
                const fullDetailData = await getListingById(id, true);
                // Teklifleri güncelle
                setListing(fullDetailData);
                // Seçili teklifi bul ve güncelle
                const fullDetailBid = fullDetailData.bids.find((b: any) => b._id === selectedBid._id);
                if (fullDetailBid) {
                  setSelectedBid(fullDetailBid);
                }
              }, 500);
            } else {
              setSelectedBid(updatedSelectedBid);
            }
          }
        }
        
        // Kabul edilmiş teklifi bul
        const acceptedBid = data.bids.find((b: any) => b.status === 'accepted' || b.isApproved === true);
        if (acceptedBid) {
          console.log("Kabul edilmiş teklif bulundu:", acceptedBid);
          if (selectedBid && acceptedBid._id === selectedBid._id) {
            // Eğer kullanıcı bu teklifi zaten görüntülüyorsa, yeni verileri göster
            setSelectedBid(acceptedBid);
          }
        }
      }
      
      setLoading(false);
      setRefreshing(false);
    } catch (error: any) {
      console.error('İlan detayları yüklenirken hata oluştu:', error);
      setError(error?.message || 'Bir hata oluştu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const onRefresh = () => {
    setRefreshing(true);
    loadListing();
  };
  
  const openBidDialog = () => {
    // Aktif kullanıcı yoksa giriş sayfasına yönlendir
    if (!token) {
      Alert.alert(
        'Giriş Gerekli',
        'Teklif vermek için giriş yapmalısınız.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    
    // Kullanıcı ilan sahibiyse uyarı göster
    if (listing && listing.owner && typeof listing.owner === 'object' && 
        listing.owner._id === user?._id) {
      Alert.alert('Hata', 'Kendi ilanınıza teklif veremezsiniz.');
      return;
    }
    
    // Süresi dolmuş ilana teklif verilmez
    if (listing && isExpired()) {
      Alert.alert('Hata', 'Bu ilanın süresi dolmuş, teklif veremezsiniz.');
      return;
    }
    
    // Tamamlanmış ilana teklif verilmez
    if (listing && listing.status === 'completed') {
      Alert.alert('Hata', 'Bu ilan tamamlanmış, teklif veremezsiniz.');
      return;
    }
    
    // Varsayılan teklif değeri: mevcut fiyattan %5 düşük
    if (listing && listing.currentPrice) {
      const recommendedPrice = listing.currentPrice * 0.95;
      setBidAmount(recommendedPrice.toFixed(2));
    } else {
      setBidAmount('');
    }
    
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
    
    if (bidValue >= listing.currentPrice) {
      Alert.alert('Geçersiz Tutar', 'Teklifiniz mevcut fiyattan düşük olmalıdır. Bu bir ters açık artırmadır.');
      return;
    }
    
    // Teklif mevcut fiyattan en az %5 düşük olmalı kontrolü
    const minimumAcceptablePrice = listing.currentPrice * 0.95;
    if (bidValue > minimumAcceptablePrice) {
      Alert.alert(
        'Yetersiz Teklif', 
        `Teklifiniz mevcut fiyat olan ${listing.currentPrice.toFixed(2)} TL'den en az %5 daha düşük olmalıdır. 
        
En fazla ${minimumAcceptablePrice.toFixed(2)} TL teklif verebilirsiniz.`,
        [
          { 
            text: 'İptal', 
            style: 'cancel'
          },
          {
            text: `${minimumAcceptablePrice.toFixed(2)} TL Teklif Ver`,
            onPress: async () => {
              setBidAmount(minimumAcceptablePrice.toFixed(2));
              
              // Doğrudan %5 düşük teklifi ver
              try {
                setBidLoading(true);
                await placeBid(listing._id, minimumAcceptablePrice);
                setBidDialogVisible(false);
                Alert.alert(
                  'Teklif Verildi', 
                  'Teklifiniz başarıyla kaydedildi.',
                  [{ text: 'Tamam', onPress: onRefresh }]
                );
              } catch (err) {
                console.error('Teklif verme hatası:', err);
                Alert.alert('Hata', 'Teklif verilirken bir hata oluştu. Lütfen tekrar deneyin.');
              } finally {
                setBidLoading(false);
              }
            }
          }
        ]
      );
      return;
    }
    
    try {
      setBidLoading(true);
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
      setBidLoading(false);
    }
  };
  
  // Teklifi kabul et
  const handleAcceptBid = async (bidId: string) => {
    if (!listing) return;
    
    Alert.alert(
      'Teklifi Kabul Et',
      'Bu teklifi kabul etmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Kabul Et', 
          onPress: async () => {
            try {
              setLoading(true);
              const updatedListing = await acceptBid(listing._id, bidId);
              
              // Kabul edilen teklifi hemen bul ve göster
              const acceptedBid = updatedListing?.bids?.find(b => b._id === bidId);
              if (acceptedBid) {
                // Önce dialogu göster
                setSelectedBid(acceptedBid);
                setBidderDialogVisible(true);
                
                // Sonra arka planda tam detayları yükle
                const fullDetailData = await getListingById(id as string, true);
                setListing(fullDetailData);
                
                // Tam detaylı teklifi bul ve güncelle
                const fullDetailBid = fullDetailData?.bids?.find(b => b._id === bidId);
                if (fullDetailBid) {
                  setSelectedBid(fullDetailBid);
                }
              }
              
              Alert.alert('Başarılı', 'Teklif başarıyla kabul edildi.');
            } catch (err: any) {
              console.error('Teklif kabul hatası:', err);
              Alert.alert('Hata', err.message || 'Teklif kabul edilirken bir hata oluştu.');
            } finally {
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
      'Bu teklifi reddetmek istediğinizden emin misiniz?',
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
            } catch (err: any) {
              console.error('Teklif reddetme hatası:', err);
              Alert.alert('Hata', err.message || 'Teklif reddedilirken bir hata oluştu.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // Teklif veren detaylarını göster
  const showBidderDetails = (bid: Bid) => {
    // Önce teklifi ve dialogu göster - sonra verileri yükle
    setSelectedBid(bid);
    setBidderDialogVisible(true);
    
    // Arka planda verileri yükle - kullanıcı beklemeden dialog görünür olur
    if (bid.status === 'accepted' || isOwner()) {
      // Arka planda detayları yükle
      (async () => {
        try {
          // Dialog gösterildikten sonra detayları arka planda yükle
          const fullDetailData = await getListingById(id as string, true);
          
          // İlgili teklifi bul
          const fullDetailBid = fullDetailData.bids.find((b: any) => b._id === bid._id);
          
          if (fullDetailBid) {
            // Tüm verileri güncelle
            setListing(fullDetailData);
            setSelectedBid(fullDetailBid);
          }
        } catch (error) {
          console.error("Teklif bilgileri yüklenirken hata:", error);
        }
      })();
    }
  };
  
  // İlanın sahibi olup olmadığını kontrol et
  const isOwner = () => {
    if (!listing || !user) return false;
    
    const ownerId = typeof listing.owner === 'object' ? listing.owner._id : listing.owner;
    return ownerId === user._id;
  };
  
  // İlanın süresi dolmuş mu kontrol et
  const isExpired = (): boolean => {
    if (!listing || !listing.expiresAt) return false;
    return safeIsPast(listing.expiresAt);
  };
  
  // İlan fotoğrafı için kategori adını al
  const getCategoryName = (): string => {
    if (!listing || !listing.category) return '';
    
    if (typeof listing.category === 'object') {
      return listing.category.name;
    }
    return '';
  };
  
  if (loading && !listing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 16 }}>İlan yükleniyor...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={() => loadListing()} style={styles.retryButton}>
          Tekrar Dene
        </Button>
      </View>
    );
  }
  
  if (!listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>İlan bulunamadı</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.retryButton}>
          Geri Dön
        </Button>
      </View>
    );
  }
  
  const categoryName = getCategoryName();
  const categoryImageUrl = getCategoryImage(listing.category);
  
  return (
    <View style={styles.container}>
      {/* Appbar */}
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="" />
        <Appbar.Action icon="refresh" onPress={onRefresh} color="#FFFFFF" />
      </Appbar.Header>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4F46E5']}
          />
        }
      >
        {/* Kategori resmi */}
        <Card style={{ ...styles.heroImageCard, height: cardHeight }}>
          <Card.Cover 
            source={{ uri: categoryImageUrl }} 
            style={{ ...styles.heroImage, height: cardHeight }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroMeta}>
                <Chip 
                  style={styles.categoryChipHero}
                  textStyle={styles.categoryChipTextHero}
                >
                  {categoryName || 'Genel'}
                </Chip>
                
                <Chip 
                  icon={() => <Ionicons name="time-outline" size={14} color="#FFFFFF" />}
                  style={styles.timeChip}
                  textStyle={{ color: 'white' }}
                >
                  {isExpired() ? 'Süresi Doldu' : safeFormatDistanceToNow(listing.expiresAt)}
                </Chip>
              </View>
              
              <Text style={styles.heroTitle}>{listing.title}</Text>
            </View>
          </LinearGradient>
        </Card>
        
        <View style={styles.detailContainer}>
          {/* Fiyat Kartı */}
          <Card style={styles.cardPrimary}>
            <Card.Content style={styles.priceCardContent}>
              {/* Fiyat Bilgisi */}
              <View style={styles.currentPriceSection}>
                <Text style={styles.priceHeading}>Güncel Fiyat</Text>
                <Text style={styles.currentPrice}>{formatPrice(listing.currentPrice)}</Text>
                <Text style={styles.initialPrice}>{formatPrice(listing.initialMaxPrice)}</Text>
              </View>
              
              {/* Teklif Bilgileri */}
              <View style={styles.bidInfoSection}>
                <View style={styles.bidCountContainer}>
                  <Text style={styles.bidCountLabel}>Toplam Teklif</Text>
                  <View style={styles.bidCountBadge}>
                    <Text style={styles.bidCountNumber}>{listing.bids?.length || 0}</Text>
                  </View>
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Durum</Text>
                  <Chip 
                    style={[
                      styles.statusChip, 
                      { 
                        backgroundColor: listing.status === 'active' && !isExpired() 
                          ? '#10B981' 
                          : listing.status === 'completed' 
                            ? '#4F46E5' 
                            : '#EF4444'
                      }
                    ]}
                    textStyle={{ color: 'white' }}
                  >
                    {listing.status === 'active' && !isExpired() 
                      ? 'Aktif' 
                      : listing.status === 'completed' 
                        ? 'Tamamlandı' 
                        : 'Süresi Doldu'}
                  </Chip>
                </View>
              </View>
              
              {/* Teklif Ver Butonu */}
              {listing.status === 'active' && !isExpired() && !isOwner() && (
                <Button 
                  mode="contained" 
                  onPress={openBidDialog}
                  style={styles.bidButtonNew}
                  labelStyle={styles.bidButtonLabel}
                  icon="currency-usd"
                >
                  Teklif Ver
                </Button>
              )}
            </Card.Content>
          </Card>
          
          {/* Açıklama Kartı */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <Paragraph style={styles.description}>
                {listing.description}
              </Paragraph>
              
              {/* Meta Bilgiler */}
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={18} 
                    color="#6B7280" 
                    style={styles.metaIcon} 
                  />
                  <Text style={styles.metaText}>
                    İlan Tarihi: {safeFormatDate(listing.createdAt)}
                  </Text>
                </View>
                
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons 
                    name="clock-end" 
                    size={18} 
                    color="#6B7280" 
                    style={styles.metaIcon} 
                  />
                  <Text style={styles.metaText}>
                    Bitiş Tarihi: {safeFormatDate(listing.expiresAt)}
                  </Text>
                </View>
                
                {typeof listing.owner === 'object' && (
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons 
                      name="account" 
                      size={18} 
                      color="#6B7280" 
                      style={styles.metaIcon} 
                    />
                    <Text style={styles.metaText}>
                      İlan Sahibi: {listing.owner.name}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
          
          {/* Ürünler Listesi */}
          {listing.items && listing.items.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.sectionTitle}>
                  Ürünler ({listing.items.length})
                </Text>
                
                <View style={styles.itemsContainer}>
                  {listing.items.map((item, index) => (
                    <View key={index} style={styles.itemCard}>
                      <View style={styles.itemHeader}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Chip style={styles.quantityChip}>
                          {item.quantity} {item.unit}
                        </Chip>
                      </View>
                      {item.description && (
                        <Text style={styles.itemDescription}>{item.description}</Text>
                      )}
                    </View>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}
          
          {/* Teklifler Bölümü */}
          {listing.bids && listing.bids.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionTitle}>
                    Teklifler
                  </Text>
                  <Chip style={styles.bidCountChip}>
                    {listing.bids.length} teklif
                  </Chip>
                </View>
                
                <View style={styles.bidsContainer}>
                  {/* En son 5 teklifi göster */}
                  {listing.bids.slice(0, 5).map((bid) => (
                    <Card 
                      key={bid._id} 
                      style={styles.bidCardNew}
                      onPress={() => {
                        // Reddedilen teklifleri görüntüleme
                        if (bid.status !== 'rejected' && (isOwner() || bid.status === 'accepted')) {
                          showBidderDetails(bid);
                        }
                      }}
                    >
                      <Card.Content style={styles.bidCardContentNew}>
                        <View style={styles.bidCardHeaderNew}>
                          <Avatar.Text 
                            size={36} 
                            label={
                              bid.status === 'rejected' ? '?' :
                              (typeof bid.bidder === 'object' && bid.bidder?.name?.charAt(0)) || 
                              (typeof bid.user === 'object' && bid.user?.name?.charAt(0)) || 
                              '?'
                            } 
                            style={styles.bidderAvatar}
                          />
                          
                          <View style={styles.bidderInfoNew}>
                            <Text style={styles.bidderNameNew}>
                              {bid.status === 'rejected' ? 'Gizli' :
                               (typeof bid.bidder === 'object' && bid.bidder?.name) || 
                               (typeof bid.user === 'object' && bid.user?.name) || 
                               'İsimsiz Kullanıcı'}
                            </Text>
                            
                            <Text style={styles.bidTimeNew}>
                              {safeFormatDate(bid.createdAt || bid.timestamp)}
                            </Text>
                          </View>
                          
                          <Text style={styles.bidAmountNew}>
                            {formatPrice(bid.price || bid.amount)}
                          </Text>
                        </View>
                        
                        {/* Teklif durumu */}
                        <View style={styles.bidStatusSectionNew}>
                          <Chip 
                            style={[
                              styles.bidStatusChipNew,
                              { backgroundColor: getBidStatusColor(bid.status, isExpired()) }
                            ]}
                            textStyle={{ color: 'white' }}
                          >
                            {getBidStatusText(bid.status, isExpired())}
                          </Chip>
                          
                          {/* Teklif sahibiyse işlem butonları göster */}
                          {isOwner() && bid.status === 'pending' && !isExpired() && (
                            <View style={styles.bidActionButtonsNew}>
                              <Button 
                                mode="contained" 
                                onPress={() => {
                                  handleAcceptBid(bid._id);
                                  setAllBidsDialogVisible(false);
                                  // Dialog açılmadan önce tüm bilgileri yükleyin
                                  // Seçili teklifi bul ve açılacak dialogu hazırla
                                  const updatedBid = listing.bids.find((b) => b._id === bid._id);
                                  if (updatedBid) {
                                    showBidderDetails(updatedBid);
                                  }
                                }}
                                style={[styles.actionButtonNew, styles.acceptButtonNew]}
                                labelStyle={styles.actionButtonLabelNew}
                                compact
                              >
                                Kabul Et
                              </Button>
                              
                              <Button 
                                mode="outlined" 
                                onPress={() => handleRejectBid(bid._id)}
                                style={[styles.actionButtonNew, styles.rejectButtonNew]}
                                labelStyle={{ color: '#EF4444' }}
                                compact
                              >
                                Reddet
                              </Button>
                            </View>
                          )}
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                  
                  {/* Daha fazla teklif varsa */}
                  {listing.bids.length > 5 && (
                    <Button 
                      mode="outlined" 
                      onPress={() => {
                        // Daha fazla teklif gösterme işlevi
                        setAllBidsDialogVisible(true);
                      }}
                      style={styles.showMoreButton}
                    >
                      Tüm Teklifleri Göster ({listing.bids.length})
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
      
      {/* Dialogs */}
      <Portal>
        {/* Tüm teklifleri göster diyaloğu */}
        <Dialog
          visible={allBidsDialogVisible}
          onDismiss={() => setAllBidsDialogVisible(false)}
          style={{ ...styles.dialogContainer, maxHeight: '80%' }}
        >
          <Dialog.Title>Tüm Teklifler ({listing?.bids?.length || 0})</Dialog.Title>
          <Dialog.ScrollArea style={{ paddingHorizontal: 0 }}>
            <FlatList
              data={listing?.bids}
              renderItem={({ item: bid }) => (
                <TouchableOpacity 
                  style={styles.allBidsItem}
                  onPress={() => {
                    // Reddedilen teklifleri açma
                    if (bid.status !== 'rejected' && (isOwner() || bid.status === 'accepted')) {
                      setAllBidsDialogVisible(false);
                      // Teklif sahibi detaylarını asenkron olarak göster
                      showBidderDetails(bid);
                    }
                  }}
                >
                  <View style={styles.bidCardHeaderNew}>
                    <Avatar.Text 
                      size={32} 
                      label={
                        bid.status === 'rejected' ? '?' :
                        (typeof bid.bidder === 'object' && bid.bidder?.name?.charAt(0)) || 
                        (typeof bid.user === 'object' && bid.user?.name?.charAt(0)) || 
                        '?'
                      }
                      style={styles.bidderAvatar}
                    />
                    
                    <View style={styles.bidderInfoNew}>
                      <Text style={styles.bidderNameNew}>
                        {bid.status === 'rejected' ? 'Gizli' :
                         (typeof bid.bidder === 'object' && bid.bidder?.name) || 
                         (typeof bid.user === 'object' && bid.user?.name) || 
                         'İsimsiz Kullanıcı'}
                      </Text>
                      
                      <Text style={styles.bidTimeNew}>
                        {safeFormatDate(bid.createdAt || bid.timestamp)}
                      </Text>
                    </View>
                    
                    <Text style={styles.bidAmountNew}>
                      {formatPrice(bid.price || bid.amount)}
                    </Text>
                  </View>
                  
                  <View style={styles.bidStatusSectionNew}>
                    <Chip 
                      style={[
                        styles.bidStatusChipNew,
                        { backgroundColor: getBidStatusColor(bid.status, isExpired()) }
                      ]}
                      textStyle={{ color: 'white' }}
                    >
                      {getBidStatusText(bid.status, isExpired())}
                    </Chip>
                    
                    {isOwner() && bid.status === 'pending' && !isExpired() && (
                      <View style={styles.bidActionButtonsNew}>
                        <Button 
                          mode="contained" 
                          onPress={() => {
                            handleAcceptBid(bid._id);
                            setAllBidsDialogVisible(false);
                            // Dialog açılmadan önce tüm bilgileri yükleyin
                            // Seçili teklifi bul ve açılacak dialogu hazırla
                            const updatedBid = listing.bids.find((b) => b._id === bid._id);
                            if (updatedBid) {
                              showBidderDetails(updatedBid);
                            }
                          }}
                          style={[styles.actionButtonNew, styles.acceptButtonNew]}
                          labelStyle={styles.actionButtonLabelNew}
                          compact
                        >
                          Kabul Et
                        </Button>
                        
                        <Button 
                          mode="outlined" 
                          onPress={() => {
                            handleRejectBid(bid._id);
                            setAllBidsDialogVisible(false);
                          }}
                          style={[styles.actionButtonNew, styles.rejectButtonNew]}
                          labelStyle={{ color: '#EF4444' }}
                          compact
                        >
                          Reddet
                        </Button>
                      </View>
                    )}
                  </View>
                  <Divider style={{ marginVertical: 8 }} />
                </TouchableOpacity>
              )}
              keyExtractor={(bid) => bid._id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            />
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setAllBidsDialogVisible(false)}>Kapat</Button>
          </Dialog.Actions>
        </Dialog>
        
        {/* Teklif verme dialog'u */}
        <Dialog
          visible={bidDialogVisible}
          onDismiss={() => setBidDialogVisible(false)}
          style={styles.dialogContainer}
        >
          <Dialog.Title>Teklif Ver</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Ters açık artırma kuralları:
            </Text>
            <View style={styles.ruleContainer}>
              <Text style={styles.ruleText}>• Teklifiniz, mevcut fiyattan düşük olmalıdır.</Text>
              <Text style={styles.ruleText}>• Teklifiniz, mevcut fiyattan en az %5 daha düşük olmalıdır.</Text>
              <Text style={styles.ruleText}>• En düşük teklif, ilan sahibi tarafından öncelikle değerlendirilir.</Text>
            </View>
            
            {listing && (
              <View style={styles.priceInfoContainer}>
                <Text style={styles.currentPriceInfo}>
                  Mevcut Fiyat: {formatPrice(listing.currentPrice)}
                </Text>
                <Text style={styles.recommendedPriceInfo}>
                  Öneri Fiyat: {formatPrice(listing.currentPrice * 0.95)} (-%5)
                </Text>
              </View>
            )}
            
            <TextInput
              label="Teklif Tutarı (TL)"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              style={styles.bidInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBidDialogVisible(false)}>İptal</Button>
            <Button 
              mode="contained" 
              onPress={handleBid} 
              loading={bidLoading}
              disabled={bidLoading}
            >
              Teklif Ver
            </Button>
          </Dialog.Actions>
        </Dialog>
        
        {/* Teklif veren detayları dialog'u */}
        <Dialog
          visible={bidderDialogVisible}
          onDismiss={() => setBidderDialogVisible(false)}
          style={styles.dialogContainer}
        >
          <Dialog.Title>Teklif Sahibi Detayları</Dialog.Title>
          <BidderDetailDialog 
            selectedBid={selectedBid}
            onRefresh={onRefresh}
            onClose={() => setBidderDialogVisible(false)}
            getBidStatusColor={getBidStatusColor}
            getBidStatusText={getBidStatusText}
            safeFormatDate={safeFormatDate}
            isOwner={isOwner()}
          />
          <Dialog.Actions>
            <Button onPress={() => setBidderDialogVisible(false)}>Kapat</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default ListingDetailScreen; 