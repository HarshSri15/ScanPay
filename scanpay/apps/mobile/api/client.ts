import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Replace with your machine's LAN IP address when testing on a physical device.
// Use 'localhost' only for iOS Simulator. For Android Emulator use '10.0.2.2'.
// Example: 'http://192.168.1.105:3000/api'
const API_BASE = 'http://192.168.1.146:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['accessToken', 'user']);
    }
    return Promise.reject(error);
  }
);
