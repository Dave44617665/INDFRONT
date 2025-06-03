import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskDetailsScreen = ({ route, navigation }) => {
  const { task } = route.params;
  const [isEditing, setIsEditing] = React.useState(false);

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{task?.title}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="pencil" size={20} color="#4B6BFB" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.status, { color: getStatusColor(task?.status) }]}>
          {task?.status}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{task?.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Due Date</Text>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={20} color="#71727A" />
          <Text style={styles.metaText}>{task?.dueDate}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subject</Text>
        <View style={styles.subjectContainer}>
          <View style={[styles.subjectIcon, { backgroundColor: task?.subject?.iconBg }]}>
            <Ionicons name={task?.subject?.icon} size={20} color="#FFF" />
          </View>
          <Text style={styles.subjectName}>{task?.subject?.name}</Text>
        </View>
      </View>

      {task?.attachments && task.attachments.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          {task.attachments.map((attachment, index) => (
            <TouchableOpacity key={index} style={styles.attachmentItem}>
              <Ionicons name="document-outline" size={20} color="#71727A" />
              <Text style={styles.attachmentName}>{attachment.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={() => {
            // Handle task completion
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Mark as Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            // Handle task deletion
            navigation.goBack();
          }}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
            Delete Task
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1C1E',
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
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
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#48484A',
    lineHeight: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#48484A',
  },
  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectName: {
    fontSize: 16,
    color: '#48484A',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  attachmentName: {
    marginLeft: 8,
    fontSize: 16,
    color: '#48484A',
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  completeButton: {
    backgroundColor: '#4B6BFB',
  },
  deleteButton: {
    backgroundColor: '#FF3B3020',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});

export default TaskDetailsScreen; 