import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppRegistry, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { registerRootComponent } from 'expo';

import ItemListScreen from './screens/ItemListScreen';
import ItemScreen from './screens/ItemScreen';
import TaskScreen from './screens/TaskScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import TaskCreationScreen from './screens/TaskCreationScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator for Groups flow
function GroupsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Groups" component={ItemListScreen} />
      <Stack.Screen name="Item" component={ItemScreen} />
    </Stack.Navigator>
  );
}

// Stack navigator for Tasks flow
function TasksStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tasks" component={TaskScreen} />
      <Stack.Screen 
        name="TaskDetails" 
        component={TaskDetailsScreen}
        options={({ route }) => ({ 
          title: 'Task Details',
          headerBackTitleVisible: false
        })}
      />
      <Stack.Screen 
        name="TaskCreation" 
        component={TaskCreationScreen}
        options={{ 
          title: 'New Task',
          headerBackTitleVisible: false
        }}
      />
    </Stack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'GroupsTab':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'ScheduleTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'TasksTab':
              iconName = focused ? 'list' : 'list-outline';
              break;
            case 'ProfileTab':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'alert-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="GroupsTab" 
        component={GroupsStack} 
        options={{ 
          headerShown: false,
          title: 'Groups'
        }}
      />
      <Tab.Screen 
        name="ScheduleTab" 
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="TasksTab" 
        component={TasksStack}
        options={{ 
          headerShown: false,
          title: 'Tasks'
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

registerRootComponent(App);

export default App; 