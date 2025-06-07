import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'https://4edu.su/';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [username, setUsername] = useState(null);

  // Initialize auth state
  React.useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('userToken');
      const storedUsername = await AsyncStorage.getItem('username');
      
      if (storedToken && storedUsername) {
        setUserToken(storedToken);
        setUsername(storedUsername);
        // Set axios instance default header
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Error loading auth info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (inputUsername, password) => {
    try {
      const response = await api.post('/login', {
        username: inputUsername,
        password
      });

      const { token } = response.data;

      // Store the token and username
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('username', inputUsername);

      // Update state
      setUserToken(token);
      setUsername(inputUsername);

      // Set axios instance default header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = error.response?.data?.message || 
                        (error.response?.status === 401 ? 'Invalid credentials.' : 'Please try again later.');
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Clear stored data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('username');

      // Clear state
      setUserToken(null);
      setUsername(null);

      // Clear axios instance default header
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoading,
      userToken,
      username,
      login,
      logout,
      api // Expose the configured axios instance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 