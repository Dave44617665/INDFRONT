import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SubjectsScreen = ({ navigation }) => {
  // This would come from your backend
  const [subjects, setSubjects] = React.useState([]);

  React.useEffect(() => {
    // Fetch subjects from backend
  }, []);

  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectCard}
      onPress={() => navigation.navigate('SubjectTasks', { subject: item })}
    >
      <View style={styles.subjectContent}>
        <Text style={styles.subjectName}>{item.name}</Text>
        <Text style={styles.taskCount}>{item.taskCount} tasks pending</Text>
      </View>
      <View style={[styles.subjectIcon, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={24} color="#FFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={subjects}
        renderItem={renderSubject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
    padding: 16,
  },
  listContainer: {
    paddingBottom: 16,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  subjectContent: {
    flex: 1,
    marginRight: 16,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 4,
  },
  taskCount: {
    fontSize: 14,
    color: '#71727A',
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SubjectsScreen; 