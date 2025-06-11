import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { api, username } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await api.get(`/api/tasks/${taskId}`);
      console.log('Task Response:', response.data);
      setTask(response.data);

      // Check if user is admin of the group or creator of the task
      const isCreator = response.data.username === username;
      console.log('Is Creator:', isCreator, 'Task Username:', response.data.username, 'Current Username:', username);

      if (response.data.group_id) {
        const groupResponse = await api.get(`/api/groups/${response.data.group_id}`);
        console.log('Group Response:', groupResponse.data);
        
        // Set admin status based on the group response or creator status
        const isGroupAdmin = groupResponse.data.admin_username === username;
        console.log('Is Group Admin:', isGroupAdmin);
        
        setIsAdmin(isCreator || isGroupAdmin);
      } else {
        setIsAdmin(isCreator);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError('Failed to load task details');
      if (err.response?.status === 401) {
        navigation.navigate('Login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add a useEffect to monitor isAdmin changes
  useEffect(() => {
    console.log('isAdmin state changed:', isAdmin);
  }, [isAdmin]);

  const handleDelete = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/tasks/${taskId}`);
              // After successful deletion, navigate back and trigger a refresh
              navigation.navigate('Tasks', { refresh: true });
            } catch (err) {
              console.error('Error deleting task:', err);
              Alert.alert('Error', 'Failed to delete task');
              if (err.response?.status === 401) {
                navigation.navigate('Login');
              }
            }
          },
        },
      ]
    );
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

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4B6BFB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchTaskDetails}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{task?.title}</Text>
          <Text style={styles.username}>Created by: {task?.username}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task?.description || 'No description provided'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={20} color="#71727A" />
              <Text style={styles.detailText}>Group: {task?.group?.name || 'No group'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="book-outline" size={20} color="#71727A" />
              <Text style={styles.detailText}>Subject: {task?.subject?.name || 'No subject'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deadlines</Text>
          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Ionicons name="calendar-outline" size={20} color="#71727A" />
              <Text style={styles.dateText}>Created: {formatDate(task?.created_at)}</Text>
            </View>
            <View style={styles.dateItem}>
              <Ionicons name="time-outline" size={20} color="#71727A" />
              <Text style={styles.dateText}>Due: {formatDate(task?.deadline)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {isAdmin && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      )}
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
  scrollContent: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 8,
  },
  username: {
    fontSize: 14,
    color: '#71727A',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#48484A',
    lineHeight: 24,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#48484A',
  },
  dateContainer: {
    gap: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#48484A',
  },
  deleteButtonContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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

export default TaskDetailsScreen; 