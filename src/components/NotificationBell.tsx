import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Badge } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import { useNotification } from '../hooks/useNotification';

const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotification();
  const navigation = useNavigation();

  const handlePress = () => {
    // @ts-ignore - Tip özellikle belirtilmemiş
    navigation.navigate('Notifications');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <AntDesign name="bells" size={24} color="#333" />
      {unreadCount > 0 && (
        <Badge
          style={styles.badge}
          size={16}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: 10,
    padding: 5,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default NotificationBell; 