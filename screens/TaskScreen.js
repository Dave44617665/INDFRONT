import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const TaskScreen = ({ navigation }) => {
  // Sample tasks data - in a real app, this would come from an API or state management
  const tasks = [
    {
      id: '1',
      title: 'Complete Project Documentation',
      description: 'Write detailed documentation for the current project phase',
      status: 'pending',
    },
    {
      id: '2',
      title: 'Team Meeting',
      description: 'Weekly team sync-up meeting',
      status: 'completed',
    },
    {
      id: '3',
      title: 'Code Review',
      description: 'Review pull requests from team members',
      status: 'in-progress',
    },
  ];

  const renderTask = ({ item }) => (
    <TouchableOpacity 
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetails', { task: item })}
    >
      <View>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[
          styles.taskStatus,
          { color: item.status === 'completed' ? '#4CAF50' : 
                  item.status === 'in-progress' ? '#FFA000' : '#757575' }
        ]}>
          Status: {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('TaskCreation')}
        >
          <Text style={styles.addButtonText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TaskScreen; 