import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { Text, Card, Button, TextInput, FAB, Dialog, Portal, Paragraph, IconButton, ActivityIndicator, Snackbar } from 'react-native-paper';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService';
import { Category } from '../types';
import { useAuth } from '../hooks/useAuth';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type CategoryManagementScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'CategoryManagement'>;
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
    isActive: true
  });
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  const showDialog = () => setVisible(true);
  const hideDialog = () => {
    setVisible(false);
    setEditMode(false);
    setCurrentCategory({
      name: '',
      description: '',
      icon: '',
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

      if (editMode && currentCategory._id) {
        const updatedCategory = await updateCategory(
          currentCategory._id,
          currentCategory
        );
        setCategories(
          categories.map(c => (c._id === updatedCategory._id ? updatedCategory : c))
        );
        showSnackbar('Kategori başarıyla güncellendi.');
      } else {
        const newCategory = await createCategory(currentCategory);
        setCategories([...categories, newCategory]);
        showSnackbar('Kategori başarıyla eklendi.');
      }
      hideDialog();
    } catch (error) {
      showSnackbar(editMode ? 'Güncelleme sırasında hata oluştu.' : 'Ekleme sırasında hata oluştu.');
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.headerTitle}>Kategori Yönetimi</Text>
        
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
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </Text>
                  </View>
                </View>
                {category.description && (
                  <Text style={styles.description}>{category.description}</Text>
                )}
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
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{editMode ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Kategori Adı"
              value={currentCategory.name}
              onChangeText={text =>
                setCurrentCategory({ ...currentCategory, name: text })
              }
              style={styles.input}
            />
            <TextInput
              label="Açıklama"
              value={currentCategory.description}
              onChangeText={text =>
                setCurrentCategory({ ...currentCategory, description: text })
              }
              multiline
              style={styles.input}
            />
            <TextInput
              label="İkon (FontAwesome ismi)"
              value={currentCategory.icon}
              onChangeText={text =>
                setCurrentCategory({ ...currentCategory, icon: text })
              }
              style={styles.input}
            />

            <View style={styles.switchContainer}>
              <Text>Durum:</Text>
              <Button
                mode={currentCategory.isActive ? "contained" : "outlined"}
                onPress={() => setCurrentCategory({ ...currentCategory, isActive: true })}
                style={styles.switchButton}
              >
                Aktif
              </Button>
              <Button
                mode={!currentCategory.isActive ? "contained" : "outlined"}
                onPress={() => setCurrentCategory({ ...currentCategory, isActive: false })}
                style={styles.switchButton}
              >
                Pasif
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>İptal</Button>
            <Button onPress={handleSave}>Kaydet</Button>
          </Dialog.Actions>
        </Dialog>

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
});

export default CategoryManagementScreen; 