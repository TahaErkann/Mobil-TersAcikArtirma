/**
 * Özel ActivityIndicator bileşeni
 * React Native'in yeni mimarisi için uyarlanmıştır
 */

import React from 'react';
import { ActivityIndicator as RNActivityIndicator } from 'react-native';

// Sabit boyut değerleri
const SIZES = {
  small: 24,
  large: 36,
  default: 36
};

/**
 * ActivityIndicator'ın yeni mimari uyumlu sürümü
 * String değerler yerine numerik değerler kullanır
 */
export default function ActivityIndicator({ size, ...props }) {
  // Size değerini normalize et
  let numericSize;
  
  if (typeof size === 'string') {
    // String değeri sayısal değere dönüştür
    numericSize = SIZES[size] || SIZES.default;
  } else if (typeof size === 'number') {
    // Sayısal değeri doğrudan kullan
    numericSize = size;
  } else {
    // Değer belirtilmemişse varsayılan kullan
    numericSize = SIZES.default;
  }
  
  return <RNActivityIndicator size={numericSize} {...props} />;
} 