import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar, Card, Title, Paragraph, Divider, Chip, Surface, HelperText } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/authService';

const ProfileScreen = () => {
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    companyName: user?.companyInfo?.companyName || '',
    address: user?.companyInfo?.address || '',
    city: user?.companyInfo?.city || '',
    phone: user?.companyInfo?.phone || '',
    taxNumber: user?.companyInfo?.taxNumber || '',
    description: user?.companyInfo?.description || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      const updatedUser = await updateProfile(formData);
      updateUser(updatedUser);
      setSuccess(true);
      
      // Onay beklemedeyse bilgi mesajı göster
      if (!updatedUser.isApproved && !updatedUser.isRejected) {
        setError('Firma bilgileriniz kaydedildi. Admin onayı bekleniyor.');
      }
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
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
              backgroundColor="#4F46E5"
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
});

export default ProfileScreen; 