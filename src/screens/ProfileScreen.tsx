import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Avatar, Card, Title, Paragraph, Divider, Chip, Surface, HelperText, IconButton } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/authService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

interface ProfileScreenProps {
  navigation?: NativeStackNavigationProp<any>;
}

const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { user, updateUser, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    city: '',
    phone: '',
    taxNumber: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Kullanıcı bilgileri değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (user) {
      console.log('ProfileScreen: User değişti, form güncelleniyor:', user);
      console.log('ProfileScreen: User companyInfo:', user.companyInfo);
      
      // CompanyInfo undefined veya null ise default değerleri kullan
      const companyInfo = user.companyInfo || {};
      
      setFormData({
        companyName: companyInfo.companyName || '',
        address: companyInfo.address || '',
        city: companyInfo.city || '',
        phone: companyInfo.phone || '',
        taxNumber: companyInfo.taxNumber || '',
        description: companyInfo.description || ''
      });
    }
  }, [user]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Form verileri gönderiliyor:', formData);
      const updatedUser = await updateProfile(formData);
      console.log('Backend\'den dönen güncellenmiş user:', updatedUser);
      
      updateUser(updatedUser);
      setSuccess(true);
      
      // Onay beklemedeyse bilgi mesajı göster
      if (!updatedUser.isApproved && !updatedUser.isRejected) {
        setError('Firma bilgileriniz kaydedildi. Admin onayı bekleniyor.');
      } else {
        setError(null);
      }
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Profil kaydetme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Lütfen giriş yapın</Text>
        <Button mode="contained" onPress={() => {}}>Giriş Yap</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header}>
        <View style={styles.profileHeader}>
          {user.profilePicture ? (
            <Avatar.Image 
              source={{ uri: user.profilePicture }} 
              size={80} 
            />
          ) : (
            <Avatar.Text 
              size={80} 
              label={user.name.substring(0, 1)} 
              style={{ backgroundColor: "#4F46E5" }}
            />
          )}
          <View style={styles.profileInfo}>
            <Title style={styles.name}>{user.name}</Title>
            <Paragraph style={styles.email}>{user.email}</Paragraph>
            
            {user.isApproved ? (
              <Chip 
                icon="check-circle" 
                mode="outlined" 
                style={styles.approvedChip}
              >
                Onaylı Firma
              </Chip>
            ) : user.isRejected ? (
              <Chip 
                icon="close-circle" 
                mode="outlined" 
                style={styles.rejectedChip}
              >
                Reddedildi
              </Chip>
            ) : (
              <Chip 
                icon="information" 
                mode="outlined" 
                style={styles.pendingChip}
              >
                Onay Bekliyor
              </Chip>
            )}
          </View>
        </View>
      </Surface>

      {user.isRejected && user.rejectionReason && (
        <Card style={styles.rejectionCard}>
          <Card.Content>
            <Title style={styles.rejectionTitle}>Firma Onayı Reddedildi</Title>
            <Paragraph style={styles.rejectionReason}>
              Sebep: {user.rejectionReason}
            </Paragraph>
            <Paragraph style={styles.rejectionHelp}>
              Lütfen bilgilerinizi güncelleyip tekrar başvurunuz.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {user.isApproved && (
        <Card style={styles.menuCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Hızlı Erişim</Title>
            <Divider style={styles.divider} />
            
            <View style={styles.menuContainer}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate('MyListings')}
              >
                <View style={styles.menuIconContainer}>
                  <IconButton icon="format-list-bulleted" size={24} iconColor="white" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>İlanlarım</Text>
                  <Text style={styles.menuSubtitle}>Oluşturduğunuz ilanları görüntüleyin</Text>
                </View>
                <IconButton icon="chevron-right" size={20} iconColor="#9CA3AF" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => navigation.navigate('MyBids')}
              >
                <View style={styles.menuIconContainer}>
                  <IconButton icon="gavel" size={24} iconColor="white" />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>Tekliflerim</Text>
                  <Text style={styles.menuSubtitle}>Verdiğiniz teklifleri takip edin</Text>
                </View>
                <IconButton icon="chevron-right" size={20} iconColor="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.formCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Firma Bilgileri</Title>
          <Divider style={styles.divider} />

          {error && (
            <HelperText type="info" visible={!!error} style={styles.message}>
              {error}
            </HelperText>
          )}

          {success && (
            <HelperText type="info" visible={success} style={styles.successMessage}>
              Bilgileriniz başarıyla kaydedildi.
            </HelperText>
          )}

          <TextInput
            label="Firma Adı"
            value={formData.companyName}
            onChangeText={(text) => handleChange('companyName', text)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="office-building" />}
          />

          <TextInput
            label="Vergi Numarası"
            value={formData.taxNumber}
            onChangeText={(text) => handleChange('taxNumber', text)}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="card-account-details" />}
          />

          <TextInput
            label="Adres"
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon="map-marker" />}
          />

          <View style={styles.row}>
            <TextInput
              label="Şehir"
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Icon icon="city" />}
            />

            <TextInput
              label="Telefon"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              mode="outlined"
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Icon icon="phone" />}
            />
          </View>

          <TextInput
            label="Firma Açıklaması"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={4}
            left={<TextInput.Icon icon="text-box" />}
          />

          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
            icon="content-save"
          >
            Bilgileri Kaydet
          </Button>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        icon="logout"
        textColor="#EF4444"
      >
        Çıkış Yap
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  email: {
    color: '#6B7280',
    marginBottom: 8,
  },
  approvedChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
    alignSelf: 'flex-start',
  },
  rejectedChip: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    alignSelf: 'flex-start',
  },
  pendingChip: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
    alignSelf: 'flex-start',
  },
  rejectionCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  rejectionTitle: {
    color: '#EF4444',
    fontSize: 16,
  },
  rejectionReason: {
    marginTop: 8,
  },
  rejectionHelp: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  formCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
  },
  logoutButton: {
    margin: 16,
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  message: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  successMessage: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10B981',
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  menuCard: {
    marginBottom: 16,
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ProfileScreen; 