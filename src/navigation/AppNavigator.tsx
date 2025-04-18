import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { View, Text, ActivityIndicator } from 'react-native';

// Ekranlar
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ListingDetailScreen from '../screens/ListingDetailScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

// Admin Ekranları
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminListingsScreen from '../screens/AdminListingsScreen';
import AdminCategoriesScreen from '../screens/AdminCategoriesScreen';

// Tip tanımlamaları
type MainStackParamList = {
  Main: undefined;
  ListingDetail: { id: string };
};

type AdminStackParamList = {
  AdminTabs: undefined;
  ListingDetail: { id: string };
};

type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const AdminStackNav = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator();

// Yükleme ekranı
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
    <ActivityIndicator size={52} color="#4F46E5" />
    <Text style={{ marginTop: 10 }}>Yükleniyor...</Text>
  </View>
);

// Ana Tab Navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Ana Sayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Kategoriler') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Ana Sayfa"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Kategoriler"
        component={CategoriesScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profil"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

// Admin ekranlarının navigasyonu için yardımcı işlevler
const getAdminScreenName = (screenName: string): string => {
  switch (screenName) {
    case 'Gösterge Paneli':
      return 'Gösterge Paneli';
    case 'Kullanıcılar':
      return 'Kullanıcılar';
    case 'İlanlar':
      return 'İlanlar';
    case 'Kategoriler':
      return 'Kategoriler';
    default:
      return screenName;
  }
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Gösterge Paneli') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Kullanıcılar') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'İlanlar') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Kategoriler') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: 'gray',
        headerStyle: {
          backgroundColor: '#4F46E5',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      })}
    >
      <Tab.Screen
        name="Gösterge Paneli"
        component={AdminDashboardScreen}
        options={{ 
          headerShown: true,
          title: 'Admin Panel',
        }}
      />
      <Tab.Screen
        name="Kullanıcılar"
        component={AdminUsersScreen}
        options={{ 
          headerShown: true,
          title: 'Kullanıcı Yönetimi',
        }}
      />
      <Tab.Screen
        name="İlanlar"
        component={AdminListingsScreen}
        options={{ 
          headerShown: true,
          title: 'İlan Yönetimi',
        }}
      />
      <Tab.Screen
        name="Kategoriler"
        component={AdminCategoriesScreen}
        options={{ 
          headerShown: true,
          title: 'Kategori Yönetimi',
        }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack - Giriş ve Kayıt
const AuthStack = () => (
  <AuthStackNav.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4F46E5',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: { backgroundColor: '#ffffff' },
      freezeOnBlur: true
    }}
  >
    <AuthStackNav.Screen
      name="Welcome"
      component={WelcomeScreen}
      options={{ 
        title: 'Ters Açık Artırma',
        headerShown: false
      }}
    />
    
    <AuthStackNav.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Giriş Yap', headerShown: false }}
    />
    
    <AuthStackNav.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'Kayıt Ol', headerShown: false }}
    />
  </AuthStackNav.Navigator>
);

// Main Stack - Normal Kullanıcılar İçin
const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4F46E5',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: { backgroundColor: '#ffffff' },
      freezeOnBlur: true
    }}
  >
    <Stack.Screen
      name="Main"
      component={MainTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="ListingDetail"
      component={ListingDetailScreen}
      options={{ title: 'İlan Detayı' }}
    />
  </Stack.Navigator>
);

// Admin Stack - Admin Kullanıcılar İçin
const AdminNavigator = () => (
  <AdminStackNav.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#4F46E5',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: { backgroundColor: '#ffffff' },
      freezeOnBlur: true
    }}
  >
    <AdminStackNav.Screen
      name="AdminTabs"
      component={AdminTabNavigator}
      options={{ headerShown: false }}
    />
    <AdminStackNav.Screen
      name="ListingDetail"
      component={ListingDetailScreen}
      options={{ title: 'İlan Detayı' }}
    />
  </AdminStackNav.Navigator>
);

// Ana Navigasyon
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthStack />
      ) : user.isAdmin ? (
        <AdminNavigator />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator; 