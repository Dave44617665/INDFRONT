import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SubjectTasksScreen = ({ route, navigation }) => {
  const { subject } = route.params;
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    // Fetch tasks for this subject from backend
  }, [subject.id]);

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[styles.taskCard, item.overdue && styles.overdueCard]}
      onPress={() => navigation.navigate('TaskDetails', { task: item })}
    >
      <View style={styles.taskContent}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription}>{item.description}</Text>
        <View style={styles.taskMeta}>
          <View style={styles.dueDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#71727A" />
            <Text style={styles.dueDate}>Due: {item.dueDate}</Text>
          </View>
          <Text style={[styles.taskStatus, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Overdue':
        return '#FF3B30';
      case 'Due Today':
        return '#FF9500';
      case 'Completed':
        return '#34C759';
      default:
        return '#007AFF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.subjectInfo}>
        <View style={[styles.subjectIcon, { backgroundColor: subject.iconBg }]}>
          <Ionicons name={subject.icon} size={24} color="#FFF" />
        </View>
        <View style={styles.subjectDetails}>
          <Text style={styles.subjectName}>{subject.name}</Text>
          <Text style={styles.taskCount}>{tasks.length} tasks</Text>
        </View>
      </View>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask', { subject })}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  subjectDetails: {
    flex: 1,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    color: '#71727A',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  taskCard: {
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
  overdueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#71727A',
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#71727A',
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4B6BFB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default SubjectTasksScreen; 