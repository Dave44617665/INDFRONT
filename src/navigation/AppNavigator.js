import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

// Import screens
import SubjectsScreen from '../screens/SubjectsScreen';
import SubjectTasksScreen from '../screens/SubjectTasksScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupSearchScreen from '../screens/GroupSearchScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import GroupDetailsScreen from '../screens/GroupDetailsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Common header style configuration
const screenOptions = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
  },
  headerTitleStyle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1C1E',
  },
  headerTitleAlign: 'left',
  headerBackTitleVisible: false,
  headerBackImage: () => (
    <Ionicons 
      name="chevron-back" 
      size={24} 
      color="#1A1C1E" 
      style={{ marginLeft: 16 }}
    />
  ),
};

// Stack navigators for each main section
const SubjectsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="SubjectsList" component={SubjectsScreen} options={{ title: 'Subjects' }} />
    <Stack.Screen 
      name="SubjectTasks" 
      component={SubjectTasksScreen} 
      options={({ route }) => ({ 
        title: route.params?.subject?.name,
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1A1C1E" />
          </TouchableOpacity>
        ),
      })} 
    />
  </Stack.Navigator>
);

const TasksStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="TasksList" component={TasksScreen} options={{ title: 'Tasks' }} />
    <Stack.Screen 
      name="TaskDetails" 
      component={TaskDetailsScreen} 
      options={{ 
        title: 'Task Details',
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1A1C1E" />
          </TouchableOpacity>
        ),
      }} 
    />
    <Stack.Screen 
      name="CreateTask" 
      component={CreateTaskScreen} 
      options={{ title: 'Create Task' }} 
    />
  </Stack.Navigator>
);

const GroupsStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="GroupsList" component={GroupsScreen} options={{ title: 'Groups' }} />
    <Stack.Screen name="GroupSearch" component={GroupSearchScreen} options={{ title: 'Search Groups' }} />
    <Stack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Create Group' }} />
    <Stack.Screen 
      name="GroupDetails" 
      component={GroupDetailsScreen} 
      options={({ route }) => ({ 
        title: 'Group Details',
        headerRight: () => (
          <TouchableOpacity style={{ marginRight: 16 }}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#1A1C1E" />
          </TouchableOpacity>
        ),
      })} 
    />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile',}} />
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Subjects':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'Groups':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4B6BFB',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Subjects" component={SubjectsStack} />
      <Tab.Screen name="Tasks" component={TasksStack} />
      <Tab.Screen name="Groups" component={GroupsStack} />
      <Tab.Screen name="Notifications" component={NotificationsScreen}options={{
          headerShown: true,
          ...screenOptions,
          title: 'Notifications',
        }}
      />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};