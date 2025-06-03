import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TasksScreen = ({ navigation }) => {
  const [tasks, setTasks] = React.useState([]);

  const stats = {
    total: 12,
    dueToday: 5,
    completed: 7
  };

  React.useEffect(() => {
    // Fetch tasks from backend
  }, []);

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

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: '#4B6BFB20' }]}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FF950020' }]}>
          <Text style={styles.statNumber}>{stats.dueToday}</Text>
          <Text style={styles.statLabel}>Due Today</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#34C75920' }]}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
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
        onPress={() => navigation.navigate('CreateTask')}
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
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1C1E',
  },
  statLabel: {
    fontSize: 12,
    color: '#71727A',
    marginTop: 4,
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

export default TasksScreen; 