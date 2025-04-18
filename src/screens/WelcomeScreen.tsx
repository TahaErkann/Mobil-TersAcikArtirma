import React from 'react';
import { View, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Text, Button, Title, Card, ActivityIndicator } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

// Props tipi tanımla
interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// Ana Sayfa ekranı
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header Bölümü */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Title style={styles.title}>Ters Açık Artırma</Title>
        <Text style={styles.subtitle}>İşletmeler İçin En Düşük Fiyat Platformu</Text>
      </View>

      {/* Giriş ve Kayıt Butonları */}
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          Giriş Yap
        </Button>
        <Button 
          mode="outlined" 
          style={styles.button}
          onPress={() => navigation.navigate('Register')}
        >
          Kayıt Ol
        </Button>
      </View>

      {/* Uygulama Tanıtımı */}
      <View style={styles.infoSection}>
        <Title style={styles.sectionTitle}>Ters Açık Artırma Nedir?</Title>
        <Text style={styles.paragraph}>
          Geleneksel açık artırmalarda, alıcılar fiyatı yükseltmek için yarışır. 
          Ters açık artırmada ise satıcılar, en düşük fiyatı sunmak için rekabet eder.
        </Text>
        <Text style={styles.paragraph}>
          İşletmeler için tedarik maliyetlerini düşürmek ve rekabetçi fiyatlar elde 
          etmek için ideal bir platformdur.
        </Text>
      </View>

      {/* Özellikler */}
      <Title style={styles.sectionTitle}>Özellikler</Title>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.featuresContainer}
      >
        <Card style={styles.featureCard}>
          <Card.Content>
            <Title style={styles.featureTitle}>Gerçek Zamanlı Teklifler</Title>
            <Text style={styles.featureText}>
              Teklifleri anında görün ve rekabete hemen katılın.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.featureCard}>
          <Card.Content>
            <Title style={styles.featureTitle}>Kategori Bazlı Arama</Title>
            <Text style={styles.featureText}>
              İhtiyacınız olan ürünleri kategorilere göre kolayca bulun.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.featureCard}>
          <Card.Content>
            <Title style={styles.featureTitle}>Güvenli Ödeme</Title>
            <Text style={styles.featureText}>
              Güvenli işlem garantisi ile alışverişlerinizi gerçekleştirin.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Nasıl Çalışır */}
      <View style={styles.infoSection}>
        <Title style={styles.sectionTitle}>Nasıl Çalışır?</Title>
        
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Kayıt Olun</Text>
            <Text style={styles.stepText}>Hızlıca hesap oluşturun ve platformumuza katılın.</Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>İlanları İnceleyin</Text>
            <Text style={styles.stepText}>Aktif ilanları görüntüleyin ve size uygun olanları bulun.</Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Teklif Verin</Text>
            <Text style={styles.stepText}>Mevcut tekliften daha düşük bir fiyat sunun ve rekabete katılın.</Text>
          </View>
        </View>
      </View>

      {/* Alt Butonlar */}
      <View style={styles.bottomButtons}>
        <Button 
          mode="contained" 
          style={styles.fullWidthButton}
          onPress={() => navigation.navigate('Login')}
        >
          Hemen Başlayın
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#4F46E5',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
    color: '#4F46E5',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 10,
  },
  featuresContainer: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  featureCard: {
    width: width * 0.7,
    marginHorizontal: 10,
    borderRadius: 12,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 18,
    color: '#4F46E5',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#1F2937',
  },
  stepText: {
    fontSize: 14,
    color: '#4B5563',
  },
  bottomButtons: {
    padding: 20,
    marginBottom: 20,
  },
  fullWidthButton: {
    paddingVertical: 8,
  },
});

export default WelcomeScreen; 