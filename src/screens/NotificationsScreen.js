import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = () => {
  // This would come from your backend
  const [notifications, setNotifications] = React.useState([]);

  React.useEffect(() => {
    // Fetch notifications from backend
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_material':
        return { name: 'document-text', color: '#4B6BFB', bg: '#4B6BFB20' };
      case 'assignment_complete':
        return { name: 'checkmark-circle', color: '#34C759', bg: '#34C75920' };
      case 'reminder':
        return { name: 'calendar', color: '#9747FF', bg: '#9747FF20' };
      case 'reply':
        return { name: 'chatbubble', color: '#FF9500', bg: '#FF950020' };
      case 'deadline':
        return { name: 'alert-circle', color: '#FF3B30', bg: '#FF3B3020' };
      default:
        return { name: 'notifications', color: '#71727A', bg: '#71727A20' };
    }
  };

  const renderNotification = ({ item }) => {
    const icon = getNotificationIcon(item.type);
    
    return (
      <TouchableOpacity style={styles.notificationCard}>
        <View style={[styles.iconContainer, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.groupName}>{item.groupName}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
          {item.actionLabel && (
            <Text style={[styles.actionLabel, { color: icon.color }]}>
              {item.actionLabel}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  time: {
    fontSize: 12,
    color: '#71727A',
  },
  message: {
    fontSize: 14,
    color: '#48484A',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationsScreen; 