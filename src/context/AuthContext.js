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
  const [credentials, setCredentials] = useState(null);

  // Initialize auth state
  React.useEffect(() => {
    loadStoredAuth();
  }, []);

  // Setup axios interceptor for token refresh
  React.useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried refreshing yet
        if (error.response?.status === 401 && !originalRequest._retry && credentials) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const response = await refreshToken();
            if (response.success) {
              // Retry the original request with new token
              originalRequest.headers['Authorization'] = `Bearer ${response.token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptor on unmount
      api.interceptors.response.eject(interceptor);
    };
  }, [credentials]);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUsername, storedCredentials] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('username'),
        AsyncStorage.getItem('credentials')
      ]);
      
      if (storedToken && storedUsername && storedCredentials) {
        setUserToken(storedToken);
        setUsername(storedUsername);
        setCredentials(JSON.parse(storedCredentials));
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Refresh token on startup if we have credentials
        refreshToken();
      }
    } catch (error) {
      console.error('Error loading auth info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!credentials) {
      return { success: false };
    }

    try {
      const response = await api.post('/login', credentials);
      const { token } = response.data;

      // Update token in storage and state
      await AsyncStorage.setItem('userToken', token);
      setUserToken(token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      return { success: true, token };
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, log out the user
      await logout();
      return { success: false };
    }
  };

  const login = async (inputUsername, password) => {
    try {
      const loginCredentials = {
        username: inputUsername,
        password
      };

      const response = await api.post('/login', loginCredentials);
      const { token } = response.data;

      // Store everything we need for future token refreshes
      await Promise.all([
        AsyncStorage.setItem('userToken', token),
        AsyncStorage.setItem('username', inputUsername),
        AsyncStorage.setItem('credentials', JSON.stringify(loginCredentials))
      ]);

      // Update state
      setUserToken(token);
      setUsername(inputUsername);
      setCredentials(loginCredentials);

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
      await Promise.all([
        AsyncStorage.removeItem('userToken'),
        AsyncStorage.removeItem('username'),
        AsyncStorage.removeItem('credentials')
      ]);

      // Clear state
      setUserToken(null);
      setUsername(null);
      setCredentials(null);

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