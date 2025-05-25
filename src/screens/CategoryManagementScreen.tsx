import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { Text, Card, Button, TextInput, FAB, Dialog, Portal, Paragraph, IconButton, ActivityIndicator, Snackbar, Avatar, Menu, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { Category } from '../types';
import { useAuth } from '../hooks/useAuth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

type CategoryManagementScreenProps = {
  navigation: any;
};

const CategoryManagementScreen = ({ navigation }: CategoryManagementScreenProps) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon: '',
    image: '',
    isActive: true
  });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Resim ekleme formu için state'ler
  const [imageUploadVisible, setImageUploadVisible] = useState(false);
  const [selectedCategoryForImage, setSelectedCategoryForImage] = useState<string>('');
  const [imageForUpload, setImageForUpload] = useState<string | null>(null);
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);

  // Admin kontrolü
  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigation.replace('Home');
      Alert.alert('Yetkisiz Erişim', 'Bu sayfaya erişim izniniz bulunmamaktadır.');
    }
  }, [user, navigation]);

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      showSnackbar('Kategoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Resim ekleme dialog'unu takip et
  useEffect(() => {
    console.log('🔥 imageUploadVisible değişti:', imageUploadVisible);
    if (imageUploadVisible) {
      console.log('🖼️ RESİM EKLEME DIALOG\'U AÇIK!');
    } else {
      console.log('🖼️ Resim ekleme dialog\'u kapalı');
    }
  }, [imageUploadVisible]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const showDialog = () => {
    setVisible(true);
  };

  const hideDialog = () => {
    setVisible(false);
    setEditMode(false);
    setCurrentCategory({
      name: '',
      description: '',
      icon: '',
      image: '',
      isActive: true
    });
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory(category);
    setEditMode(true);
    showDialog();
  };

  const handleDeleteConfirm = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogVisible(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete._id);
      showSnackbar('Kategori başarıyla silindi.');
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
    } catch (error) {
      showSnackbar('Kategori silinirken bir hata oluştu.');
    } finally {
      setDeleteDialogVisible(false);
      setCategoryToDelete(null);
    }
  };

  const handleSave = async () => {
    try {
      if (!currentCategory.name) {
        return showSnackbar('Kategori adı zorunludur.');
      }

      const formData = new FormData();
      formData.append('name', currentCategory.name);
      formData.append('description', currentCategory.description || '');
      formData.append('icon', currentCategory.icon || '');
      formData.append('isActive', currentCategory.isActive ? 'true' : 'false');

      const token = await AsyncStorage.getItem('token');
      const apiUrl = 'http://192.168.254.112:5001';

      if (editMode && currentCategory._id) {
        const url = `${apiUrl}/api/categories/${currentCategory._id}`;
        
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Güncelleme başarısız: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (result.category) {
          setCategories(
            categories.map(c => (c._id === result.category._id ? result.category : c))
          );
          showSnackbar('Kategori başarıyla güncellendi.');
        }
      } else {
        const url = `${apiUrl}/api/categories`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ekleme başarısız: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        
        if (result.category) {
          setCategories([...categories, result.category]);
          showSnackbar('Kategori başarıyla eklendi.');
        }
      }
      hideDialog();
      loadCategories();
    } catch (error) {
      console.error('handleSave error:', error);
      showSnackbar(editMode ? 'Güncelleme sırasında hata oluştu.' : 'Ekleme sırasında hata oluştu.');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Resim ekleme formunu aç
  const openImageUploadForm = () => {
    console.log('🚨 RESİM EKLEME FORMU AÇILIYOR!');
    console.log('Önceki imageUploadVisible:', imageUploadVisible);
    setImageUploadVisible(true);
    setSelectedCategoryForImage('');
    setImageForUpload(null);
    console.log('Yeni imageUploadVisible: true');
  };

  // Resim ekleme formunu kapat
  const closeImageUploadForm = () => {
    console.log('Resim ekleme formu kapatılıyor...');
    setImageUploadVisible(false);
    setSelectedCategoryForImage('');
    setImageForUpload(null);
  };

  // Kategoriye resim yükleme için resim seç
  const pickImageForCategory = async () => {
    console.log('Kategoriye resim seçme fonksiyonu çağrıldı');
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('İzin Gerekli', 'Resim seçmek için galeri erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageForUpload(result.assets[0].uri);
    }
  };

  // Kategoriye resim yükle
  const uploadImageToCategory = async () => {
    if (!selectedCategoryForImage || !imageForUpload) {
      showSnackbar('Lütfen kategori seçin ve resim ekleyin.');
      return;
    }

    try {
      const formData = new FormData();
      
      const imageUri = imageForUpload;
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      const token = await AsyncStorage.getItem('token');
      const apiUrl = 'http://192.168.254.112:5001';
      const url = `${apiUrl}/api/categories/${selectedCategoryForImage}`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resim yükleme başarısız: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (result.category) {
        setCategories(
          categories.map(c => (c._id === result.category._id ? result.category : c))
        );
        showSnackbar('Kategori resmi başarıyla güncellendi.');
        closeImageUploadForm();
        loadCategories();
      }
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      showSnackbar('Resim yüklenirken hata oluştu.');
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
      </View>
    );
  }

  console.log('🔥 CategoryManagementScreen render ediliyor...');
  console.log('imageUploadVisible:', imageUploadVisible);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerTitle}>Kategori Yönetimi</Text>
        
        {/* MODERN RESİM EKLEME BUTONU */}
        <Card style={styles.modernImageUploadCard}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientContainer}
          >
            <View style={styles.modernCardContent}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmoji}>📷</Text>
                </View>
              </View>
              
              <Text style={styles.modernTitle}>
                Kategori Resim Yönetimi
              </Text>
              
              <Text style={styles.modernSubtitle}>
                Kategorilerinize özel resimler ekleyerek daha görsel bir deneyim sunun
              </Text>
              
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>✨</Text>
                  <Text style={styles.featureText}>Kolay resim yükleme</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>🎨</Text>
                  <Text style={styles.featureText}>Otomatik boyutlandırma</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureBullet}>⚡</Text>
                  <Text style={styles.featureText}>Anında güncelleme</Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={styles.modernButton}
                onPress={() => {
                  console.log('🔥 Modern buton tıklandı!');
                  openImageUploadForm();
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#ee5a24']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonIcon}>🖼️</Text>
                  <Text style={styles.buttonText}>Resim Yönetimi</Text>
                  <Text style={styles.buttonArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Card>
        
        {categories.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>Henüz kategori bulunmamaktadır.</Text>
            </Card.Content>
          </Card>
        ) : (
          categories.map(category => (
            <Card key={category._id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.categoryInfo}>
                    {category.image && (
                      <Avatar.Image 
                        size={40} 
                        source={{ uri: `http://192.168.254.112:5001${category.image}` }} 
                        style={styles.categoryImage}
                      />
                    )}
                    <View style={styles.categoryTextInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      {category.description && (
                        <Text style={styles.description}>{category.description}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </Text>
                  </View>
                </View>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => handleEdit(category)}>Düzenle</Button>
                <Button 
                  onPress={() => handleDeleteConfirm(category)}
                  color="red"
                >
                  Sil
                </Button>
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={showDialog}
        label="Yeni Kategori"
      />

      <Portal>
        {/* Normal Kategori Ekleme/Düzenleme Dialog'u */}
        <Dialog visible={visible} onDismiss={hideDialog} style={{ zIndex: 1000, maxHeight: '90%', margin: 10 }}>
          <Dialog.Title style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>
            {editMode ? '✏️ Kategori Düzenle' : '➕ Yeni Kategori Ekle'}
          </Dialog.Title>
          <Dialog.Content style={{ paddingBottom: 0, paddingTop: 10 }}>
            <ScrollView 
              showsVerticalScrollIndicator={true} 
              style={{ maxHeight: 400 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <TextInput
                label="Kategori Adı *"
                value={currentCategory.name}
                onChangeText={text =>
                  setCurrentCategory({ ...currentCategory, name: text })
                }
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="Açıklama"
                value={currentCategory.description}
                onChangeText={text =>
                  setCurrentCategory({ ...currentCategory, description: text })
                }
                multiline
                numberOfLines={3}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label="İkon (FontAwesome ismi)"
                value={currentCategory.icon}
                onChangeText={text =>
                  setCurrentCategory({ ...currentCategory, icon: text })
                }
                style={styles.input}
                mode="outlined"
              />

              <View style={styles.switchContainer}>
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Durum:</Text>
                <View style={{ flexDirection: 'row', marginLeft: 10 }}>
                  <Button
                    mode={currentCategory.isActive ? "contained" : "outlined"}
                    onPress={() => setCurrentCategory({ ...currentCategory, isActive: true })}
                    style={[styles.switchButton, { marginRight: 8 }]}
                    compact
                  >
                    Aktif
                  </Button>
                  <Button
                    mode={!currentCategory.isActive ? "contained" : "outlined"}
                    onPress={() => setCurrentCategory({ ...currentCategory, isActive: false })}
                    style={styles.switchButton}
                    compact
                  >
                    Pasif
                  </Button>
                </View>
              </View>

              <View style={{ marginTop: 20, padding: 15, backgroundColor: '#fff3cd', borderRadius: 10 }}>
                <Text style={{ fontSize: 14, color: '#856404', textAlign: 'center', fontWeight: 'bold' }}>
                  💡 İpucu: Kategoriye resim eklemek için ana sayfadaki "Resim Ekleme Formu" butonunu kullanın.
                </Text>
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>İptal</Button>
            <Button onPress={handleSave} mode="contained">Kaydet</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Kategori Silme Dialog'u */}
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Kategori Sil</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              "{categoryToDelete?.name}" kategorisini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>İptal</Button>
            <Button onPress={confirmDelete} color="red">Sil</Button>
          </Dialog.Actions>
        </Dialog>

        {/* RESİM EKLEME DIALOG'U */}
        <Dialog 
          visible={imageUploadVisible} 
          onDismiss={closeImageUploadForm} 
          style={{ 
            zIndex: 2000, 
            maxHeight: '95%', 
            margin: 5,
            backgroundColor: 'white'
          }}
        >
          <Dialog.Title style={{ 
            fontSize: 22, 
            fontWeight: 'bold', 
            textAlign: 'center', 
            color: '#1565C0',
            backgroundColor: '#e3f2fd',
            padding: 15,
            margin: -24,
            marginBottom: 10
          }}>
            📷 KATEGORİYE RESİM EKLE
          </Dialog.Title>
          <Dialog.Content style={{ paddingBottom: 0, paddingTop: 15 }}>
            <ScrollView 
              showsVerticalScrollIndicator={true} 
              style={{ maxHeight: 600 }} 
              contentContainerStyle={{ paddingBottom: 20 }}
              nestedScrollEnabled={true}
            >
              {/* Kategori Seçimi */}
              <View style={styles.categorySelectionSection}>
                <Text style={styles.sectionTitle}>1️⃣ Kategori Seçin</Text>
                <Menu
                  visible={categoryMenuVisible}
                  onDismiss={() => setCategoryMenuVisible(false)}
                  anchor={
                    <Button
                      mode="outlined"
                      onPress={() => setCategoryMenuVisible(true)}
                      style={styles.categorySelectButton}
                      contentStyle={{ height: 50 }}
                      labelStyle={{ fontSize: 16 }}
                    >
                      {selectedCategoryForImage 
                        ? categories.find(c => c._id === selectedCategoryForImage)?.name || 'Kategori Seç'
                        : 'Kategori Seç'
                      }
                    </Button>
                  }
                >
                  {categories.map((category) => (
                    <Menu.Item
                      key={category._id}
                      onPress={() => {
                        setSelectedCategoryForImage(category._id);
                        setCategoryMenuVisible(false);
                      }}
                      title={category.name}
                    />
                  ))}
                </Menu>
              </View>

              <Divider style={{ marginVertical: 20 }} />

              {/* Resim Seçimi */}
              <View style={styles.imageSelectionSection}>
                <Text style={styles.sectionTitle}>2️⃣ Resim Seçin</Text>
                <Button
                  mode="contained"
                  onPress={pickImageForCategory}
                  icon="camera"
                  style={[styles.imageSelectButton, { backgroundColor: '#4CAF50', elevation: 5 }]}
                  labelStyle={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}
                  contentStyle={{ height: 50 }}
                >
                  📸 Galeri'den Resim Seç
                </Button>

                {imageForUpload && (
                  <View style={styles.selectedImagePreview}>
                    <Avatar.Image 
                      size={100} 
                      source={{ uri: imageForUpload }} 
                    />
                    <Text style={{ marginTop: 8, color: '#4CAF50', fontWeight: 'bold', fontSize: 14 }}>
                      ✅ Resim seçildi!
                    </Text>
                    <Button
                      mode="outlined"
                      onPress={() => setImageForUpload(null)}
                      icon="delete"
                      style={{ marginTop: 10 }}
                      labelStyle={{ color: '#f44336' }}
                    >
                      Resmi Kaldır
                    </Button>
                  </View>
                )}

                {!imageForUpload && (
                  <View style={styles.noImageSelected}>
                    <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
                      🖼️ Henüz resim seçilmedi
                    </Text>
                  </View>
                )}
              </View>

              <Divider style={{ marginVertical: 20 }} />

              {/* Yükleme Butonu */}
              <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>3️⃣ Resmi Yükle</Text>
                <Button
                  mode="contained"
                  onPress={uploadImageToCategory}
                  icon="upload"
                  style={[styles.uploadButton, { 
                    backgroundColor: selectedCategoryForImage && imageForUpload ? '#2196F3' : '#ccc',
                    elevation: selectedCategoryForImage && imageForUpload ? 5 : 0
                  }]}
                  labelStyle={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}
                  contentStyle={{ height: 55 }}
                  disabled={!selectedCategoryForImage || !imageForUpload}
                >
                  🚀 Kategoriye Resim Yükle
                </Button>
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeImageUploadForm} mode="outlined">İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTextInfo: {
    marginLeft: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  switchButton: {
    marginLeft: 8,
  },
  emptyCard: {
    marginVertical: 20,
    padding: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
  },
  categoryImage: {
    marginRight: 8,
  },
  categorySelectionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1565C0',
  },
  categorySelectButton: {
    marginBottom: 10,
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  imageSelectionSection: {
    marginBottom: 20,
  },
  imageSelectButton: {
    marginBottom: 10,
  },
  selectedImagePreview: {
    marginTop: 12,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f0f8f0',
    borderRadius: 10,
  },
  noImageSelected: {
    marginTop: 12,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    marginBottom: 10,
  },
  modernImageUploadCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  gradientContainer: {
    borderRadius: 16,
    padding: 20,
  },
  modernCardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  iconEmoji: {
    fontSize: 28,
  },
  modernTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modernSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featureList: {
    marginBottom: 24,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  featureBullet: {
    fontSize: 16,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    flex: 1,
  },
  modernButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    minWidth: 250,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default CategoryManagementScreen; 