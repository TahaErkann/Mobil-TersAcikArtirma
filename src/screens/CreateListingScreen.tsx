import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Alert, 
  FlatList
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  Appbar, 
  Headline, 
  Subheading,
  Caption, 
  Chip, 
  Divider, 
  Portal, 
  Dialog, 
  RadioButton,
  List,
  Surface,
  FAB,
  ActivityIndicator,
  Snackbar
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { getAllCategories } from '../services/categoryService';
import { createListing } from '../services/listingService';
import { Category, ListingItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import Toast from 'react-native-toast-message';

type CreateListingScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'CreateListing'>;
};

const unitOptions = ["Adet", "Koli", "Takım", "Paket", "Metre", "Kilogram", "Litre"];

const CreateListingScreen: React.FC<CreateListingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryDialogVisible, setCategoryDialogVisible] = useState(false);
  const [initialMaxPrice, setInitialMaxPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 hafta sonrası
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // İlan içindeki ürün/parça listesi
  const [items, setItems] = useState<ListingItem[]>([]);
  
  // Yeni eklenecek ürün verileri
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemUnit, setItemUnit] = useState('Adet');
  const [itemDescription, setItemDescription] = useState('');
  const [itemDialogVisible, setItemDialogVisible] = useState(false);
  const [unitDialogVisible, setUnitDialogVisible] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Lokasyon için state eklemesi yapıyorum
  const [location, setLocation] = useState('');
  
  // Kategorileri yükle
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      // Sadece aktif kategorileri filtrele
      const activeCategories = data.filter(category => category.isActive);
      setCategories(activeCategories);
    } catch (error) {
      console.error("Kategoriler yüklenirken hata:", error);
      showSnackbar('Kategoriler yüklenemedi. Lütfen tekrar deneyin.');
    }
  };
  
  // Tarih seçiciyi göster/gizle
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  
  // Tarih değiştirildiğinde
  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Android için tarih seçicisini her durumda kapat
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    } else {
      // iOS için sadece iptal edilmediyse kapat
      setShowDatePicker(Platform.OS === 'ios');
    }
    
    // Eğer tarih seçildiyse state'i güncelle
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };
  
  // Kategori seçme dialogunu aç
  const openCategoryDialog = () => {
    setCategoryDialogVisible(true);
  };
  
  // Kategori seçildiğinde
  const selectCategory = (category: Category) => {
    setSelectedCategory(category);
    setCategoryDialogVisible(false);
  };
  
  // Ürün ekle/düzenle dialogunu aç
  const openItemDialog = (index?: number) => {
    if (index !== undefined) {
      // Düzenleme modu
      const item = items[index];
      setItemName(item.name);
      setItemQuantity(item.quantity.toString());
      setItemUnit(item.unit);
      setItemDescription(item.description || '');
      setEditingItemIndex(index);
    } else {
      // Yeni ekleme modu
      setItemName('');
      setItemQuantity('1');
      setItemUnit('Adet');
      setItemDescription('');
      setEditingItemIndex(null);
    }
    setItemDialogVisible(true);
  };
  
  // Birim seçme dialogunu aç
  const openUnitDialog = () => {
    setUnitDialogVisible(true);
  };
  
  // Ürün ekleme/düzenleme tamamlandığında
  const handleSaveItem = () => {
    if (!itemName.trim()) {
      showSnackbar('Ürün adı girilmelidir');
      return;
    }
    
    if (isNaN(Number(itemQuantity)) || Number(itemQuantity) <= 0) {
      showSnackbar('Geçerli bir miktar giriniz');
      return;
    }
    
    const newItem: ListingItem = {
      name: itemName.trim(),
      quantity: Number(itemQuantity),
      unit: itemUnit,
      description: itemDescription.trim() || undefined
    };
    
    if (editingItemIndex !== null) {
      // Mevcut ürünü güncelle
      const updatedItems = [...items];
      updatedItems[editingItemIndex] = newItem;
      setItems(updatedItems);
    } else {
      // Yeni ürün ekle
      setItems([...items, newItem]);
    }
    
    setItemDialogVisible(false);
  };
  
  // Ürün sil
  const handleDeleteItem = (index: number) => {
    Alert.alert(
      "Ürünü Sil",
      "Bu ürünü silmek istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        { 
          text: "Sil", 
          onPress: () => {
            const updatedItems = [...items];
            updatedItems.splice(index, 1);
            setItems(updatedItems);
          },
          style: "destructive"
        }
      ]
    );
  };
  
  // İlan oluştur
  const handleCreateListing = async () => {
    // Form doğrulama
    if (!title.trim()) {
      showSnackbar('İlan başlığı boş olamaz');
      return;
    }
    if (!description.trim()) {
      showSnackbar('İlan açıklaması boş olamaz');
      return;
    }
    if (!selectedCategory) {
      showSnackbar('Lütfen bir kategori seçin');
      return;
    }
    if (items.length === 0) {
      showSnackbar('En az bir ürün eklemelisiniz');
      return;
    }
    if (!expiryDate) {
      showSnackbar('Lütfen bir bitiş tarihi seçin');
      return;
    }

    try {
      setLoading(true);
      
      // Ürün listesini kontrol et
      const validItems = items.map(item => ({
        name: item.name,
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'Adet',
        description: item.description || ''
      }));
      
      console.log('Gönderilecek ürün listesi:', JSON.stringify(validItems, null, 2));
      
      // Toplam ürün miktarı hesaplama
      const totalQuantity = validItems.reduce((total, item) => total + item.quantity, 0);
      // Birim - ilk ürünün birimini kullan veya varsayılan olarak 'Adet'
      const defaultUnit = items.length > 0 ? items[0].unit : 'Adet';
      
      // İlan verilerini hazırla
      const listingData = {
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory._id, // categoryId yerine category
        location: location || 'Belirtilmedi',
        items: validItems,
        initialMaxPrice: Number(initialMaxPrice) || 0,
        expiresAt: expiryDate.toISOString(),
        quantity: totalQuantity,
        unit: defaultUnit
      };
      
      console.log('İlan verileri:', JSON.stringify(listingData, null, 2));
      
      // Servisi kullanarak ilan oluştur
      const result = await createListing(listingData);
      console.log('İlan oluşturma başarılı:', result);
      
      // Başarı mesajı göster
      Toast.show({
        type: 'success',
        text1: 'Başarılı',
        text2: 'İlan başarıyla oluşturuldu',
      });
      
      // Formu temizle
      setTitle('');
      setDescription('');
      setSelectedCategory(null);
      setInitialMaxPrice('');
      setLocation('');
      setExpiryDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      setItems([]);
      
      // Ana ekrana yönlendir
      navigation.navigate('Main');
    } catch (error: any) {
      console.error('İlan oluşturma hatası:', error);
      
      // API yanıtında hata mesajı varsa göster
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'İlan oluşturulurken bir hata oluştu';
      
      showSnackbar(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Snackbar mesajı göster
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
  // Kullanıcı onaylı değilse uyarı göster
  useEffect(() => {
    if (user && !user.isApproved) {
      Alert.alert(
        "Yetkisiz İşlem",
        "İlan oluşturmak için hesabınızın onaylanması gerekmektedir.",
        [
          {
            text: "Tamam",
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }, [user, navigation]);
  
  // Sayfa render
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Yeni İlan Oluştur" />
      </Appbar.Header>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Headline style={styles.headline}>İlan Detayları</Headline>
          
          {/* İlan Başlığı */}
          <TextInput
            label="İlan Başlığı"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            maxFontSizeMultiplier={1}
            autoComplete="off"
            autoCorrect={false}
            blurOnSubmit
            keyboardType="default"
            dense={true}
            textContentType="none"
            spellCheck={false}
            allowFontScaling={false}
          />
          
          {/* İlan Açıklaması */}
          <TextInput
            label="İlan Açıklaması (Opsiyonel)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            maxFontSizeMultiplier={1}
            autoComplete="off"
            autoCorrect={false}
            blurOnSubmit
            keyboardType="default"
            dense={true}
            textContentType="none"
            spellCheck={false}
            allowFontScaling={false}
          />
          
          {/* Kategori Seçimi */}
          <Text style={styles.label}>Kategori</Text>
          <TouchableOpacity onPress={openCategoryDialog}>
            <Surface style={styles.selectField}>
              <Text>
                {selectedCategory ? selectedCategory.name : 'Kategori seçiniz'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </Surface>
          </TouchableOpacity>
          
          {/* Maksimum Başlangıç Fiyatı */}
          <TextInput
            label="Maksimum Başlangıç Fiyatı (TL)"
            value={initialMaxPrice}
            onChangeText={setInitialMaxPrice}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            maxFontSizeMultiplier={1}
            autoComplete="off"
            autoCorrect={false}
            blurOnSubmit
            dense={true}
            textContentType="none"
            spellCheck={false}
            allowFontScaling={false}
          />
          
          {/* Bitiş Tarihi */}
          <Text style={styles.label}>İlan Bitiş Tarihi</Text>
          <TouchableOpacity onPress={toggleDatePicker} style={styles.dateField}>
            <Text>{expiryDate.toLocaleDateString('tr-TR')}</Text>
            <Ionicons name="calendar" size={20} color="#6b7280" />
          </TouchableOpacity>
          
          {/* DateTimePicker - yalnızca Android için */}
          {showDatePicker && Platform.OS === 'android' && (
            <View>
              <Button onPress={() => {
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 7); // 1 hafta sonra
                setExpiryDate(newDate);
                setShowDatePicker(false);
              }}>
                1 hafta sonra
              </Button>
              <Button onPress={() => {
                const newDate = new Date();
                newDate.setDate(newDate.getDate() + 14); // 2 hafta sonra
                setExpiryDate(newDate);
                setShowDatePicker(false);
              }}>
                2 hafta sonra
              </Button>
              <Button onPress={() => {
                const newDate = new Date();
                newDate.setMonth(newDate.getMonth() + 1); // 1 ay sonra
                setExpiryDate(newDate);
                setShowDatePicker(false);
              }}>
                1 ay sonra
              </Button>
              <Button onPress={() => setShowDatePicker(false)}>
                İptal
              </Button>
            </View>
          )}
          
          {/* iOS için ayrı kontrol */}
          {showDatePicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={expiryDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
          
          <Divider style={styles.divider} />
          
          {/* Ürün Listesi */}
          <View style={styles.itemsHeader}>
            <Headline style={styles.headline}>Ürün Listesi</Headline>
            <Button 
              mode="contained" 
              onPress={() => openItemDialog()}
              icon="plus"
              style={styles.addButton}
            >
              Ürün Ekle
            </Button>
          </View>
          
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Caption>Henüz ürün eklenmedi</Caption>
              <Caption>İlanınıza en az bir ürün eklemelisiniz</Caption>
            </View>
          ) : (
            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <Surface key={index} style={styles.itemCard}>
                  <View style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Text>
                      {item.description && (
                        <Text style={styles.itemDescription} numberOfLines={2}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity 
                        onPress={() => openItemDialog(index)}
                        style={styles.iconButton}
                      >
                        <Ionicons name="pencil" size={18} color="#4F46E5" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleDeleteItem(index)}
                        style={styles.iconButton}
                      >
                        <Ionicons name="trash" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Surface>
              ))}
            </View>
          )}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Konum</Text>
            <TextInput
              style={styles.input}
              placeholder="Ürün konumunu girin (Şehir, İlçe vb.)"
              value={location}
              onChangeText={setLocation}
              maxFontSizeMultiplier={1}
              autoComplete="off"
              autoCorrect={false}
              blurOnSubmit
              keyboardType="default"
              dense={true}
              textContentType="none"
              spellCheck={false}
              allowFontScaling={false}
              mode="outlined"
            />
          </View>
          
          <Button 
            mode="contained" 
            onPress={handleCreateListing}
            disabled={loading}
            style={styles.createButton}
            labelStyle={styles.createButtonLabel}
          >
            {loading ? 'İlan Oluşturuluyor...' : 'İlan Oluştur'}
          </Button>
        </View>
      </ScrollView>
      
      {/* Kategori Seçme Dialog */}
      <Portal>
        <Dialog
          visible={categoryDialogVisible}
          onDismiss={() => setCategoryDialogVisible(false)}
        >
          <Dialog.Title>Kategori Seçin</Dialog.Title>
          <Dialog.Content>
            <FlatList
              data={categories}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={item.description}
                  onPress={() => selectCategory(item)}
                  left={props => <List.Icon {...props} icon="folder" />}
                />
              )}
              style={styles.dialogList}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCategoryDialogVisible(false)}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Ürün Ekleme/Düzenleme Dialog */}
      <Portal>
        <Dialog
          visible={itemDialogVisible}
          onDismiss={() => setItemDialogVisible(false)}
        >
          <Dialog.Title>
            {editingItemIndex !== null ? 'Ürün Düzenle' : 'Ürün Ekle'}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Ürün Adı"
              value={itemName}
              onChangeText={setItemName}
              mode="outlined"
              style={styles.dialogInput}
              maxFontSizeMultiplier={1}
              autoComplete="off"
              autoCorrect={false}
              blurOnSubmit
              keyboardType="default"
              dense={true}
              textContentType="none"
              spellCheck={false}
              allowFontScaling={false}
            />
            
            <View style={styles.quantityRow}>
              <TextInput
                label="Miktar"
                value={itemQuantity}
                onChangeText={setItemQuantity}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.dialogInput, styles.quantityInput]}
                maxFontSizeMultiplier={1}
                autoComplete="off"
                autoCorrect={false}
                blurOnSubmit
                dense={true}
                textContentType="none"
                spellCheck={false}
                allowFontScaling={false}
              />
              
              <TouchableOpacity 
                onPress={openUnitDialog}
                style={styles.unitSelector}
              >
                <Text>{itemUnit}</Text>
                <Ionicons name="chevron-down" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              label="Ürün Açıklaması (Opsiyonel)"
              value={itemDescription}
              onChangeText={setItemDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.dialogInput}
              maxFontSizeMultiplier={1}
              autoComplete="off"
              autoCorrect={false}
              blurOnSubmit
              keyboardType="default"
              dense={true}
              textContentType="none"
              spellCheck={false}
              allowFontScaling={false}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setItemDialogVisible(false)}>İptal</Button>
            <Button onPress={handleSaveItem}>Kaydet</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Birim Seçme Dialog */}
      <Portal>
        <Dialog
          visible={unitDialogVisible}
          onDismiss={() => setUnitDialogVisible(false)}
        >
          <Dialog.Title>Birim Seçin</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group 
              onValueChange={value => {
                setItemUnit(value);
                setUnitDialogVisible(false);
              }} 
              value={itemUnit}
            >
              {unitOptions.map((unit) => (
                <RadioButton.Item 
                  key={unit} 
                  label={unit} 
                  value={unit} 
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setUnitDialogVisible(false)}>İptal</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Yükleme göstergesini içeren overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
      
      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  headline: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  selectField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  dateField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    borderRadius: 4,
  },
  itemsList: {
    marginBottom: 24,
  },
  itemCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 24,
  },
  createButton: {
    padding: 4,
    marginBottom: 32,
  },
  createButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dialogList: {
    maxHeight: 300,
  },
  dialogInput: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quantityInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    width: 100,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  formGroup: {
    marginBottom: 16,
  },
});

export default CreateListingScreen; 