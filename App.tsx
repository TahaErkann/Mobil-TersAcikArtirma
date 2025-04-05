import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox, View, Text, StyleSheet, Button, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuth } from './src/hooks/useAuth';
import api from './src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './src/types';

// TypeScript için global değişkenlerini tanımla
declare global {
  var ACTIVITY_INDICATOR_SIZES: {
    small: number;
    large: number;
    default: number;
  };
}

// TypeScript interfaceleri
interface LoginFormProps {
  onLogin: (name?: string, email?: string) => void;
  onRegister: () => void;
  checkDemoUser: (email: string, password: string) => boolean;
  demoUsers: Array<{name: string, email: string, password: string}>;
}

interface RegisterFormProps {
  onLogin: () => void;
  addDemoUser: (name: string, email: string, password: string) => void;
  demoUsers: Array<{name: string, email: string, password: string}>;
}

interface HomeContentProps {
  onLogout: () => void;
  userData?: {name: string, email: string} | null;
}

// Yeni mimari uyarıları için LogBox konfigürasyonu
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Sending \`onAnimatedValueUpdate',
  '`getDefaultEventTypes` is not available',
  'Exception in HostFunction: Unable to convert string'
]);

// Basit bir giriş ekranı
const LoginForm = ({ onLogin, onRegister, checkDemoUser, demoUsers }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = async () => {
    // Form doğrulama
    if (!email || !password) {
      setError('Email ve şifre alanları boş olamaz');
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('Giriş yapılıyor...', { email });
    
    try {
      /* Demo mod - gerçek API yokken simülasyon için
      console.log('Demo modunda giriş simülasyonu yapılıyor');
      
      // 2 saniye simülasyon beklemesi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const isValidUser = checkDemoUser(email, password);
      if (isValidUser) {
        const user = demoUsers.find(user => user.email === email);
        console.log('Demo giriş başarılı');
        if (user) {
          onLogin(user.name, user.email);
        } else {
          onLogin();
        }
      } else {
        throw new Error('Geçersiz email veya şifre');
      }
      */
      
      // Gerçek API bağlantısı
      console.log('API isteği başlatılıyor: /api/auth/login');
      
      // API bağlantısı - axios ile
      const response = await api.post('/auth/login', { email, password });
      console.log('API yanıtı alındı:', { status: response.status });
      
      const { token, user } = response.data;
      console.log('API yanıt verileri:', response.data);
      
      // Token ve kullanıcı bilgisini sakla
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Başarılı giriş
      console.log('Giriş başarılı, yönlendiriliyor...');
      onLogin(user.name, user.email);
    } catch (err: any) {
      console.error('Hata:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
    } finally {
      console.log('İşlem tamamlandı, loading durumu sıfırlanıyor');
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Giriş Yap</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      <TextInput 
        style={styles.input}
        placeholder="Email adresiniz"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input}
        placeholder="Şifreniz"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      {loading ? (
        <ActivityIndicator size={36} color="#4F46E5" style={styles.indicator} />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={onRegister}
          >
            <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// Basit bir kayıt ekranı
const RegisterForm = ({ onLogin, addDemoUser, demoUsers }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleRegister = async () => {
    // Form doğrulama
    if (!name || !email || !password || !confirmPassword) {
      setError('Tüm alanları doldurmanız gerekiyor');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    setError('');
    
    console.log('Kayıt işlemi başlatılıyor...', { name, email });
    
    try {
      /* Demo mod - gerçek API yokken simülasyon için
      console.log('Demo modunda kayıt simülasyonu yapılıyor');
      
      // 2 saniye simülasyon beklemesi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Email kontrolü
      const emailExists = demoUsers.some(user => user.email === email);
      if (emailExists) {
        throw new Error('Bu email adresi zaten kullanılıyor');
      }
      
      // Yeni kullanıcı ekleniyor
      addDemoUser(name, email, password);
      
      console.log('Demo kayıt başarılı');
      onLogin();
      */
      
      // Gerçek API bağlantısı
      console.log('API isteği başlatılıyor: /api/auth/register');
      
      // API bağlantısı - axios ile
      const response = await api.post('/auth/register', { name, email, password });
      console.log('API yanıtı alındı:', { status: response.status });
      
      const { token, user } = response.data;
      console.log('API yanıt verileri:', response.data);
      
      // Token ve kullanıcı bilgisini sakla
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      
      // Başarılı kayıt
      console.log('Kayıt başarılı, giriş ekranına yönlendiriliyor...');
      onLogin();
    } catch (err: any) {
      console.error('Hata:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Kayıt olurken bir hata oluştu';
      setError(errorMessage);
    } finally {
      console.log('İşlem tamamlandı, loading durumu sıfırlanıyor');
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Kayıt Ol</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      
      <TextInput 
        style={styles.input}
        placeholder="Ad Soyad"
        value={name}
        onChangeText={setName}
      />
      
      <TextInput 
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput 
        style={styles.input}
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput 
        style={styles.input}
        placeholder="Şifre Tekrar"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      {loading ? (
        <ActivityIndicator size={36} color="#4F46E5" style={styles.indicator} />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]} 
            onPress={onLogin}
          >
            <Text style={styles.secondaryButtonText}>Giriş Ekranı</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// Ana sayfa içeriği
const HomeContent = ({ onLogout, userData = null }: HomeContentProps) => {
  const [loading, setLoading] = useState(userData ? false : true);
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(userData);
  
  // Kullanıcı bilgilerini al
  useEffect(() => {
    if (userData) {
      setUserInfo(userData);
      setLoading(false);
      return;
    }
    
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log('Profil bilgileri alınıyor...');
        
        // Gerçek API'den kullanıcı bilgilerini çek
        const response = await api.get('/auth/me');
        const user = response.data;
        console.log('Kullanıcı bilgileri alındı:', user);
        
        setUserInfo({
          name: user.name,
          email: user.email
        });
        setLoading(false);
        
        /* Simülasyon kodları
        setTimeout(() => {
          setUserInfo({
            name: 'Demo Kullanıcı',
            email: 'demo@example.com'
          });
          setLoading(false);
        }, 1000);
        */
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Bir hata oluştu';
        setError(errorMessage);
        console.error('Profil bilgileri alınamadı:', err);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userData]);
  
  if (loading) {
    return (
      <View style={styles.homeContainer}>
        <ActivityIndicator size={36} color="#4F46E5" />
        <Text style={[styles.infoText, { marginTop: 10 }]}>Yükleniyor...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.homeContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.button, { marginTop: 20 }]} 
          onPress={onLogout}
        >
          <Text style={styles.buttonText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.homeContainer}>
      <Text style={styles.formTitle}>Hoş Geldiniz</Text>
      
      {userInfo && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoLabel}>Ad Soyad:</Text>
          <Text style={styles.userInfoValue}>{userInfo.name}</Text>
          
          <Text style={styles.userInfoLabel}>Email:</Text>
          <Text style={styles.userInfoValue}>{userInfo.email}</Text>
        </View>
      )}
      
      <Text style={styles.infoText}>Başarıyla giriş yaptınız!</Text>
      
      <TouchableOpacity 
        style={[styles.button, { marginTop: 20 }]} 
        onPress={onLogout}
      >
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

// Diğer interface'leri burada bırakın, sadece TempStartScreen'i güncelliyoruz
interface TempStartScreenProps {
  demoUsers: Array<{name: string, email: string, password: string}>;
  addDemoUser: (name: string, email: string, password: string) => void;
  checkDemoUser: (email: string, password: string) => boolean;
}

// Başlangıç ekranı (Navigation kullanmadan)
const TempStartScreen = ({ demoUsers, addDemoUser, checkDemoUser }: TempStartScreenProps) => {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, email: string} | null>(null);
  
  const handleLogin = (name = '', email = '') => {
    setIsLoggedIn(true);
    if (name && email) {
      setCurrentUser({ name, email });
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('login');
    setCurrentUser(null);
    
    // Çıkış yapıldığında AsyncStorage'dan token ve kullanıcı bilgilerini temizle
    AsyncStorage.removeItem(STORAGE_KEYS.TOKEN)
      .then(() => console.log('Token temizlendi'))
      .catch(err => console.error('Token temizlenirken hata:', err));
    
    AsyncStorage.removeItem(STORAGE_KEYS.USER)
      .then(() => console.log('Kullanıcı bilgileri temizlendi'))
      .catch(err => console.error('Kullanıcı bilgileri temizlenirken hata:', err));
  };
  
  const switchToLogin = () => {
    setCurrentScreen('login');
  };
  
  const switchToRegister = () => {
    setCurrentScreen('register');
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={styles.title}>Ters Açık Artırma</Text>
          <Text style={styles.subtitle}>Mobil Uygulama</Text>
          
          {isLoggedIn ? (
            <HomeContent 
              onLogout={handleLogout} 
              userData={currentUser}
            />
          ) : (
            <>
              {currentScreen === 'login' ? (
                <LoginForm 
                  onLogin={handleLogin} 
                  onRegister={switchToRegister}
                  checkDemoUser={checkDemoUser}
                  demoUsers={demoUsers}
                />
              ) : (
                <RegisterForm 
                  onLogin={switchToLogin}
                  addDemoUser={addDemoUser}
                  demoUsers={demoUsers}
                />
              )}
            </>
          )}
          
          <Text style={styles.helpText}>
            {isLoggedIn ? 
              'Web uygulamasında oluşturduğunuz hesapla giriş yapabilirsiniz.' :
              'Web ve mobil uygulamada aynı hesapla oturum açabilirsiniz.'
            }
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Ana uygulama
const App = () => {
  // Uygulamada Navigation kullanıp kullanmayacağımızı belirleyen flag
  const [useNavigation, setUseNavigation] = useState(false);
  
  // Demo kullanıcılarını tutan state
  const [demoUsers, setDemoUsers] = useState([
    { name: 'Test Kullanıcı', email: 'test@test.com', password: '123456' }
  ]);
  
  // Yeni kullanıcı eklemek için fonksiyon
  const addDemoUser = (name: string, email: string, password: string) => {
    setDemoUsers(prevUsers => [...prevUsers, { name, email, password }]);
  };
  
  // Kullanıcı kontrol fonksiyonu
  const checkDemoUser = (email: string, password: string) => {
    return demoUsers.some(user => user.email === email && user.password === password);
  };
  
  // Uygulama açıldığında çalışacak kodlar
  useEffect(() => {
    // Global değişkenlerin tanımlanması - Yeni mimari için
    global.ACTIVITY_INDICATOR_SIZES = {
      small: 24,
      large: 36,
      default: 36
    };
  }, []);

  // Navigation sorunları nedeniyle, doğrudan tek bir ekran göster
  if (!useNavigation) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
        <TempStartScreen 
          demoUsers={demoUsers} 
          addDemoUser={addDemoUser} 
          checkDemoUser={checkDemoUser} 
        />
      </View>
    );
  }

  // Normal navigasyon ile (şu an devre dışı)
  return (
    <AuthProvider>
      <SocketProvider>
        <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
        <AppNavigator />
      </SocketProvider>
    </AuthProvider>
  );
};

// Stiller
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 30
  },
  formContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center'
  },
  homeContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 10,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4F46E5'
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold'
  },
  indicator: {
    marginVertical: 20,
    alignSelf: 'center'
  },
  helpText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fef2f2',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    width: '100%'
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14
  },
  input: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#374151'
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  userInfoContainer: {
    marginBottom: 20,
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 15
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5
  },
  userInfoValue: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 15
  }
});

export default App; 