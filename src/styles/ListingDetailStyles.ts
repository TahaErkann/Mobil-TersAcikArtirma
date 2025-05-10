import { StyleSheet } from 'react-native';

export const listingDetailStyles = StyleSheet.create({
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
    padding: 8,
    backgroundColor: '#ffeeee',
    borderRadius: 4,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
  },
  emptyStateCaption: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  bidderDetailedInfo: {
    marginTop: 12,
    paddingTop: 8,
  },
  bidderDetailTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bidderDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bidderDetailLabel: {
    width: 80,
    fontSize: 14,
    color: '#6B7280',
  },
  bidderDetailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tapForDetails: {
    textAlign: 'center',
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 8,
  },
  bidderDetailDialog: {
    maxWidth: '90%',
    borderRadius: 12,
  },
  bidderDetailScrollView: {
    maxHeight: 400,
  },
  bidderInfoDialog: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bidderNameContainer: {
    marginLeft: 16,
    flex: 1,
  },
  bidderNameDialog: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  debugInfo: {
    padding: 8,
    backgroundColor: '#eeeeff',
    borderRadius: 4,
    marginBottom: 8,
  }
}); 