import React from 'react';
import { LogBox, StatusBar } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { SocketProvider } from './src/context/SocketContext';
import AppNavigator from './src/navigation/AppNavigator';

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

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AuthProvider>
          <SocketProvider>
            <AppNavigator />
          </SocketProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 