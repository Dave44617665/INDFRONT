import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Dropdown from '../components/Dropdown';

const GroupDetailsScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const { api, username } = useAuth();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isSubjectsLoading, setIsSubjectsLoading] = useState(false);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [error, setError] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newAcademicGroupId, setNewAcademicGroupId] = useState(null);
  const [academicGroups, setAcademicGroups] = useState([]);
  const [subjectsPagination, setSubjectsPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });
  const [tasksPagination, setTasksPagination] = useState({
    page: 1,
    pageSize: 10,
    hasMore: true
  });
  const [hasAttemptedTaskLoad, setHasAttemptedTaskLoad] = useState(false);

  const isAdmin = group?.admin_username === username;

  useEffect(() => {
    fetchGroupDetails();
    fetchAcademicGroups();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const response = await api.get(`/api/groups/${groupId}`);
      if (!response.data) {
        throw new Error('Group not found');
      }
      setGroup(response.data);
      setNewGroupName(response.data.name);
      setNewAcademicGroupId(response.data.academic_group_id);
      setError(null);
    } catch (error) {
      console.error('Error fetching group details:', error);
      handleError(error, "Failed to load group details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAcademicGroups = async () => {
    try {
      const response = await api.get('/api/academic-groups');
      setAcademicGroups(response.data);
    } catch (error) {
      console.error('Error fetching academic groups:', error);
      handleError(error, "Failed to load academic groups");
    }
  };

  const fetchUsers = async () => {
    if (users.length > 0) return;
    
    setIsUsersLoading(true);
    try {
      const response = await api.get(`/api/groups/${groupId}/users`);
      if (!response.data) {
        throw new Error('Failed to load group members');
      }
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching group users:', error);
      handleError(error, "Failed to load group members");
    } finally {
      setIsUsersLoading(false);
    }
  };

  const fetchSubjects = async (page = 1) => {
    if (isSubjectsLoading) return;
    
    setIsSubjectsLoading(true);
    try {
      const response = await api.get(`/api/groups/${groupId}/subjects`, {
        params: {
          page,
          page_size: subjectsPagination.pageSize
        }
      });
      
      const { subjects: newSubjects, pagination } = response.data;
      
      if (page === 1) {
        setSubjects(newSubjects);
      } else {
        setSubjects(prev => [...prev, ...newSubjects]);
      }
      
      setSubjectsPagination({
        page,
        pageSize: pagination.page_size,
        hasMore: page < pagination.pages
      });
    } catch (error) {
      console.error('Error fetching group subjects:', error);
      handleError(error, "Failed to load subjects");
    } finally {
      setIsSubjectsLoading(false);
    }
  };

  const fetchTasks = async (page = 1) => {
    if (isTasksLoading) return;
    
    setIsTasksLoading(true);
    try {
      const response = await api.get('/api/tasks', {
        params: {
          group_id: groupId,
          page,
          page_size: tasksPagination.pageSize
        }
      });
      
      const { tasks: newTasks, pagination } = response.data;
      
      if (page === 1) {
        setTasks(newTasks);
      } else {
        setTasks(prev => [...prev, ...newTasks]);
      }
      
      setTasksPagination({
        page,
        pageSize: pagination.page_size,
        hasMore: page < pagination.pages
      });
      setHasAttemptedTaskLoad(true);
    } catch (error) {
      console.error('Error fetching group tasks:', error);
      handleError(error, "Failed to load tasks");
      setHasAttemptedTaskLoad(true);
    } finally {
      setIsTasksLoading(false);
    }
  };

  const handleError = (error, defaultMessage) => {
    const errorMessage = error.response?.status === 403 
      ? "You don't have access to this group"
      : error.response?.status === 404
      ? "Group not found"
      : error.response?.status === 401
      ? "Please log in again"
      : defaultMessage;
    
    if (error.response?.status === 401) {
      navigation.navigate('Login');
    } else {
      Alert.alert('Error', errorMessage);
    }
  };

  const handleToggleUsers = () => {
    if (!showUsers && users.length === 0) {
      fetchUsers();
    }
    setShowUsers(!showUsers);
  };

  const handleToggleSubjects = () => {
    if (!showSubjects && subjects.length === 0) {
      fetchSubjects(1);
    }
    setShowSubjects(!showSubjects);
  };

  const handleToggleTasks = () => {
    if (!showTasks && !hasAttemptedTaskLoad) {
      fetchTasks(1);
    }
    setShowTasks(!showTasks);
  };

  const handleLoadMoreSubjects = () => {
    if (subjectsPagination.hasMore) {
      fetchSubjects(subjectsPagination.page + 1);
    }
  };

  const handleLoadMoreTasks = () => {
    if (tasksPagination.hasMore) {
      fetchTasks(tasksPagination.page + 1);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const response = await api.patch(`/api/groups/${groupId}`, {
        name: newGroupName,
        academic_group_id: newAcademicGroupId
      });

      setGroup(response.data);
      setIsUpdateModalVisible(false);
      Alert.alert('Success', 'Group updated successfully');
    } catch (error) {
      console.error('Error updating group:', error);
      handleError(error, "Failed to update group");
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/api/groups/${groupId}`);
              Alert.alert('Success', 'Group deleted successfully', [
                { text: 'OK', onPress: () => navigation.navigate('GroupsList') }
              ]);
            } catch (error) {
              console.error('Error deleting group:', error);
              handleError(error, "Failed to delete group");
            }
          }
        }
      ]
    );
  };

  const renderUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userIcon}>
        <Ionicons name="person" size={20} color="#4B6BFB" />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.joinDate}>
          Joined {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderSubject = ({ item }) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectIcon}>
        <Ionicons name="book" size={20} color="#4B6BFB" />
      </View>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{item.name}</Text>
      </View>
    </View>
  );

  const renderTask = ({ item }) => (
    <View style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <View style={styles.taskIcon}>
          <Ionicons 
            name={item.is_verified ? "checkmark-circle" : "time"} 
            size={20} 
            color={item.is_verified ? "#4CAF50" : "#FF9800"} 
          />
        </View>
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDeadline}>
            Due: {new Date(item.deadline).toLocaleDateString()}
          </Text>
        </View>
      </View>
      {item.description && (
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
      <View style={styles.taskFooter}>
        <Text style={styles.taskAuthor}>By: {item.username}</Text>
        <Text style={styles.taskDate}>
          Created: {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4B6BFB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.groupIcon}>
            <Ionicons name="people" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.groupName}>{group?.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={20} color="#71727A" />
            <Text style={styles.infoLabel}>Academic Group:</Text>
            <Text style={styles.infoValue}>{group?.academic_group_name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#71727A" />
            <Text style={styles.infoLabel}>Admin:</Text>
            <Text style={styles.infoValue}>{group?.admin_username}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.sectionToggle}
          onPress={handleToggleUsers}
        >
          <View style={styles.sectionToggleHeader}>
            <Text style={styles.sectionToggleText}>Group Members</Text>
            <Ionicons 
              name={showUsers ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#4B6BFB" 
            />
          </View>
        </TouchableOpacity>

        {showUsers && (
          <View style={styles.sectionContent}>
            {isUsersLoading ? (
              <ActivityIndicator size="small" color="#4B6BFB" style={styles.sectionLoader} />
            ) : (
              <FlatList
                data={users}
                renderItem={renderUser}
                keyExtractor={(item) => item.user_id.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No members found</Text>
                }
              />
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.sectionToggle}
          onPress={handleToggleSubjects}
        >
          <View style={styles.sectionToggleHeader}>
            <Text style={styles.sectionToggleText}>Group Subjects</Text>
            <Ionicons 
              name={showSubjects ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#4B6BFB" 
            />
          </View>
        </TouchableOpacity>

        {showSubjects && (
          <View style={styles.sectionContent}>
            {isSubjectsLoading && subjects.length === 0 ? (
              <ActivityIndicator size="small" color="#4B6BFB" style={styles.sectionLoader} />
            ) : (
              <FlatList
                data={subjects}
                renderItem={renderSubject}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No subjects found</Text>
                }
                ListFooterComponent={
                  isSubjectsLoading ? (
                    <ActivityIndicator size="small" color="#4B6BFB" style={styles.footerLoader} />
                  ) : null
                }
                onEndReached={handleLoadMoreSubjects}
                onEndReachedThreshold={0.5}
              />
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.sectionToggle}
          onPress={handleToggleTasks}
        >
          <View style={styles.sectionToggleHeader}>
            <Text style={styles.sectionToggleText}>Group Tasks</Text>
            <Ionicons 
              name={showTasks ? "chevron-up" : "chevron-down"} 
              size={24} 
              color="#4B6BFB" 
            />
          </View>
        </TouchableOpacity>

        {showTasks && (
          <View style={styles.sectionContent}>
            {isTasksLoading && !hasAttemptedTaskLoad ? (
              <ActivityIndicator size="small" color="#4B6BFB" style={styles.sectionLoader} />
            ) : (
              <FlatList
                data={tasks}
                renderItem={renderTask}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                ListEmptyComponent={
                  <View style={styles.emptyStateContainer}>
                    <Ionicons name="clipboard-outline" size={48} color="#71727A" />
                    <Text style={styles.emptyText}>There are no tasks in this group yet</Text>
                    {isAdmin && (
                      <TouchableOpacity
                        style={styles.createTaskButton}
                        onPress={() => navigation.navigate('CreateTask', { groupId })}
                      >
                        <Text style={styles.createTaskButtonText}>Create Task</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                }
                ListFooterComponent={
                  isTasksLoading && hasAttemptedTaskLoad ? (
                    <ActivityIndicator size="small" color="#4B6BFB" style={styles.footerLoader} />
                  ) : null
                }
                onEndReached={handleLoadMoreTasks}
                onEndReachedThreshold={0.5}
              />
            )}
          </View>
        )}

        {isAdmin && (
          <View style={styles.adminActions}>
            <TouchableOpacity
              style={[styles.adminButton, styles.editButton]}
              onPress={() => setIsUpdateModalVisible(true)}
            >
              <Ionicons name="create" size={20} color="#4B6BFB" />
              <Text style={styles.editButtonText}>Edit Group</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.adminButton, styles.deleteButton]}
              onPress={handleDeleteGroup}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={styles.deleteButtonText}>Delete Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isUpdateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsUpdateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Group</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Group Name</Text>
              <TextInput
                style={styles.input}
                value={newGroupName}
                onChangeText={setNewGroupName}
                placeholder="Enter group name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Academic Group</Text>
              <Dropdown
                value={newAcademicGroupId}
                items={academicGroups}
                onSelect={(item) => setNewAcademicGroupId(item.id)}
                placeholder="Select academic group"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsUpdateModalVisible(false);
                  setNewGroupName(group.name);
                  setNewAcademicGroupId(group.academic_group_id);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.updateButton]}
                onPress={handleUpdateGroup}
              >
                <Text style={styles.updateButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#1A1C1E',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#4B6BFB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#4B6BFB',
    padding: 24,
    alignItems: 'center',
  },
  groupIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#71727A',
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1C1E',
    fontWeight: '500',
    flex: 1,
  },
  sectionToggle: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionToggleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 1,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionLoader: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#71727A',
    fontSize: 16,
    padding: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  subjectIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B6BFB20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1C1E',
  },
  footerLoader: {
    paddingVertical: 16,
  },
  adminActions: {
    padding: 16,
    gap: 12,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  editButton: {
    borderColor: '#4B6BFB20',
    backgroundColor: '#4B6BFB10',
  },
  deleteButton: {
    borderColor: '#FF3B3020',
    backgroundColor: '#FF3B3010',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4B6BFB',
    fontWeight: '500',
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FB',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B3020',
  },
  updateButton: {
    backgroundColor: '#4B6BFB',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
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
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  taskAuthor: {
    fontSize: 14,
    color: '#4B6BFB',
    fontWeight: '500',
  },
  taskDate: {
    fontSize: 14,
    color: '#71727A',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  createTaskButton: {
    backgroundColor: '#4B6BFB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GroupDetailsScreen; 