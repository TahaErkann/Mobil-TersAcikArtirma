import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { theme } from './theme';

// Toast bileşeni için tip tanımları
interface ToastProps {
  text1?: string;
  text2?: string;
  type?: 'success' | 'error' | 'info';
  position?: 'top' | 'bottom';
  visibilityTime?: number;
  autoHide?: boolean;
  topOffset?: number;
  bottomOffset?: number;
  onShow?: () => void;
  onHide?: () => void;
  onPress?: () => void;
}

// BaseToast bileşeni
export const BaseToast: React.FC<ToastProps> = ({
  text1,
  text2,
  type = 'info',
  style,
  contentContainerStyle,
  text1Style,
  text2Style,
  ...rest
}) => {
  // Tipi göre arkaplan ve kenar rengi belirleme
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return '#ECFDF5';
      case 'error':
        return '#FEF2F2';
      case 'info':
      default:
        return '#EFF6FF';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'info':
      default:
        return theme.colors.info;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBgColor(),
          borderLeftColor: getBorderColor(),
        },
        style,
      ]}
      {...rest}
    >
      <View style={[styles.contentContainer, contentContainerStyle]}>
        {text1 ? (
          <Text style={[styles.text1, text1Style]}>{text1}</Text>
        ) : null}
        {text2 ? (
          <Text style={[styles.text2, text2Style]}>{text2}</Text>
        ) : null}
      </View>
    </View>
  );
};

// Toast UI bileşeni - react-native-toast-message için UI sağlar
export const ToastUI = ({ toast, onHide }: any) => {
  return (
    <BaseToast
      text1={toast?.text1}
      text2={toast?.text2}
      type={toast?.type}
      style={{
        borderLeftColor: 
          toast?.type === 'success' 
            ? theme.colors.success
            : toast?.type === 'error'
              ? theme.colors.error
              : theme.colors.info,
        backgroundColor: 
          toast?.type === 'success' 
            ? '#ECFDF5'
            : toast?.type === 'error'
              ? '#FEF2F2'
              : '#EFF6FF',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text
      }}
      text2Style={{
        fontSize: 14,
        color: theme.colors.textSecondary
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    borderRadius: 8,
    borderLeftWidth: 4,
    padding: 12,
    minHeight: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
    marginHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  text2: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default { BaseToast, ToastUI }; 