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

const SubjectsScreen = ({ navigation }) => {
  const { api } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });

  const fetchSubjects = async (page = 1, shouldRefresh = false) => {
    if (shouldRefresh) {
      setIsRefreshing(true);
    } else if (isLoading) {
      return;
    } else {
      setIsLoading(true);
    }

    try {
      const response = await api.get('/api/subjects/my-groups', {
        params: {
          page,
          page_size: pagination.pageSize
        }
      });

      const { subjects: newSubjects, pagination: newPagination } = response.data;

      if (page === 1) {
        setSubjects(newSubjects);
      } else {
        setSubjects(prev => [...prev, ...newSubjects]);
      }

      setPagination({
        page,
        pageSize: newPagination.page_size,
        hasMore: page < newPagination.pages
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError(
        error.response?.status === 401
          ? "Please log in again"
          : "Failed to load subjects"
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
    fetchSubjects(1);
  }, []);

  const handleLoadMore = () => {
    if (!isLoading && pagination.hasMore) {
      fetchSubjects(pagination.page + 1);
    }
  };

  const handleRefresh = () => {
    fetchSubjects(1, true);
  };

  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectCard}
      onPress={() => navigation.navigate('SubjectDetails', { subjectId: item.id })}
    >
      <View style={styles.subjectHeader}>
        <View style={styles.subjectIcon}>
          <Ionicons name="book" size={24} color="#4B6BFB" />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{item.name}</Text>
          <Text style={styles.academicGroupName}>
            {item.academic_group.name}
          </Text>
        </View>
      </View>

      <View style={styles.groupsList}>
        <Text style={styles.groupsLabel}>Groups:</Text>
        {item.groups.map((group, index) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupChip}
            onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
          >
            <Text style={styles.groupChipText}>{group.name}</Text>
          </TouchableOpacity>
        ))}
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
          onPress={() => fetchSubjects(1)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        renderItem={renderSubject}
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
              <Ionicons name="book-outline" size={48} color="#71727A" />
              <Text style={styles.emptyText}>No subjects found</Text>
            </View>
          )
        }
        ListFooterComponent={
          isLoading && subjects.length > 0 ? (
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
  subjectCard: {
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
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4B6BFB20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  academicGroupName: {
    fontSize: 14,
    color: '#71727A',
  },
  groupsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  groupsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#71727A',
    marginRight: 8,
    marginBottom: 8,
  },
  groupChip: {
    backgroundColor: '#4B6BFB10',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  groupChipText: {
    fontSize: 14,
    color: '#4B6BFB',
    fontWeight: '500',
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

export default SubjectsScreen; 