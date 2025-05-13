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
  ImageBackground
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
import { LinearGradient } from 'expo-linear-gradient';

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
  
  // İlan sahibi değilse ve teklif kabul edilmemişse, sınırlı bilgi göster
  if (!isOwner && !isAccepted) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Teklif Detayları</Text>
          <Text style={{ marginBottom: 8 }}>Bu teklifin detaylı bilgilerine erişim izniniz yok.</Text>
          <Text style={{ marginBottom: 16 }}>Teklif bilgileri gizlilik politikası gereği korunmaktadır.</Text>
          
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
                         (bidder.companyInfo && Object.keys(bidder.companyInfo).length > 0);
  
  // Kabul edilmiş teklifte detaylı bilgi yoksa
  if (isAccepted && isOwner && !hasDetailedInfo) {
    return (
      <Dialog.Content>
        <View>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Detaylı kullanıcı bilgileri bulunamadı</Text>
          <Text style={{ marginBottom: 8 }}>Teklif sahibinin bilgileri sistem tarafından tam olarak alınamadı.</Text>
          <Text style={{ marginBottom: 16 }}>Bilgileri almak için lütfen önce sayfı yenileyin.</Text>
          
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
            Sayfı Yenile
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
                </List.Section>
              </>
            )}
            
            {/* Diğer profil bilgileri */}
            {(bidder.birthDate || bidder.gender || bidder.nationalId) && (
              <>
                <Divider style={styles.divider} />
                
                <List.Section title="Diğer Bilgiler">
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
                      left={props => <List.Icon {...props} icon="account" />}
                    />
                  )}
                  
                  {bidder.nationalId && (
                    <List.Item
                      title="T.C. Kimlik No"
                      description={bidder.nationalId}
                      left={props => <List.Icon {...props} icon="card-account-details" />}
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
    
    if (bidValue >= listing.currentPrice) {
      Alert.alert('Geçersiz Tutar', 'Teklifiniz mevcut fiyattan düşük olmalıdır. Bu bir ters açık artırmadır.');
      return;
    }
    
    // Teklif mevcut fiyattan en az %5 düşük olmalı
    const minimumAcceptablePrice = listing.currentPrice * 0.95;
    if (bidValue > minimumAcceptablePrice) {
      Alert.alert(
        'Yetersiz Teklif', 
        `Teklifiniz mevcut fiyat olan ${listing.currentPrice.toFixed(2)} TL'den en az %5 daha düşük olmalıdır. En fazla ${minimumAcceptablePrice.toFixed(2)} TL teklif edebilirsiniz.`
      );
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
  
  // İlanın süresi dolmuş mu kontrol et
  const isExpired = (): boolean => {
    if (!listing || !listing.expiresAt) return false;
    return safeIsPast(listing.expiresAt);
  };
  
  // Teklif veren kullanıcının ne kadar görülebilir olduğunu kontrol et
  const getBidderVisibility = (bid: Bid) => {
    // Bidder, user alanını veya bidder alanını kontrol et
    const bidder = typeof bid.bidder === 'object' ? bid.bidder : 
                (typeof bid.user === 'object' ? bid.user : null);
    
    if (!bidder) return { showName: false, showDetails: false };
    
    // İlan sahibiyse
    if (isOwner()) {
      // Kabul edilmiş tekliflerin tüm detaylarını göster
      return { 
        showName: true, 
        showDetails: bid.status === 'accepted' || bid.isApproved === true,
        showFullDetails: bid.status === 'accepted' || bid.isApproved === true 
      };
    }
    
    // Teklifi veren kullanıcı kendisiyse
    if (user && (bid.user === user._id || 
        (typeof bid.user === 'object' && bid.user._id === user._id) ||
        bid.bidder === user._id || 
        (typeof bid.bidder === 'object' && bid.bidder._id === user._id))) {
      // Sadece kendi teklifinin durumunu görsün
      return { 
        showName: true, 
        showDetails: false, 
        showFullDetails: false 
      };
    }
    
    // Diğer kullanıcılar için sadece teklifin varlığını ve durumunu göster, kimlik gizli olsun
    return { 
      showName: false, 
      showDetails: false,
      showFullDetails: false 
    };
  };
  
  // Teklif detaylarını göster
  const showBidderDetails = async (bid: Bid) => {
    console.log("Teklif detayları gösteriliyor. Teklif ID:", bid._id);
    console.log("Mevcut teklif veren bilgileri:", 
      typeof bid.bidder === 'object' ? JSON.stringify(bid.bidder, null, 2) : 'Nesne değil: ' + typeof bid.bidder, 
      typeof bid.user === 'object' ? JSON.stringify(bid.user, null, 2) : 'Nesne değil: ' + typeof bid.user
    );
    
    try {
      // Teklif kabul edilmiş mi kontrol et
      const isAcceptedBid = bid.status === 'accepted' || bid.isApproved === true;
      
      // İlan sahibiyse ve teklif kabul edilmişse veya kullanıcı kendi teklifini görüntülüyorsa
      if ((isOwner() && isAcceptedBid) || 
          (user && (bid.user === user._id || 
            (typeof bid.user === 'object' && bid.user._id === user._id) ||
            bid.bidder === user._id || 
            (typeof bid.bidder === 'object' && bid.bidder._id === user._id)))) {
        
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
      } else {
        // İlan sahibi değilse veya teklif kabul edilmemişse
        Alert.alert(
          "Erişim Kısıtlı", 
          "Teklif veren kullanıcının detaylı bilgilerine sadece ilan sahibi erişebilir ve teklif kabul edilmiş olmalıdır."
        );
      }
    } catch (error) {
      console.error("Teklif detayları gösterilirken hata:", error);
      Alert.alert("Hata", "Teklif detayları gösterilirken bir hata oluştu.");
    }
  };
  
  // Fiyat görüntülemede güvenli kontroller ekleyelim
  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) return '0.00';
    return price.toFixed(2);
  };
  
  // İlan detaylarındaki fiyat görüntüleme kısmını düzenleyelim
  const renderPriceInfo = () => {
    // Artık kullanılmıyor - modern tasarımlı fiyat bilgisi doğrudan render içinde gösteriliyor
    return null;
  };
  
  // Tekliflerin işlenmesi için güvenli kontroller ekleyelim
  const renderBids = () => {
    // Artık kullanılmıyor - modern tasarımlı teklifler doğrudan render içinde gösteriliyor
    // Bu fonksiyon yalnızca geriye dönük uyumluluk için korunmuştur
    return null;
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
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction color="#ffffff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="İlan Detayı" color="#ffffff" />
        <Appbar.Action icon="share-variant" color="#ffffff" onPress={() => {}} />
      </Appbar.Header>
      
      {/* Hero Banner ve İlan Başlığı */}
      <ImageBackground
        source={{ uri: `https://source.unsplash.com/random/800x400/?${listing.category.name}` }}
        style={styles.hero}
      >
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
                {typeof listing.category === 'object' ? listing.category.name : 'Kategori'}
              </Chip>
              <Chip 
                icon="clock-outline" 
                style={styles.timeChip}
                textStyle={{ color: safeIsPast(listing.expiresAt) ? '#EF4444' : '#FFFFFF' }}
              >
                {safeIsPast(listing.expiresAt) 
                  ? 'Süresi Doldu' 
                  : listing.expiresAt 
                    ? safeFormatDistanceToNow(listing.expiresAt) 
                    : 'Belirtilmemiş'
                }
              </Chip>
            </View>
            <Title style={styles.heroTitle}>{listing.title}</Title>
          </View>
        </LinearGradient>
      </ImageBackground>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.detailContainer}>
          {/* Fiyat ve Teklif Bilgisi */}
          <Card style={styles.cardPrimary}>
            <Card.Content style={styles.priceCardContent}>
              <View style={styles.currentPriceSection}>
                <Text style={styles.priceHeading}>Güncel Fiyat</Text>
                <Text style={styles.currentPrice}>{formatPrice(listing.currentPrice)} ₺</Text>
                {listing.initialMaxPrice && listing.initialMaxPrice !== listing.currentPrice && (
                  <Text style={styles.initialPrice}>
                    Başlangıç: {formatPrice(listing.initialMaxPrice)} ₺
                  </Text>
                )}
              </View>
              
              <View style={styles.bidInfoSection}>
                <View style={styles.bidCountContainer}>
                  <Text style={styles.bidCountLabel}>Teklifler</Text>
                  <View style={styles.bidCountBadge}>
                    <Text style={styles.bidCountNumber}>{listing.bids && listing.bids.length || 0}</Text>
                  </View>
                </View>
                
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Durum</Text>
                  <Chip 
                    mode="outlined" 
                    style={[styles.statusChip, { 
                      borderColor: listing.status === 'active' ? '#10B981' : 
                                 listing.status === 'completed' ? '#3B82F6' : 
                                 listing.status === 'cancelled' ? '#EF4444' : '#F59E0B'
                    }]}
                    textStyle={{ color: listing.status === 'active' ? '#10B981' : 
                                       listing.status === 'completed' ? '#3B82F6' : 
                                       listing.status === 'cancelled' ? '#EF4444' : '#F59E0B' }}
                  >
                    {listing.status === 'active' ? 'Aktif' :
                     listing.status === 'completed' ? 'Tamamlandı' :
                     listing.status === 'cancelled' ? 'İptal Edildi' : 'Süresi Doldu'}
                  </Chip>
                </View>
              </View>
              
              {!isOwner() && listing.status === 'active' && !isExpired() && (
                <Button 
                  mode="contained" 
                  icon="cash-multiple" 
                  onPress={openBidDialog}
                  style={styles.bidButtonNew}
                  labelStyle={styles.bidButtonLabel}
                >
                  Teklif Ver
                </Button>
              )}
            </Card.Content>
          </Card>
          
          {/* Açıklama */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Açıklama</Title>
              <Paragraph style={styles.description}>
                {listing.description}
              </Paragraph>
              
              <View style={styles.metaInfo}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" style={styles.metaIcon} />
                  <Text style={styles.metaText}>
                    Eklenme: {listing.createdAt ? safeFormatDate(listing.createdAt) : 'Belirtilmemiş'}
                  </Text>
                </View>
                
                {(listing as any).location && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={16} color="#6B7280" style={styles.metaIcon} />
                    <Text style={styles.metaText}>{(listing as any).location}</Text>
                  </View>
                )}
              </View>
            </Card.Content>
          </Card>
          
          {/* Ürünler Listesi */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Ürün Listesi</Title>
              
              {Array.isArray(listing.items) && listing.items.length > 0 ? (
                <View style={styles.itemsContainer}>
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
          
          {/* Teklifler Listesi - Modern Tasarım */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sectionTitleContainer}>
                <Title style={styles.sectionTitle}>Teklifler</Title>
                <Chip icon="gavel" style={styles.bidCountChip}>{listing.bids && listing.bids.length || 0}</Chip>
              </View>
              
              {listing.bids && listing.bids.length > 0 ? (
                <View style={styles.bidsContainer}>
                  {listing.bids.map((bid, index) => {
                    // Teklif veren bilgisini güvenli şekilde alma
                    const bidder = typeof bid.bidder === 'object' ? bid.bidder : 
                                (typeof bid.user === 'object' ? bid.user : null);
                    
                    // Teklif tutarını güvenli şekilde alma
                    const amount = bid.price !== undefined ? bid.price : 
                                (bid.amount !== undefined ? bid.amount : 0);
                    
                    // Teklif kabul edilmiş mi?
                    const isAccepted = bid.status === 'accepted' || bid.isApproved === true;
                    
                    return (
                      <Surface key={bid._id || index} style={styles.bidCardNew}>
                        <View style={styles.bidHeaderNew}>
                          <View style={styles.bidderInfoNew}>
                            <Avatar.Text 
                              size={36} 
                              label={bidder?.name?.charAt(0) || '?'} 
                              style={styles.bidderAvatar}
                            />
                            <View style={styles.bidderDetails}>
                              <Text style={styles.bidderNameNew}>
                                {bidder?.name || 'İsimsiz Kullanıcı'}
                              </Text>
                              <Text style={styles.bidTimeNew}>
                                {bid.createdAt ? safeFormatDate(bid.createdAt) : 'Belirtilmemiş'}
                              </Text>
                            </View>
                          </View>
                          
                          <View style={styles.bidAmountNew}>
                            <Text style={styles.bidPriceNew}>{formatPrice(amount)} ₺</Text>
                            <Chip 
                              style={[
                                styles.statusChipBid, 
                                { backgroundColor: getBidStatusColor(bid.status, isExpired()) }
                              ]}
                              textStyle={{ color: '#FFFFFF', fontSize: 10 }}
                            >
                              {getBidStatusText(bid.status, isExpired())}
                            </Chip>
                          </View>
                        </View>
                        
                        {/* İlan sahibiyse ve teklif beklemede ise veya kabul edilmişse göster */}
                        <View style={styles.bidActions}>
                          {isOwner() && bid.status === 'pending' && !isExpired() && (
                            <>
                              <Button 
                                mode="outlined" 
                                onPress={() => handleRejectBid(bid._id)} 
                                style={[styles.actionButton, styles.rejectButton]}
                                labelStyle={styles.rejectButtonLabel}
                              >
                                Reddet
                              </Button>
                              <Button 
                                mode="contained" 
                                onPress={() => handleAcceptBid(bid._id)} 
                                style={[styles.actionButton, styles.acceptButton]}
                                labelStyle={styles.acceptButtonLabel}
                              >
                                Kabul Et
                              </Button>
                            </>
                          )}
                          
                          {/* Kabul edilen tekliflerin detaylarını görüntüleme butonu */}
                          {(isOwner() && isAccepted) && (
                            <Button 
                              mode="outlined" 
                              onPress={() => showBidderDetails(bid)}
                              style={{ marginTop: 8 }}
                              icon="account-details"
                            >
                              İletişim Bilgilerini Göster
                            </Button>
                          )}
                        </View>
                      </Surface>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="cash-outline" size={40} color="#9CA3AF" />
                  <Text style={styles.emptyStateText}>
                    Henüz teklif verilmemiş
                  </Text>
                  <Caption style={styles.emptyStateCaption}>
                    İlk teklifi veren siz olun!
                  </Caption>
                </View>
              )}
            </Card.Content>
          </Card>
        
          {/* Satıcı Bilgileri - Modern Kart */}
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Satıcı Bilgileri</Title>
              
              <View style={styles.sellerInfoNew}>
                <View style={styles.sellerAvatarContainer}>
                  <Avatar.Text 
                    size={60} 
                    label={
                      typeof listing.owner === 'object' 
                        ? listing.owner.name.charAt(0) 
                        : '?'
                    } 
                    style={styles.sellerAvatar}
                  />
                </View>
                
                <View style={styles.sellerDetailsNew}>
                  <Text style={styles.sellerNameNew}>
                    {typeof listing.owner === 'object' 
                      ? listing.owner.name 
                      : 'Satıcı'}
                  </Text>
                  
                  {typeof listing.owner === 'object' && listing.owner.companyInfo?.companyName && (
                    <Text style={styles.companyNameNew}>
                      {listing.owner.companyInfo.companyName}
                    </Text>
                  )}
                  
                  <Text style={styles.memberSinceNew}>
                    Kayıt Tarihi: {
                      typeof listing.owner === 'object' && listing.owner.createdAt
                        ? safeFormatDate(listing.owner.createdAt)
                        : 'Belirtilmemiş'
                    }
                  </Text>
                  
                  <View style={styles.sellerContactButtons}>
                    {typeof listing.owner === 'object' && listing.owner.email && (
                      <Button 
                        mode="outlined" 
                        icon="email-outline"
                        style={styles.contactButton}
                        onPress={() => Linking.openURL(`mailto:${listing.owner.email}`)}
                      >
                        E-posta
                      </Button>
                    )}
                    
                    {typeof listing.owner === 'object' && listing.owner.phone && (
                      <Button 
                        mode="outlined" 
                        icon="phone-outline"
                        style={styles.contactButton}
                        onPress={() => Linking.openURL(`tel:${listing.owner.phone}`)}
                      >
                        Ara
                      </Button>
                    )}
                  </View>
                </View>
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
          style={{ borderRadius: 12 }}
        >
          <Dialog.Title>Teklif Ver</Dialog.Title>
          <Dialog.Content>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Ters Açık Artırma Kuralları:</Text>
              <Text style={{ fontSize: 14, marginBottom: 4, color: '#4B5563' }}>
                • Teklifiniz, mevcut fiyattan daha düşük olmalıdır.
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 4, color: '#4B5563' }}>
                • Teklifiniz, mevcut fiyattan en az %5 daha düşük olmalıdır.
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 4, color: '#4B5563' }}>
                • En düşük teklif veren, ilan sahibi tarafından kabul edilme önceliğine sahiptir.
              </Text>
              <Text style={{ fontSize: 14, marginBottom: 4, color: '#4B5563' }}>
                • Teklifinizin geçerlilik süresi 12 saattir.
              </Text>
            </View>
            
            {listing && (
              <View style={{ backgroundColor: '#f0f9ff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Mevcut Fiyat: {listing.currentPrice.toFixed(2)} TL</Text>
                <Text style={{ color: '#0369a1' }}>
                  Kabul edilebilir maksimum teklif: {(listing.currentPrice * 0.95).toFixed(2)} TL
                </Text>
              </View>
            )}
            
            <TextInput
              label="Teklif Tutarı (TL)"
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="numeric"
              right={<TextInput.Affix text="TL" />}
              style={{ marginBottom: 8 }}
              mode="outlined"
              disabled={submitting}
              error={bidAmount !== '' && (isNaN(Number(bidAmount)) || Number(bidAmount) <= 0)}
            />
            {bidAmount !== '' && (isNaN(Number(bidAmount)) || Number(bidAmount) <= 0) && (
              <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 8 }}>
                Lütfen geçerli bir tutar giriniz
              </Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setBidDialogVisible(false)} disabled={submitting}>
              İptal
            </Button>
            <Button 
              mode="contained" 
              onPress={handleBid} 
              loading={submitting}
              disabled={
                submitting || 
                bidAmount === '' || 
                isNaN(Number(bidAmount)) || 
                Number(bidAmount) <= 0 ||
                !listing ||
                Number(bidAmount) >= listing.currentPrice ||
                Number(bidAmount) > listing.currentPrice * 0.95
              }
            >
              Teklif Ver
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Teklif Veren Detayları Dialog */}
      <Portal>
        <Dialog
          visible={bidderDetailsVisible}
          onDismiss={() => setBidderDetailsVisible(false)}
          style={{ borderRadius: 12, maxWidth: '90%' }}
        >
          <Dialog.Title>Teklif Veren Bilgileri</Dialog.Title>
          <BidderDetailDialog
            selectedBid={selectedBid}
            onRefresh={onRefresh}
            onClose={() => setBidderDetailsVisible(false)}
            getBidStatusColor={getBidStatusColor}
            getBidStatusText={getBidStatusText}
            safeFormatDate={safeFormatDate}
            isOwner={isOwner()}
          />
          <Dialog.Actions>
            <Button onPress={() => setBidderDetailsVisible(false)}>
              Kapat
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

export default ListingDetailScreen; 