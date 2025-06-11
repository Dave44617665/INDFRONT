import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const TasksScreen = ({ navigation }) => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });

  const fetchTasks = async (page = 1, shouldRefresh = false) => {
    if (shouldRefresh) {
      setIsRefreshing(true);
    } else if (isLoading) {
      return;
    } else {
      setIsLoading(true);
    }

    try {
      const response = await api.get('/api/tasks/my-groups', {
        params: {
          page,
          page_size: pagination.pageSize
        }
      });

      const { tasks: newTasks, pagination: newPagination } = response.data;

      if (page === 1) {
        setTasks(newTasks);
      } else {
        setTasks(prev => [...prev, ...newTasks]);
      }

      setPagination({
        page,
        pageSize: newPagination.page_size,
        hasMore: page < newPagination.pages
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(
        error.response?.status === 401
          ? "Please log in again"
          : "Failed to load tasks"
      );
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && pagination.hasMore) {
      fetchTasks(pagination.page + 1);
    }
  };

  const handleRefresh = () => {
    fetchTasks(1, true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskIcon}>
          <Ionicons 
            name={item.is_verified ? "checkmark-circle" : "time"} 
            size={24} 
            color={item.is_verified ? "#4CAF50" : "#FF9800"} 
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDeadline}>
            Due: {formatDate(item.deadline)}
          </Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      <View style={styles.taskDetails}>
        {item.group && (
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#71727A" />
            <Text style={styles.detailText}>{item.group.name}</Text>
          </View>
        )}
        {item.subject && (
          <View style={styles.detailItem}>
            <Ionicons name="book" size={16} color="#71727A" />
            <Text style={styles.detailText}>{item.subject.name}</Text>
          </View>
        )}
        {item.academic_group && (
          <View style={styles.detailItem}>
            <Ionicons name="school" size={16} color="#71727A" />
            <Text style={styles.detailText}>{item.academic_group.name}</Text>
          </View>
        )}
      </View>

      <View style={styles.taskFooter}>
        {item.user && (
          <View style={styles.userInfo}>
            <Ionicons name="person" size={16} color="#4B6BFB" />
            <Text style={styles.username}>{item.user.username}</Text>
          </View>
        )}
        <Text style={styles.taskDate}>
          Created: {formatDate(item.created_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchTasks(1)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#4B6BFB"]}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#4B6BFB" style={styles.loader} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#71727A" />
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoading && tasks.length > 0 ? (
            <ActivityIndicator size="small" color="#4B6BFB" style={styles.footerLoader} />
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  taskDeadline: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  taskDescription: {
    fontSize: 14,
    color: '#71727A',
    marginBottom: 12,
  },
  taskDetails: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#1A1C1E',
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 14,
    color: '#4B6BFB',
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 12,
    color: '#71727A',
  },
  loader: {
    marginTop: 32,
  },
  footerLoader: {
    paddingVertical: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#71727A',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginTop: 8,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4B6BFB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TasksScreen; 