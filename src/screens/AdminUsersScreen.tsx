import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, approveUser, rejectUser } from '../services/authService';
import { User } from '../types';

const AdminUsersScreen = ({ navigation }: any) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Kullanıcıları yükle
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response);
      filterUsers(response, searchQuery, filterStatus);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  // Başlangıçta kullanıcıları yükle
  useEffect(() => {
    loadUsers();
  }, []);

  // Arama ve filtreleme
  const filterUsers = (userList: User[], query: string, status: 'all' | 'pending' | 'approved' | 'rejected') => {
    let filtered = userList;
    
    // Durum filtresi
    if (status !== 'all') {
      if (status === 'pending') {
        filtered = filtered.filter(user => !user.isApproved && !user.isRejected);
      } else if (status === 'approved') {
        filtered = filtered.filter(user => user.isApproved);
      } else if (status === 'rejected') {
        filtered = filtered.filter(user => user.isRejected);
      }
    }
    
    // Arama filtresi
    if (query) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) || 
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        (user.companyInfo?.companyName && user.companyInfo.companyName.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    filterUsers(users, searchQuery, filterStatus);
  }, [searchQuery, filterStatus]);

  // Kullanıcıyı onayla
  const handleApproveUser = async (user: User) => {
    try {
      setLoading(true);
      await approveUser(user._id);
      Alert.alert('Başarılı', `${user.name} kullanıcısı onaylandı`);
      loadUsers();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kullanıcı onaylanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcıyı reddet
  const handleRejectUser = async (user: User) => {
    Alert.prompt(
      'Kullanıcıyı Reddet',
      'Lütfen reddetme nedeninizi girin:',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Reddet',
          style: 'destructive',
          onPress: async (reason: string | undefined) => {
            try {
              setLoading(true);
              await rejectUser(user._id, reason || 'Nedeni belirtilmemiş');
              Alert.alert('Başarılı', `${user.name} kullanıcısı reddedildi`);
              loadUsers();
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Kullanıcı reddedilirken bir hata oluştu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Kullanıcı detaylarını göster
  const handleViewUser = (user: User) => {
    Alert.alert(
      `${user.name}`,
      `Email: ${user.email}\n` +
      `Firma: ${user.companyInfo?.companyName || 'Belirtilmemiş'}\n` +
      `Adres: ${user.companyInfo?.address || 'Belirtilmemiş'}\n` +
      `Telefon: ${user.companyInfo?.phone || 'Belirtilmemiş'}\n` +
      `Vergi No: ${user.companyInfo?.taxNumber || 'Belirtilmemiş'}\n` +
      `Durum: ${user.isApproved ? 'Onaylandı' : user.isRejected ? 'Reddedildi' : 'Beklemede'}\n` +
      `${user.isRejected ? 'Ret Nedeni: ' + (user.rejectionReason || 'Belirtilmemiş') : ''}\n` +
      `Kayıt Tarihi: ${new Date(user.createdAt).toLocaleDateString('tr-TR')}`,
      [{ text: 'Tamam' }]
    );
  };

  // Kullanıcı durumuna göre renk
  const getUserStatusColor = (user: User) => {
    if (user.isApproved) return '#4ade80'; // yeşil
    if (user.isRejected) return '#f87171'; // kırmızı
    return '#facc15'; // sarı (beklemede)
  };

  // Kullanıcı durumunu göster
  const getUserStatusText = (user: User) => {
    if (user.isApproved) return 'Onaylı';
    if (user.isRejected) return 'Reddedildi';
    return 'Beklemede';
  };

  // Kullanıcı öğesi
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={[styles.userItem, { borderLeftColor: getUserStatusColor(item), borderLeftWidth: 4 }]}
      onPress={() => handleViewUser(item)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userCompany}>
          {item.companyInfo?.companyName || 'Firma belirtilmemiş'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getUserStatusColor(item) }]}>
          <Text style={styles.statusText}>{getUserStatusText(item)}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {!item.isApproved && !item.isRejected && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApproveUser(item)}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectUser(item)}
            >
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}
        
        {item.isApproved && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectUser(item)}
          >
            <Ionicons name="close-circle" size={20} color="white" />
          </TouchableOpacity>
        )}
        
        {item.isRejected && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApproveUser(item)}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kullanıcı Yönetimi</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kullanıcı ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'all' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={styles.filterText}>Tümü</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'pending' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={styles.filterText}>Bekleyenler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'approved' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('approved')}
        >
          <Text style={styles.filterText}>Onaylananlar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filterStatus === 'rejected' ? styles.activeFilter : null]}
          onPress={() => setFilterStatus('rejected')}
        >
          <Text style={styles.filterText}>Reddedilenler</Text>
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={52} color="#4F46E5" />
          <Text style={styles.loadingText}>Kullanıcılar yükleniyor...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people" size={50} color="#d1d5db" />
                <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#4F46E5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 4,
    backgroundColor: '#f3f4f6',
  },
  activeFilter: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 12,
    color: '#4b5563',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  listContent: {
    padding: 8,
  },
  userItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginVertical: 4,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#4b5563',
  },
  userCompany: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  approveButton: {
    backgroundColor: '#4ade80',
  },
  rejectButton: {
    backgroundColor: '#f87171',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    color: '#9ca3af',
  },
});

export default AdminUsersScreen; 