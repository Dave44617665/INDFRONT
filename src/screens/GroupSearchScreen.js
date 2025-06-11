import React, { useState, useEffect, useCallback } from 'react';
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
import debounce from 'lodash/debounce';

const PAGE_SIZE = 10;
const SEARCH_DELAY = 300; // milliseconds

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
        params.name = search;
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

  // Create a debounced version of fetchGroups for search
  const debouncedSearch = useCallback(
    debounce((query) => {
      setPagination({
        page: 1,
        pageSize: PAGE_SIZE,
        hasMore: true
      });
      fetchGroups(1, query, true);
    }, SEARCH_DELAY),
    []
  );

  // Effect to trigger search when query changes
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      debouncedSearch(searchQuery);
    } else {
      // If search is empty, show all available groups
      setPagination({
        page: 1,
        pageSize: PAGE_SIZE,
        hasMore: true
      });
      fetchGroups(1, '', true);
    }
  }, [searchQuery]);

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
          autoCapitalize="none"
          autoCorrect={false}
        />
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="#71727A" />
        </View>
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
    alignItems: 'center',
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
    paddingRight: 40,
    fontSize: 16,
  },
  searchIcon: {
    position: 'absolute',
    right: 28,
    top: 28,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  groupDetails: {
    fontSize: 14,
    color: '#71727A',
    marginBottom: 4,
  },
  joinButton: {
    backgroundColor: '#4B6BFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
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
    marginTop: 16,
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
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
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
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FB',
  },
  cancelButtonText: {
    color: '#71727A',
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

 