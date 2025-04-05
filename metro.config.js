const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// react-native-screens sorununu çözmek için özel ayarlar
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs'],
  blockList: [
    /.*\/__tests__\/.*/,
  ],
};

// İlk çalıştırma için önbellek temizliği
config.resetCache = true;

// Performans optimizasyonu
config.maxWorkers = 4;
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config; 