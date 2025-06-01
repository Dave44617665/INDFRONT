import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';

const ItemScreen = ({ route, navigation }) => {
  const { groupId } = route.params;
  const assignments = [
    { id: '1', title: 'Assignment 1', status: 'pending' },
    { id: '2', title: 'Assignment 2', status: 'approved' },
    { id: '3', title: 'Assignment 3', status: 'rejected' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Details</Text>
      <Text>Group ID: {groupId}</Text>
      <Text style={styles.subtitle}>Assignments</Text>
      <FlatList
        data={assignments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.title} - {item.status}</Text>
            <Button title="View Task" onPress={() => navigation.navigate('Task', { taskId: item.id })} />
          </View>
        )}
      />
      <Button title="Create Task" onPress={() => navigation.navigate('TaskCreation', { groupId })} />
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
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default ItemScreen; 