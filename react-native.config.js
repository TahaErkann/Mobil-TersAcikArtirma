module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: [
    './assets/fonts/',
  ],
  dependencies: {
    'react-native-screens': {
      platforms: {
        android: null, // Otomatik bağlama devre dışı
        ios: null, // Otomatik bağlama devre dışı
      },
    },
  },
  // ActivityIndicator için değişiklik - varsayılan değerleri sayısal olarak tanımla
  customConstants: {
    UIActivityIndicator: {
      'large': 48,
      'small': 24
    }
  },
}; 