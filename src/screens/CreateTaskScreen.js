import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import Dropdown from '../components/Dropdown';

const CreateTaskScreen = ({ navigation }) => {
  const { api } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groupId) {
      fetchSubjects(groupId);
    } else {
      setSubjects([]);
      setSubjectId(null);
    }
  }, [groupId]);

  const fetchGroups = async () => {
    try {
      const response = await api.get('/api/groups/my-groups');
      const groups = response.data.groups || [];
      setGroups(groups.map(group => ({
        label: group.name,
        value: group.id
      })));
    } catch (error) {
      console.error('Error fetching groups:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to load groups');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const fetchSubjects = async (selectedGroupId) => {
    try {
      const response = await api.get(`/api/groups/${selectedGroupId}/subjects`);
      setSubjects(response.data.subjects.map(subject => ({
        label: subject.name,
        value: subject.id
      })));
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to load subjects');
    }
  };

  const handleCreate = async () => {
    if (!title || !groupId || !subjectId || !deadline) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/tasks', {
        title,
        description,
        group_id: groupId,
        subject_id: subjectId,
        deadline: deadline.toISOString()
      });

      if (response.status === 201) {
        Alert.alert(
          'Success',
          'Task created successfully',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Tasks', params: { refresh: true } }],
                });
              }
            }
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to create task');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') {
        return;
      }
    }
    
    if (selectedDate) {
      setDeadline(selectedDate);
      if (Platform.OS === 'android') {
        setShowTimePicker(true);
      }
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'dismissed') {
        return;
      }
    }

    if (selectedTime) {
      const newDeadline = new Date(deadline);
      newDeadline.setHours(selectedTime.getHours());
      newDeadline.setMinutes(selectedTime.getMinutes());
      setDeadline(newDeadline);
    }
  };

  if (isFetching) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4B6BFB" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter task description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group *</Text>
          <Dropdown
            items={groups}
            value={groupId}
            placeholder="Select a group"
            onChange={setGroupId}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject *</Text>
          <Dropdown
            items={subjects}
            value={subjectId}
            placeholder="Select a subject"
            onChange={setSubjectId}
            disabled={!groupId}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Deadline *</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => {
              if (Platform.OS === 'android') {
                setShowDatePicker(true);
              } else {
                setShowDatePicker(true);
              }
            }}
          >
            <Text style={styles.dateText}>
              {deadline.toLocaleString()}
            </Text>
            <Ionicons name="calendar" size={20} color="#71727A" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode={Platform.OS === 'android' ? 'date' : 'datetime'}
            is24Hour={true}
            display={Platform.OS === 'android' ? 'default' : 'spinner'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={deadline}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <TouchableOpacity
          style={[
            styles.createButton,
            (!title || !groupId || !subjectId) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!title || !groupId || !subjectId || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Task</Text>
          )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1C1E',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1A1C1E',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateSelector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#1A1C1E',
  },
  createButton: {
    backgroundColor: '#4B6BFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#4B6BFB80',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateTaskScreen; 