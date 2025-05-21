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
    marginBottom: 12,
  },
  heroTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginTop: 8,
  },
  categoryChipHero: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    elevation: 0,
  },
  categoryChipTextHero: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  timeChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    elevation: 0,
  },
  
  // Yeni eklenen kategori resmi stilleri
  heroImageCard: {
    elevation: 0,
    borderRadius: 0,
    marginBottom: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    borderRadius: 0,
  },
  
  // Yükleme ve Hata Durumları
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
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
    marginLeft: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  
  // Teklifler Bölümü - Yeni stil
  bidsContainer: {
    marginTop: 8,
  },
  bidCardNew: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    overflow: 'hidden',
  },
  bidCardContentNew: {
    padding: 12,
  },
  bidCardHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidderAvatar: {
    marginRight: 12,
    backgroundColor: '#4F46E5',
  },
  bidderInfoNew: {
    flex: 1,
  },
  bidderNameNew: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  bidTimeNew: {
    fontSize: 12,
    color: '#6B7280',
  },
  bidAmountNew: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
  bidStatusSectionNew: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bidStatusChipNew: {
    height: 28,
    marginRight: 8,
  },
  bidActionButtonsNew: {
    flexDirection: 'row',
  },
  actionButtonNew: {
    marginHorizontal: 4,
    borderRadius: 4,
    height: 32,
  },
  actionButtonLabelNew: {
    fontSize: 12,
    marginVertical: 0,
  },
  acceptButtonNew: {
    backgroundColor: '#10B981',
  },
  rejectButtonNew: {
    borderColor: '#EF4444',
  },
  showMoreButton: {
    borderColor: '#4F46E5',
    marginTop: 8,
  },
  
  // Tüm teklifler listesi için stil
  allBidsItem: {
    paddingVertical: 8,
  },
  
  // Dialog
  dialogContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxWidth: '95%',
  },
  dialogText: {
    color: '#4B5563',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  ruleContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  ruleText: {
    color: '#4B5563',
    marginBottom: 4,
    fontSize: 13,
  },
  priceInfoContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  currentPriceInfo: {
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  recommendedPriceInfo: {
    fontWeight: 'bold',
    color: '#10B981',
  },
  bidInput: {
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
  },
  
  // Bidder Bilgi Dialog
  bidderInfoDialog: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidderNameContainer: {
    flex: 1,
    marginLeft: 16,
  },
  bidderNameDialog: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
}); 