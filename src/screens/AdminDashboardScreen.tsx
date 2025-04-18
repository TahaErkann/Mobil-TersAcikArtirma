import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers } from '../services/authService';
import { getStats } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';

interface Stats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  totalListings: number;
  pendingListings: number;
  activeListings: number;
  completedListings: number;
  totalCategories: number;
  totalBids: number;
}

const AdminDashboardScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    pendingUsers: 0,
    activeUsers: 0,
    totalListings: 0,
    pendingListings: 0,
    activeListings: 0,
    completedListings: 0,
    totalCategories: 0,
    totalBids: 0
  });

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      setLoading(true);
      
      // getStats fonksiyonu ile tüm istatistikleri al
      // (Backend'de endpoint yoksa otomatik manuel hesaplama yapıyor)
      const response = await getStats();
      setStats(response);
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      
      // Hata durumunda manuel olarak hesaplama yapmayı dene
      try {
        // Kullanıcıları alıp bazı istatistikleri manuel hesapla
        const users = await getAllUsers();
        const pendingUsers = users.filter(u => !u.isApproved && !u.isRejected).length;
        const activeUsers = users.filter(u => u.isApproved).length;
        
        setStats({
          totalUsers: users.length,
          pendingUsers,
          activeUsers,
          totalListings: 0, // Diğer değerler hesaplanamadı
          pendingListings: 0,
          activeListings: 0,
          completedListings: 0,
          totalCategories: 0,
          totalBids: 0
        });
      } catch (innerError) {
        console.error('İstatistik hesaplama hatası:', innerError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();

    // Component yüklendiğinde ve ekran odağına geldiğinde istatistikleri güncelle
    const unsubscribe = navigation.addListener('focus', () => {
      loadStats();
    });

    return unsubscribe;
  }, [navigation]);

  const navigateToScreen = (screenName: string) => {
    // Tab isimleri Türkçeleştirildi, doğru isimleri kullanalım
    try {
      if (screenName === 'Kullanıcılar' || screenName === 'İlanlar' || screenName === 'Kategoriler') {
        navigation.navigate(screenName);
      } else if (screenName === 'Settings') {
        // Settings henüz uygulanmadı, kullanıcıya bilgi ver
        Alert.alert('Bilgi', 'Ayarlar ekranı henüz uygulanmadı.');
      } else {
        console.warn(`Bilinmeyen ekran ismi: ${screenName}`);
      }
    } catch (e) {
      console.error(`Navigasyon hatası: ${screenName} ekranına gidilemedi`, e);
    }
  };

  // Çıkış işlemi
  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Çıkış Yap", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              // Çıkış başarılı olduktan sonra otomatik olarak login ekranına yönlendirilecek
            } catch (error) {
              console.error('Çıkış yapılırken hata:', error);
              Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu. Lütfen tekrar deneyin.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={52} color="#4F46E5" />
        <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Paneli</Text>
        <Text style={styles.subtitle}>Hoş geldin, {user?.name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Genel İstatistikler</Text>
        
        <View style={styles.statCards}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={24} color="#4F46E5" />
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pendingUsers}</Text>
            <Text style={styles.statLabel}>Onay Bekleyen</Text>
            <View style={styles.iconContainer}>
              <Ionicons name="hourglass" size={24} color="#F59E0B" />
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalListings}</Text>
            <Text style={styles.statLabel}>Toplam İlan</Text>
            <View style={styles.iconContainer}>
              <Ionicons name="document-text" size={24} color="#3B82F6" />
            </View>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalCategories}</Text>
            <Text style={styles.statLabel}>Kategoriler</Text>
            <View style={styles.iconContainer}>
              <Ionicons name="list" size={24} color="#10B981" />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.sectionTitle}>Yönetim Menüsü</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('Kullanıcılar')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="people" size={24} color="white" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Kullanıcı Yönetimi</Text>
            <Text style={styles.menuSubtitle}>Kullanıcıları onayla, reddet ve yönet</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('İlanlar')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="document-text" size={24} color="white" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>İlan Yönetimi</Text>
            <Text style={styles.menuSubtitle}>İlanları onayla, düzenle ve sil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('Kategoriler')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#10B981' }]}>
            <Ionicons name="list" size={24} color="white" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Kategori Yönetimi</Text>
            <Text style={styles.menuSubtitle}>Kategorileri ekle, düzenle ve sil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigateToScreen('Settings')}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#6B7280' }]}>
            <Ionicons name="settings" size={24} color="white" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Ayarlar</Text>
            <Text style={styles.menuSubtitle}>Sistem ayarlarını yönet</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Çıkış Butonu */}
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutButton]}
          onPress={handleLogout}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="log-out" size={24} color="white" />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={styles.menuTitle}>Çıkış Yap</Text>
            <Text style={styles.menuSubtitle}>Hesabınızdan güvenli çıkış yapın</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.version}>
        <Text style={styles.versionText}>Ters Açık Artırma Admin v1.0</Text>
      </View>
    </ScrollView>
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
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  statCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  menuContainer: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  version: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default AdminDashboardScreen; 