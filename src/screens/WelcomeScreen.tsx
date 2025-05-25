import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  Dimensions, 
  TouchableOpacity,
  Animated,
  StatusBar
} from 'react-native';
import { Text, Button, Title, Card, Surface, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// Props tipi tanımla
interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// Ana Sayfa ekranı
const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Sayfa yükleme animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderFeatureCard = (icon: string, title: string, description: string, color: string) => (
    <Surface style={[styles.featureCard, { backgroundColor: color }]} elevation={5}>
      <View style={styles.featureIconContainer}>
        <IconButton 
          icon={icon} 
          size={32} 
          iconColor="white"
          style={styles.featureIcon}
        />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureText}>{description}</Text>
    </Surface>
  );

  const renderStepCard = (number: string, title: string, description: string, icon: string) => (
    <Surface style={styles.stepCard} elevation={3}>
      <View style={styles.stepIconContainer}>
        <View style={styles.stepNumberGradient}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <IconButton 
          icon={icon} 
          size={24} 
          iconColor="#667eea"
          style={styles.stepIcon}
        />
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepText}>{description}</Text>
      </View>
    </Surface>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={styles.logo} 
                resizeMode="contain"
              />
              <View style={styles.logoGlow} />
            </View>
            
            <Text style={styles.heroTitle}>Ters Açık Artırma</Text>
            <Text style={styles.heroSubtitle}>
              İşletmeler İçin En Düşük Fiyat Platformu
            </Text>
            <Text style={styles.heroDescription}>
              Tedarik maliyetlerinizi düşürün, rekabetçi fiyatlar elde edin
            </Text>
            
            {/* Action Buttons */}
            <View style={styles.heroButtons}>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient}>
                  <Text style={styles.primaryButtonText}>Ücretsiz Başlayın</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          {/* Floating Elements */}
          <View style={styles.floatingElement1} />
          <View style={styles.floatingElement2} />
          <View style={styles.floatingElement3} />
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Neden Bizimle Çalışın?</Text>
          <Text style={styles.sectionSubtitle}>
            Modern teknoloji ile geleneksel ticaretin gücünü birleştiriyoruz
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.featuresContainer}
            contentContainerStyle={styles.featuresContent}
          >
            {renderFeatureCard(
              'flash', 
              'Gerçek Zamanlı', 
              'Anlık teklifler ve canlı güncellemeler',
              '#FF6B6B'
            )}
            {renderFeatureCard(
              'shield-check', 
              'Güvenli İşlemler', 
              'SSL şifrelemesi ve güvenli ödeme',
              '#4ECDC4'
            )}
            {renderFeatureCard(
              'chart-line', 
              'Rekabetçi Fiyat', 
              'En düşük fiyatları garantiliyoruz',
              '#45B7D1'
            )}
            {renderFeatureCard(
              'account-group', 
              'Geniş Ağ', 
              'Binlerce tedarikçi ve alıcı',
              '#96CEB4'
            )}
          </ScrollView>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>Nasıl Çalışır?</Text>
          <Text style={styles.sectionSubtitle}>
            3 basit adımda işinizi büyütmeye başlayın
          </Text>
          
          <View style={styles.stepsContainer}>
            {renderStepCard(
              '1',
              'Hızlı Kayıt',
              'Dakikalar içinde hesabınızı oluşturun ve onay alın',
              'account-plus'
            )}
            
            {renderStepCard(
              '2',
              'İhtiyaçlarınızı Belirtin',
              'Aradığınız ürün/hizmeti detaylandırın',
              'clipboard-search'
            )}
            
            {renderStepCard(
              '3',
              'En İyi Teklifi Alın',
              'Tedarikçiler yarışsın, siz kazanın',
              'trophy'
            )}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGradient}>
            <Text style={styles.statsTitle}>Platform İstatistikleri</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>10K+</Text>
                <Text style={styles.statLabel}>Aktif Kullanıcı</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>500+</Text>
                <Text style={styles.statLabel}>Tamamlanan İş</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>%35</Text>
                <Text style={styles.statLabel}>Ortalama Tasarruf</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Hemen Başlamaya Hazır mısınız?</Text>
          <Text style={styles.ctaSubtitle}>
            Binlerce firma tercih ediyor, siz de katılın!
          </Text>
          
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <View style={styles.ctaButtonGradient}>
              <IconButton icon="rocket-launch" size={24} iconColor="white" />
              <Text style={styles.ctaButtonText}>Ücretsiz Hesap Oluştur</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>
              Zaten hesabınız var mı? <Text style={styles.loginLinkBold}>Giriş Yapın</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Hero Section
  heroSection: {
    minHeight: height * 0.75,
    paddingTop: 60,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#667eea',
  },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  logoGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -10,
    left: -10,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  heroButtons: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '85%',
    marginBottom: 15,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Floating Elements
  floatingElement1: {
    position: 'absolute',
    top: 100,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 150,
    left: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  floatingElement3: {
    position: 'absolute',
    top: 200,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Features Section
  featuresSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9ff',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2D3748',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#718096',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  featuresContainer: {
    marginHorizontal: -20,
  },
  featuresContent: {
    paddingHorizontal: 20,
  },
  featureCard: {
    width: width * 0.7,
    padding: 25,
    marginHorizontal: 8,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureIcon: {
    margin: 0,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // How It Works Section
  howItWorksSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9ff',
  },
  stepsContainer: {
    marginTop: 20,
  },
  stepCard: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  stepNumberGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#667eea',
    elevation: 3,
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  stepIcon: {
    margin: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 5,
  },
  stepText: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  
  // Stats Section
  statsSection: {
    marginHorizontal: 20,
    marginVertical: 30,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  statsGradient: {
    padding: 30,
    backgroundColor: '#667eea',
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  // CTA Section
  ctaSection: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  ctaTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2D3748',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#718096',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  ctaButton: {
    width: '85%',
    marginBottom: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  ctaButtonGradient: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loginLink: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  loginLinkBold: {
    fontWeight: 'bold',
    color: '#667eea',
  },
});

export default WelcomeScreen; 