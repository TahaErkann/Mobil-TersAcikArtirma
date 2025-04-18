import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ActivityIndicator, Modal, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllCategories, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../services/categoryService';
import { Category } from '../types';

const AdminCategoriesScreen = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      setCategories(response);
      filterCategories(response, searchQuery);
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
  };

  // Başlangıçta kategorileri yükle
  useEffect(() => {
    loadCategories();
  }, []);

  // Arama ve filtreleme
  const filterCategories = (categoryList: Category[], query: string) => {
    if (!query) {
      setFilteredCategories(categoryList);
      return;
    }
    
    // Arama filtresi
    const filtered = categoryList.filter(category => 
      category.name.toLowerCase().includes(query.toLowerCase()) || 
      (category.description && category.description.toLowerCase().includes(query.toLowerCase()))
    );
    
    setFilteredCategories(filtered);
  };

  useEffect(() => {
    filterCategories(categories, searchQuery);
  }, [searchQuery]);

  // Kategori ekle modalı aç
  const openAddModal = () => {
    setEditMode(false);
    setCurrentCategory(null);
    setCategoryName('');
    setCategoryDescription('');
    setModalVisible(true);
  };

  // Kategori düzenle modalı aç
  const openEditModal = (category: Category) => {
    setEditMode(true);
    setCurrentCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
    setModalVisible(true);
  };

  // Kategori kaydet
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Hata', 'Kategori adı boş olamaz');
      return;
    }

    try {
      setLoading(true);
      
      if (editMode && currentCategory) {
        // Kategori güncelle
        await updateCategory(currentCategory._id, {
          name: categoryName,
          description: categoryDescription
        });
        Alert.alert('Başarılı', `${categoryName} kategorisi güncellendi`);
      } else {
        // Yeni kategori ekle
        await createCategory({
          name: categoryName,
          description: categoryDescription
        });
        Alert.alert('Başarılı', `${categoryName} kategorisi eklendi`);
      }
      
      setModalVisible(false);
      loadCategories();
    } catch (error: any) {
      Alert.alert(
        'Hata', 
        error.message || (editMode ? 'Kategori güncellenirken bir hata oluştu' : 'Kategori eklenirken bir hata oluştu')
      );
    } finally {
      setLoading(false);
    }
  };

  // Kategori sil
  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'Kategoriyi Sil',
      `"${category.name}" kategorisini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteCategory(category._id);
              Alert.alert('Başarılı', `${category.name} kategorisi silindi`);
              loadCategories();
            } catch (error: any) {
              Alert.alert('Hata', error.message || 'Kategori silinirken bir hata oluştu');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Kategori durumunu değiştir (aktif/pasif)
  const handleToggleCategoryStatus = async (category: Category) => {
    try {
      setLoading(true);
      await toggleCategoryStatus(category._id);
      
      const statusText = category.isActive ? 'pasif' : 'aktif';
      Alert.alert('Başarılı', `${category.name} kategorisi ${statusText} duruma getirildi`);
      
      loadCategories();
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kategori durumu değiştirilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Kategori öğesi
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={[
      styles.categoryItem, 
      { borderLeftColor: item.isActive ? '#4ade80' : '#9ca3af', borderLeftWidth: 4 }
    ]}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.isActive ? '#4ade80' : '#9ca3af' }
        ]}>
          <Text style={styles.statusText}>
            {item.isActive ? 'Aktif' : 'Pasif'}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={18} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.toggleButton]}
          onPress={() => handleToggleCategoryStatus(item)}
        >
          <Ionicons 
            name={item.isActive ? 'eye-off' : 'eye'} 
            size={18} 
            color="white" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteCategory(item)}
        >
          <Ionicons name="trash" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kategori Yönetimi</Text>
      </View>
      
      <View style={styles.actionsBar}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Kategori ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={52} color="#4F46E5" />
          <Text style={styles.loadingText}>Kategoriler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategoryItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open" size={50} color="#d1d5db" />
              <Text style={styles.emptyText}>Kategori bulunamadı</Text>
            </View>
          }
        />
      )}
      
      {/* Kategori Ekle/Düzenle Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Kategori Adı</Text>
              <TextInput
                style={styles.input}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Kategori adı girin"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={categoryDescription}
                onChangeText={setCategoryDescription}
                placeholder="Açıklama girin (isteğe bağlı)"
                multiline
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveCategory}
              >
                <Text style={styles.buttonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flex: 1,
    marginRight: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  categoryItem: {
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
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  categoryDescription: {
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: '#4F46E5',
  },
  toggleButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default AdminCategoriesScreen; 