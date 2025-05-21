import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNotification } from '../hooks/useNotification';
import { useNavigation } from '@react-navigation/native';
import { Divider, Button, IconButton } from 'react-native-paper';
import { formatDistanceToNow, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Notification } from '../types';

const NotificationsScreen: React.FC = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, loadNotifications } = useNotification();
  const navigation = useNavigation();

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    if (notification.relatedListing) {
      console.log('İlgili ilan ID:', notification.relatedListing);
      // İlan ID'sini doğru şekilde al, obje değil string olmalı
      const listingId = typeof notification.relatedListing === 'object' 
        ? (notification.relatedListing as any)._id || (notification.relatedListing as any).id 
        : notification.relatedListing;
        
      console.log('İşlenmiş İlan ID:', listingId);
      
      if (listingId) {
        // @ts-ignore - Navigasyon tipi için
        navigation.navigate('ListingDetail', { id: listingId });
      } else {
        console.log('Geçerli ilan ID bulunamadı');
      }
    } else {
      console.log('İlgili ilan bulunamadı');
    }
  };

  // Bildirim tipine göre ikon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return '💰';
      case 'expiry':
        return '⏱️';
      case 'approval':
        return '✅';
      case 'rejection':
        return '❌';
      case 'winner':
        return '🏆';
      default:
        return '📌';
    }
  };

  // Bildirim tipine göre renk
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bid':
        return '#1976d2';
      case 'expiry':
        return '#ed6c02';
      case 'approval':
        return '#2e7d32';
      case 'rejection':
        return '#d32f2f';
      case 'winner':
        return '#2e7d32';
      default:
        return '#1976d2';
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        { backgroundColor: item.isRead ? 'white' : '#f0f8ff' }
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.icon}>{getTypeIcon(item.type)}</Text>
        <Text style={[styles.title, { color: getTypeColor(item.type) }]}>
          {item.title}
        </Text>
        {!item.isRead && (
          <IconButton
            icon="email-check"
            size={18}
            style={styles.markReadButton}
            onPress={(e) => {
              e.stopPropagation();
              markAsRead(item._id);
            }}
          />
        )}
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: tr })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>
        {unreadCount > 0 && (
          <Button 
            mode="outlined" 
            onPress={markAllAsRead}
            style={styles.markAllReadButton}
          >
            Tümünü Okundu İşaretle
          </Button>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bildiriminiz bulunmuyor</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item._id}
          ItemSeparatorComponent={() => <Divider />}
          refreshing={loading}
          onRefresh={loadNotifications}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  markAllReadButton: {
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  markReadButton: {
    margin: 0,
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
  },
});

export default NotificationsScreen; 