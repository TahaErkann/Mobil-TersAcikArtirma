import 'react-native-gesture-handler';
import { Platform, UIManager, Text, TextInput, ActivityIndicator } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// ----------------------------------------
// React Native Screens'i devre dışı bırak
// Bu, eski navigasyon mimarisini kullanmayı sağlar
// ----------------------------------------
import { enableScreens } from 'react-native-screens';
enableScreens(false);

// ------------------------
// React Native Yeni Mimari Düzeltmeleri
// ------------------------

// ActivityIndicator için boyut sabitleri
const SIZES = {
  small: 24,
  large: 36,
  default: 36
};

// ActivityIndicator bileşenini düzeltmek için orijinal render metodunu kaydedelim
const originalRender = ActivityIndicator.render;
if (originalRender) {
  ActivityIndicator.render = function (...args) {
    // props değerlerini kontrol et
    const props = args[0] || {};
    if (props.hasOwnProperty('size') && typeof props.size === 'string') {
      // String boyut değerini sayısal değere dönüştür
      props.size = SIZES[props.size] || SIZES.default;
    }
    return originalRender.apply(this, args);
  };
}

// String boyut değerlerini sayısal değerlere dönüştürmek için orijinal bileşeni monkeypatch
const originalSetNativeProps = ActivityIndicator.prototype.setNativeProps;
ActivityIndicator.prototype.setNativeProps = function(nativeProps) {
  if (nativeProps && nativeProps.hasOwnProperty('size') && typeof nativeProps.size === 'string') {
    nativeProps.size = SIZES[nativeProps.size] || SIZES.default;
  }
  return originalSetNativeProps ? originalSetNativeProps.call(this, nativeProps) : null;
};

// Global değerler
global.ACTIVITY_INDICATOR_SIZES = SIZES;

// Android için ek çözümler
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  
  // Android'de "large" ve "small" değerleri içeren bütün ActivityIndicator özelliklerini yakala
  if (UIManager.ActivityIndicator && UIManager.ActivityIndicator.NativeProps) {
    const originalSizeValidator = UIManager.ActivityIndicator.NativeProps.size;
    UIManager.ActivityIndicator.NativeProps.size = function(props, propName, componentName) {
      const value = props[propName];
      if (typeof value === 'string') {
        // String değeri sayısal değere dönüştür
        return SIZES[value] || SIZES.default;
      }
      return originalSizeValidator ? originalSizeValidator(props, propName, componentName) : null;
    };
  }
}

// Orijinal ActivityIndicator bileşenini özelleştir
const OriginalActivityIndicator = ActivityIndicator;
ActivityIndicator = function CustomActivityIndicator(props) {
  const newProps = { ...props };
  if (typeof newProps.size === 'string') {
    newProps.size = SIZES[newProps.size] || SIZES.default;
  }
  return OriginalActivityIndicator(newProps);
};
ActivityIndicator.displayName = 'ActivityIndicator';

// Hata mesajlarını filtrele
console.disableYellowBox = true;

// Register the app
registerRootComponent(App); 