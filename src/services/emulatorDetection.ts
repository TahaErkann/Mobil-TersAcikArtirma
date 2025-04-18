import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cihazın emülatör olup olmadığını tespit eder
 * @returns Promise<boolean> Emülatör ise true, gerçek cihaz ise false döner
 */
export const detectEmulator = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const deviceModel = await AsyncStorage.getItem('deviceModel');
      
      // Yaygın emülatör modeli kontrolleri
      const emulatorModels = [
        'google_sdk', 
        'Emulator', 
        'Android SDK built for',
        'sdk_phone',
        'sdk_gphone'
      ];
      
      if (!deviceModel) {
        return false;
      }
      
      return emulatorModels.some(model => deviceModel.includes(model));
    } catch (error) {
      console.log('Emülatör tespiti yapılamadı:', error);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const deviceId = await AsyncStorage.getItem('deviceId');
      
      // iOS Simulator kontrolü - Simulator genellikle başlangıç değerlerini kullanır
      if (deviceId === 'simulator' || deviceId?.includes('simulator')) {
        return true;
      }
      
      // Test cihazları için kontrol
      if (
        deviceId === '00008030-001C2D903C40802E' || // iPhone Simulator
        deviceId === '00008020-001C2D903C40802E'     // iPad Simulator
      ) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Emülatör tespiti yapılamadı:', error);
      return false;
    }
  }
  
  return false;
}; 