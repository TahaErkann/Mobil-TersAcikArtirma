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
import { Text, Surface, IconButton, HelperText } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

// Props tipi tanımla
interface LoginScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

// Giriş ekranı
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const { login, error } = useAuth();
  
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

  // Giriş işlemi
  const handleLogin = async () => {
    // Boş alan kontrolü
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen email ve şifre bilgilerinizi girin');
      return;
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir email adresi girin');
      return;
    }

    // Yükleniyor durumunu aktif et
    setLoading(true);

    try {
      // Auth Context üzerinden giriş yap
      await login(email, password);
      console.log('Giriş işlemi tamamlandı');
    } catch (err) {
      console.error('Giriş hatası:', err);
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
    onBlur: () => void
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
      {secureTextEntry && (
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword(!showPassword)}
        >
          <IconButton 
            icon={showPassword ? 'eye-off' : 'eye'} 
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
            <Text style={styles.headerTitle}>Hoş Geldiniz!</Text>
            <Text style={styles.headerSubtitle}>
              Hesabınıza giriş yapın ve fırsatları keşfedin
            </Text>
          </Animated.View>
          
          {/* Floating Elements */}
          <View style={styles.floatingElement1} />
          <View style={styles.floatingElement2} />
        </View>

        {/* Form Section */}
        <Surface style={styles.formCard} elevation={5}>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Giriş Yap</Text>
            
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
              'Şifrenizi girin',
              'lock',
              'default',
              !showPassword,
              passwordFocused,
              () => setPasswordFocused(true),
              () => setPasswordFocused(false)
            )}

            {/* Error Message */}
            {error && (
              <Animated.View style={styles.errorContainer}>
                <IconButton icon="alert-circle" size={20} iconColor="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </Animated.View>
            )}

            {/* Login Button */}
            <TouchableOpacity 
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <ActivityIndicator color="white" size={24} />
                ) : (
                  <>
                    <IconButton icon="login" size={20} iconColor="white" style={styles.buttonIcon} />
                    <Text style={styles.loginButtonText}>Giriş Yap</Text>
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

            {/* Register Link */}
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerButtonText}>
                Hesabınız yok mu? <Text style={styles.registerButtonTextBold}>Kayıt Olun</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Demo Info */}
        <View style={styles.demoInfo}>
          <IconButton icon="information" size={16} iconColor="#6B7280" />
          <Text style={styles.demoText}>
            Demo: admin@example.com / 123456
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
    minHeight: height * 0.45,
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
    width: 100,
    height: 100,
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
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  headerTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
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
    top: 80,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 50,
    left: -20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
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
    marginBottom: 30,
  },
  
  // Input Fields
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    marginBottom: 20,
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
  
  // Login Button
  loginButton: {
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
  loginButtonDisabled: {
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
  loginButtonText: {
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
  
  // Register Button
  registerButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  registerButtonTextBold: {
    fontWeight: 'bold',
    color: '#667eea',
  },
  
  // Demo Info
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  demoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 5,
  },
});

export default LoginScreen; 