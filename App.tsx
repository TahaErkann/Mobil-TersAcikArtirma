import React, { useEffect } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import CustomToast from './src/components/Toast';
import { theme } from './src/components/theme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// TypeScript için global değişken tanımı
declare global {
  var ACTIVITY_INDICATOR_SIZES: {
    small: number;
    large: number;
  };
}

// ActivityIndicator için global sabitler
global.ACTIVITY_INDICATOR_SIZES = {
  small: 24,
  large: 52
};

// Debug modunda bazı uyarıları devre dışı bırak
LogBox.ignoreLogs([
  'socket.io-client',
  'AsyncStorage has been extracted',
  'Unsupported top level event type "topInsetsChange" dispatched',
  'EventEmitter.removeListener',
  'Non-serializable values were found in the navigation state'
]);

// Toast UI bileşenini kaydetmek için geçici bir çözüm
// @ts-ignore
Toast.setToastConfig = () => {};
// @ts-ignore - ToastUI'ı geçici olarak ekle
Toast.ToastUI = CustomToast.ToastUI;

// Toast konfigürasyonu
const toastConfig = {
  success: ({ text1, text2, ...rest }: any) => (
    <CustomToast.BaseToast
      {...rest}
      text1={text1}
      text2={text2}
      type="success"
    />
  ),
  error: ({ text1, text2, ...rest }: any) => (
    <CustomToast.BaseToast
      {...rest}
      text1={text1}
      text2={text2}
      type="error"
    />
  ),
  info: ({ text1, text2, ...rest }: any) => (
    <CustomToast.BaseToast
      {...rest}
      text1={text1}
      text2={text2}
      type="info"
    />
  ),
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <AuthProvider>
            <SocketProvider>
              <AppNavigator />
              <Toast config={toastConfig} />
            </SocketProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
} 