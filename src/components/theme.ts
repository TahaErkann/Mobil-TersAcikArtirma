import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4F46E5',
    primaryLight: '#818CF8',
    primaryDark: '#3730A3',
    secondary: '#F43F5E',
    secondaryLight: '#FB7185',
    secondaryDark: '#BE123C',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    error: '#EF4444',
    text: '#111827',
    textSecondary: '#4B5563',
    warning: '#F59E0B',
    info: '#3B82F6',
    success: '#10B981',
    disabled: '#9CA3AF',
    placeholder: '#6B7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#EF4444',
  },
  roundness: 8,
};

export default theme; 