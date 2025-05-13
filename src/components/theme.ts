import { DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Varsayılan gölge stilleri
export const shadowProps = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  android: {
    elevation: 4,
  },
});

// Güçlü gölge stilleri
export const strongShadowProps = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  android: {
    elevation: 8,
  },
});

// Animasyon konfigürasyonları
export const animations = {
  button: {
    scale: {
      from: 1,
      to: 0.98,
      duration: 100,
    },
    feedback: {
      duration: 100,
    },
    press: {
      duration: 150,
    },
  },
  card: {
    duration: 250,
    easing: 'easeOutCubic',
  },
  list: {
    staggerDelay: 50,
    delay: 150,
    duration: 300,
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#F43F5E',
    secondaryLight: '#FB7185',
    secondaryDark: '#BE123C',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    error: '#EF4444',
    text: '#111827',
    textSecondary: '#4B5563',
    textTertiary: '#6B7280',
    warning: '#F59E0B',
    info: '#3B82F6',
    success: '#10B981',
    disabled: '#9CA3AF',
    placeholder: '#6B7280',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#EF4444',
    border: '#E5E7EB',
    surfaceVariant: '#F3F4F6',
    neutral: '#6B7280',
    card: '#FFFFFF',
    onSurface: '#111827',
  },
  roundness: 12,
  animation: {
    scale: 0.3,
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400'
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500'
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300'
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100'
    },
  },
};

// Component stillerinin global varsayılanları
export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  card: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: theme.colors.surface,
    ...shadowProps,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  input: {
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.border,
    height: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginVertical: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  listItem: {
    borderRadius: 12,
    marginVertical: 4,
    marginHorizontal: 16,
    padding: 16,
  },
  avatar: {
    backgroundColor: theme.colors.primaryLight,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 32,
  },
};

export default theme; 