import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Dropdown from '../components/Dropdown';

const CreateGroupScreen = ({ navigation }) => {
  const { api } = useAuth();
  const [name, setName] = useState('');
  const [academicGroupId, setAcademicGroupId] = useState(null);
  const [academicGroups, setAcademicGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchAcademicGroups();
  }, []);

  const fetchAcademicGroups = async () => {
    try {
      const response = await api.get('/api/academic-groups');
      setAcademicGroups(response.data);
    } catch (error) {
      console.error('Error fetching academic groups:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Failed to load academic groups');
      }
    } finally {
      setIsFetching(false);
    }
  };

  const handleCreate = async () => {
    if (!name || !academicGroupId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/api/groups', {
        name,
        academic_group_id: academicGroupId
      });

      // Navigate to GroupsScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'GroupsList' }],
      });
    } catch (error) {
      console.error('Error creating group:', error);
      if (error.response?.status === 401) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Failed to create group');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4B6BFB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group Name*</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter group name"
            editable={!isLoading}
          />
        </View>

        <Dropdown
          label="Academic Group*"
          placeholder="Select academic group"
          value={academicGroupId}
          items={academicGroups}
          onSelect={(item) => setAcademicGroupId(item.id)}
          disabled={isLoading}
        />

        <TouchableOpacity
          style={[
            styles.createButton,
            (!name || !academicGroupId || isLoading) && styles.createButtonDisabled,
          ]}
          onPress={handleCreate}
          disabled={!name || !academicGroupId || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Create Group</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
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

export default CreateGroupScreen; 