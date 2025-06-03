import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GroupsScreen = ({ navigation }) => {
  // This would come from your backend
  const [groups, setGroups] = React.useState([]);

  React.useEffect(() => {
    // Fetch groups from backend
  }, []);

  const renderGroup = ({ item }) => (
    <TouchableOpacity style={styles.groupCard}>
      <View style={[styles.groupIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon || 'people'} size={24} color="#FFF" />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDescription}>{item.description}</Text>
        <View style={styles.groupMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={16} color="#71727A" />
            <Text style={styles.metaText}>{item.memberCount} members</Text>
          </View>
          {item.newMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.newMessages} new</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      
      <TouchableOpacity 
        style={styles.searchButton}
        onPress={() => navigation.navigate('GroupSearch')}
      >
        <Ionicons name="search" size={20} color="#71727A" />
        <Text style={styles.searchButtonText}>Search New Groups</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateGroup')}
      >
        <Ionicons name="add" size={20} color="#4B6BFB" />
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>My Groups</Text>
      
      <FlatList
        data={groups}
        renderItem={renderGroup}
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
    padding: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4B6BFB20',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4B6BFB',
    fontWeight: '500',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4B6BFB20',
  },
  createButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#4B6BFB',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1C1E',
  },
  listContainer: {
    paddingBottom: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 14,
    color: '#71727A',
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#71727A',
  },
  badge: {
    backgroundColor: '#4B6BFB20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#4B6BFB',
    fontWeight: '500',
  },
});

export default GroupsScreen; 