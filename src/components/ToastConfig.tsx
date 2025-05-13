import React from 'react';
import Toast from 'react-native-toast-message';
import CustomToast from './Toast';

// Toast UI bileşenini kaydetmek için geçici bir çözüm
// Toast paketi ToastUI bileşenini bekliyor

// @ts-ignore
Toast.setToastConfig = () => {};

// @ts-ignore - ToastUI'ı geçici olarak ekle
Toast.ToastUI = CustomToast.ToastUI;

export const setupToast = () => {
  // Herhangi bir başlangıç kodu buraya gelebilir
};

export default {
  setupToast
}; 