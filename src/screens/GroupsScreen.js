import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

const API_URL = 'https://4edu.su/api';

const GroupsScreen = ({ navigation }) => {
  const { userToken } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });

  const fetchGroups = async (page = 1, refresh = false) => {
    if (loading || (!pagination.hasMore && !refresh)) return;
    if (!userToken) {
      console.log('No auth token available');
      return;
    }

    try {
      setLoading(true);
      
      // Debug log
      console.log('Fetching groups with token:', userToken);
      console.log('Request URL:', `${API_URL}/groups/my-groups`);
      
      const response = await axios.get(`${API_URL}/groups/my-groups`, {
        params: {
          page,
          page_size: pagination.pageSize
        }
      });

      console.log('Response:', response.data);

      const { groups: newGroups, pagination: paginationData } = response.data;
      
      setGroups(prevGroups => 
        refresh ? newGroups : [...prevGroups, ...newGroups]
      );
      
      setPagination({
        page,
        pageSize: pagination.pageSize,
        hasMore: page < paginationData.pages
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      fetchGroups(pagination.page + 1);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
    fetchGroups(1, true);
  }, []);

  React.useEffect(() => {
    fetchGroups();
  }, []);

  const renderGroup = ({ item }) => (
    <TouchableOpacity 
      style={styles.groupCard}
      onPress={() => navigation.navigate('GroupDetails', { groupId: item.id })}
    >
      <View style={[styles.groupIcon, { backgroundColor: '#4B6BFB' }]}>
        <Ionicons name="people" size={24} color="#FFF" />
      </View>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDescription}>Academic Group: {item.academic_group_name}</Text>
        <View style={styles.groupMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={16} color="#71727A" />
            <Text style={styles.metaText}>Admin: {item.admin_username}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4B6BFB" />
      </View>
    );
  };

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
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No groups found</Text>
            </View>
          )
        }
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
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#71727A',
  },
});

export default GroupsScreen; 