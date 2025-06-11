import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 10;

const GroupSearchScreen = ({ navigation }) => {
  const { api } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: PAGE_SIZE,
    hasMore: true
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [joinMessage, setJoinMessage] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchGroups = async (page = 1, search = '', refresh = false) => {
    if (isLoading || (!pagination.hasMore && !refresh)) return;

    try {
      setIsLoading(true);
      const params = {
        page,
        page_size: PAGE_SIZE,
      };
      if (search) {
        params.search = search;
      }

      const response = await api.get('/api/groups/available', { params });
      
      if (!response.data) {
        setGroups([]);
        setPagination(prev => ({
          ...prev,
          hasMore: false
        }));
        return;
      }

      const { groups: newGroups, pagination: paginationData } = response.data;

      if (refresh || page === 1) {
        // For refresh or first page, replace all groups
        setGroups(newGroups || []);
      } else {
        // For pagination, append new groups while avoiding duplicates
        setGroups(prevGroups => {
          const existingIds = new Set(prevGroups.map(g => g.id));
          const uniqueNewGroups = (newGroups || []).filter(g => !existingIds.has(g.id));
          return [...prevGroups, ...uniqueNewGroups];
        });
      }

      setPagination({
        page,
        pageSize: paginationData.page_size || PAGE_SIZE,
        hasMore: paginationData ? page < paginationData.pages : false
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to load available groups');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGroups(1, '');
  }, []);

  const handleSearch = () => {
    setPagination({
      page: 1,
      pageSize: PAGE_SIZE,
      hasMore: true
    });
    fetchGroups(1, searchQuery, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && pagination.hasMore) {
      fetchGroups(pagination.page + 1, searchQuery);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPagination({
      page: 1,
      pageSize: PAGE_SIZE,
      hasMore: true
    });
    fetchGroups(1, searchQuery, true);
  };

  const handleJoinRequest = async () => {
    if (!selectedGroup || !joinMessage.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/groups/applications', {
        group_id: selectedGroup.id,
        message: joinMessage.trim()
      });

      Alert.alert('Success', 'Application sent successfully');
      setIsModalVisible(false);
      setJoinMessage('');
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error sending application:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to send application');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderGroupItem = ({ item }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupInfo}>
        <Text style={styles.groupName}>{item.name}</Text>
        <Text style={styles.groupDetails}>
          Admin: {item.admin_username}
        </Text>
        <Text style={styles.groupDetails}>
          Academic Group: {item.academic_group_name}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => {
          setSelectedGroup(item);
          setIsModalVisible(true);
        }}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search groups by name"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={groups}
        renderItem={renderGroupItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#4B6BFB"]}
          />
        }
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No groups found</Text>
              {searchQuery ? (
                <Text style={styles.emptySubtext}>Try a different search term</Text>
              ) : (
                <Text style={styles.emptySubtext}>Try searching for groups</Text>
              )}
            </View>
          )
        }
        ListFooterComponent={
          isLoading && !refreshing && (
            <ActivityIndicator 
              size="large" 
              color="#4B6BFB" 
              style={styles.loader} 
            />
          )
        }
      />

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Request</Text>
            <Text style={styles.modalSubtitle}>
              Group: {selectedGroup?.name}
            </Text>
            
            <TextInput
              style={styles.messageInput}
              value={joinMessage}
              onChangeText={setJoinMessage}
              placeholder="Enter your join request message"
              multiline
              numberOfLines={4}
              maxLength={200}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsModalVisible(false);
                  setJoinMessage('');
                  setSelectedGroup(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.sendButton,
                  !joinMessage.trim() && styles.sendButtonDisabled
                ]}
                onPress={handleJoinRequest}
                disabled={!joinMessage.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendButtonText}>Send Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4B6BFB',
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  groupDetails: {
    fontSize: 14,
    color: '#71727A',
    marginBottom: 2,
  },
  joinButton: {
    backgroundColor: '#4B6BFB20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonText: {
    color: '#4B6BFB',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#1A1C1E',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#71727A',
  },
  loader: {
    marginVertical: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#71727A',
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B3020',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: '#4B6BFB',
  },
  sendButtonDisabled: {
    backgroundColor: '#4B6BFB80',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GroupSearchScreen;

 