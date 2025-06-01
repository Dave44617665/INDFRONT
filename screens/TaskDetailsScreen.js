import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TaskDetailsScreen = ({ route }) => {
  const { task } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.label}>Description</Text>
        <Text style={styles.description}>{task.description}</Text>
        <Text style={styles.label}>Status</Text>
        <Text style={[
          styles.status,
          { color: task.status === 'completed' ? '#4CAF50' : 
                  task.status === 'in-progress' ? '#FFA000' : '#757575' }
        ]}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#666',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 24,
    color: '#333',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TaskDetailsScreen; 