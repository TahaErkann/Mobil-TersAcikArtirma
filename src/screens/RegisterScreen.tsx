import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Alert,
  Animated,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Text, Surface, IconButton, Checkbox } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// Props tipi tanımla
interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// Kayıt ekranı
const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const { register, error, clearError } = useAuth();
  
  // Animasyon referansları
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Sayfa yükleme animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Kayıt işlemi
  const handleRegister = async () => {
    // Boş alan kontrolü
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir email adresi girin');
      return;
    }

    // İsim kontrolü
    if (name.length < 2) {
      Alert.alert('Hata', 'Ad Soyad en az 2 karakter olmalıdır');
      return;
    }

    // Şifre kontrolü
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }

    // Koşullar kontrolü
    if (!agreeTerms) {
      Alert.alert('Hata', 'Lütfen kullanım koşullarını kabul edin');
      return;
    }

    // Yükleniyor durumunu aktif et ve önceki hataları temizle
    setLoading(true);
    clearError();

    try {
      // Auth Context üzerinden kayıt ol
      const result = await register(name, email, password);
      
      if (result.success) {
        // Kayıt başarılı
        console.log('Kayıt başarılı');
      Alert.alert(
        'Başarılı', 
          'Kayıt işlemi başarılı! Hoş geldiniz.',
          [{ text: 'Tamam' }]
        );
      } else {
        // Kayıt başarısız
        const errorMessage = result.error || 'Kayıt sırasında bir sorun oluştu';
        Alert.alert('Hata', errorMessage);
      }
    } catch (err) {
      console.error('Kayıt hatası:', err);
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderInputField = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: string,
    keyboardType: any = 'default',
    secureTextEntry: boolean = false,
    focused: boolean,
    onFocus: () => void,
    onBlur: () => void,
    showPasswordToggle: boolean = false,
    passwordVisible: boolean = false,
    onTogglePassword?: () => void
  ) => (
    <Animated.View style={[
      styles.inputContainer,
      focused && styles.inputContainerFocused,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
    ]}>
      <IconButton 
        icon={icon} 
        size={20} 
        iconColor={focused ? '#667eea' : '#9CA3AF'}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {showPasswordToggle && (
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={onTogglePassword}
        >
          <IconButton 
            icon={passwordVisible ? 'eye-off' : 'eye'} 
            size={20} 
            iconColor="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
            activeOpacity={0.7}
        >
            <IconButton 
              icon="arrow-left" 
              size={24} 
              iconColor="white"
              style={styles.backIcon}
            />
        </TouchableOpacity>
          
          <Animated.View style={[
            styles.logoContainer,
            { 
              opacity: fadeAnim,
              transform: [{ scale: logoScaleAnim }]
            }
          ]}>
            <View style={styles.logoBackground}>
        <Image 
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
          </Animated.View>
          
          <Animated.View style={[
            styles.headerTextContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            <Text style={styles.headerTitle}>Aramıza Katılın!</Text>
            <Text style={styles.headerSubtitle}>
              Yeni hesabınızı oluşturun ve avantajları keşfedin
            </Text>
          </Animated.View>
          
          {/* Floating Elements */}
          <View style={styles.floatingElement1} />
          <View style={styles.floatingElement2} />
          <View style={styles.floatingElement3} />
        </View>

        {/* Form Section */}
        <Surface style={styles.formCard} elevation={5}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Kayıt Ol</Text>
            
            {/* Name Input */}
            {renderInputField(
              name,
              setName,
              'Ad ve Soyadınız',
              'account',
              'default',
              false,
              nameFocused,
              () => setNameFocused(true),
              () => setNameFocused(false)
            )}

            {/* Email Input */}
            {renderInputField(
              email,
              setEmail,
              'Email adresinizi girin',
              'email',
              'email-address',
              false,
              emailFocused,
              () => setEmailFocused(true),
              () => setEmailFocused(false)
            )}

            {/* Password Input */}
            {renderInputField(
              password,
              setPassword,
              'Şifrenizi oluşturun (min. 6 karakter)',
              'lock',
              'default',
              !showPassword,
              passwordFocused,
              () => setPasswordFocused(true),
              () => setPasswordFocused(false),
              true,
              showPassword,
              () => setShowPassword(!showPassword)
            )}

            {/* Confirm Password Input */}
            {renderInputField(
              confirmPassword,
              setConfirmPassword,
              'Şifrenizi tekrar girin',
              'lock-check',
              'default',
              !showConfirmPassword,
              confirmPasswordFocused,
              () => setConfirmPasswordFocused(true),
              () => setConfirmPasswordFocused(false),
              true,
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword)
            )}

            {/* Terms and Conditions */}
            <Animated.View style={[
              styles.termsContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}>
              <Checkbox
                status={agreeTerms ? 'checked' : 'unchecked'}
                onPress={() => setAgreeTerms(!agreeTerms)}
                color="#667eea"
              />
              <Text style={styles.termsText}>
                <Text style={styles.termsLink}>Kullanım Koşulları</Text> ve{' '}
                <Text style={styles.termsLink}>Gizlilik Politikası</Text>'nı kabul ediyorum
              </Text>
            </Animated.View>

            {/* Error Message */}
            {error && (
              <Animated.View style={styles.errorContainer}>
                <IconButton icon="alert-circle" size={20} iconColor="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Register Button */}
        <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
              activeOpacity={0.8}
        >
              <View style={styles.buttonContent}>
          {loading ? (
            <ActivityIndicator color="white" size={24} />
          ) : (
                  <>
                    <IconButton icon="account-plus" size={20} iconColor="white" style={styles.buttonIcon} />
                    <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
                  </>
          )}
              </View>
        </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.divider} />
            </View>

            {/* Login Link */}
        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>
            Zaten hesabınız var mı? <Text style={styles.loginLinkTextBold}>Giriş Yapın</Text>
          </Text>
        </TouchableOpacity>
      </View>
        </Surface>

        {/* Security Info */}
        <View style={styles.securityInfo}>
          <IconButton icon="shield-check" size={16} iconColor="rgba(255, 255, 255, 0.8)" />
          <Text style={styles.securityText}>
            Bilgileriniz SSL ile şifrelenmiştir
        </Text>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  
  // Header Section
  headerSection: {
    minHeight: height * 0.4,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  backIcon: {
    margin: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  logoBackground: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Floating Elements
  floatingElement1: {
    position: 'absolute',
    top: 70,
    right: -30,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  floatingElement3: {
    position: 'absolute',
    top: 150,
    left: 10,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  // Form Section
  formCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 25,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  formContent: {
    padding: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 25,
  },
  
  // Input Fields
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputContainerFocused: {
    borderColor: '#667eea',
    backgroundColor: '#F0F4FF',
  },
  inputIcon: {
    margin: 0,
    marginLeft: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordToggle: {
    padding: 5,
  },
  
  // Terms and Conditions
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    lineHeight: 20,
  },
  termsLink: {
    color: '#667eea',
    fontWeight: '600',
  },
  
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  
  // Register Button
  registerButton: {
    backgroundColor: '#667eea',
    borderRadius: 15,
    paddingVertical: 16,
    marginBottom: 25,
    elevation: 3,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    margin: 0,
    marginRight: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#6B7280',
    fontSize: 14,
  },
  
  // Login Link
  loginLink: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLinkTextBold: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  
  // Security Info
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
});

export default RegisterScreen; 