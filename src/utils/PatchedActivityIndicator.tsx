import React from 'react';
import { ActivityIndicator as RNActivityIndicator, ActivityIndicatorProps } from 'react-native';

// Boyut için düzeltilmiş tür
type PatchedSize = number | 'small' | 'large' | undefined;

// ActivityIndicator için düzeltilmiş props
interface PatchedActivityIndicatorProps extends Omit<ActivityIndicatorProps, 'size'> {
  size?: PatchedSize;
}

/**
 * ActivityIndicator'ı saran ve string boyut değerlerini sayısal değerlere çeviren bileşen
 * 
 * Expo Go'nun yeni mimarisi, string değerleri kabul etmiyor ve uygulama çöküyor.
 * Bu bileşen "large" değerini 52, "small" değerini 24 olarak otomatik çeviriyor.
 */
const PatchedActivityIndicator: React.FC<PatchedActivityIndicatorProps> = ({ size, ...props }) => {
  // String değerleri sayısal değerlere çevir
  let numericSize: number | undefined;
  
  if (size === 'large') {
    numericSize = 52;
  } else if (size === 'small') {
    numericSize = 24;
  } else {
    numericSize = size as number | undefined;
  }
  
  return <RNActivityIndicator size={numericSize} {...props} />;
};

export default PatchedActivityIndicator; 