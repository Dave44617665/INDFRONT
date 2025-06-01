import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TaskScreen = ({ route }) => {
  const { taskId } = route.params;
  const task = {
    id: taskId,
    title: 'Sample Task',
    description: 'This is a placeholder task description.',
    status: 'pending',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.description}>{task.description}</Text>
      <Text style={styles.status}>Status: {task.status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TaskScreen; 