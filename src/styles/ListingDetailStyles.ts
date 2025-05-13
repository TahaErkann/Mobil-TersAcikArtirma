import { StyleSheet } from 'react-native';

// İlan detay sayfası için modern ve şık stiller
export const listingDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  // Appbar ve Header Stiller
  appbar: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    elevation: 0,
  },
  hero: {
    height: 280,
    width: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
    paddingBottom: 16,
  },
  heroContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  categoryChipHero: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
  },
  categoryChipTextHero: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  timeChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
  },
  
  // Scroll View ve Container
  scrollView: {
    backgroundColor: '#F5F7FA',
  },
  detailContainer: {
    padding: 16,
    paddingTop: 0,
  },
  
  // Kartlar İçin Genel Stiller
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardPrimary: {
    marginTop: -40,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    backgroundColor: 'white',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  
  // Fiyat Kartı Stil
  priceCardContent: {
    padding: 16,
  },
  currentPriceSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  priceHeading: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  initialPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bidInfoSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  bidCountContainer: {
    alignItems: 'center',
  },
  bidCountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  bidCountBadge: {
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bidCountNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statusChip: {
    height: 28,
  },
  bidButtonNew: {
    marginTop: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 4,
  },
  bidButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Bölüm Başlıkları
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidCountChip: {
    backgroundColor: '#EEF2FF',
  },
  
  // Açıklama Bölümü
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  metaInfo: {
    marginTop: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaIcon: {
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  
  // Ürünler Listesi
  itemsContainer: {
    marginTop: 8,
  },
  itemCard: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  quantityChip: {
    backgroundColor: '#EEF2FF',
  },
  itemDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  
  // Teklifler Bölümü
  bidsContainer: {
    marginTop: 8,
  },
  bidCardNew: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bidHeaderNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidderInfoNew: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidderAvatar: {
    backgroundColor: '#4F46E5',
  },
  bidderDetails: {
    marginLeft: 12,
  },
  bidderNameNew: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  bidTimeNew: {
    fontSize: 12,
    color: '#6B7280',
  },
  bidAmountNew: {
    alignItems: 'flex-end',
  },
  bidPriceNew: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  statusChipBid: {
    height: 24,
  },
  
  // Teklif Kabul/Red Butonları
  bidActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    marginLeft: 8,
    minWidth: 100,
  },
  rejectButton: {
    borderColor: '#EF4444',
  },
  rejectButtonLabel: {
    color: '#EF4444',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonLabel: {
    color: '#FFFFFF',
  },
  
  // Satıcı Bilgileri
  sellerInfoNew: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  sellerAvatarContainer: {
    marginRight: 16,
  },
  sellerAvatar: {
    backgroundColor: '#4F46E5',
  },
  sellerDetailsNew: {
    flex: 1,
  },
  sellerNameNew: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  companyNameNew: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 8,
  },
  memberSinceNew: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  sellerContactButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  contactButton: {
    marginRight: 8,
    borderColor: '#4F46E5',
  },
  
  // Boş Durum
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
  emptyStateCaption: {
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Yükleme ve Hata Durumları
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
  },
  
  // Diğer Stiller
  divider: {
    marginVertical: 12,
  },
  // BidderDetailDialog için stil tanımlamaları
  bidderInfoDialog: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidderNameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  bidderNameDialog: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
}); 