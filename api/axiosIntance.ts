import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearAuthData } from '@/utils/auth'; // adjust path
import { router } from 'expo-router';

const api = axios.create({
  baseURL: 'https://api-ridepay-nodebackend.onrender.com/ridepay', 
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('ridepay_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('❌ Failed to attach token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expired or unauthorized. Logging out...');
      await clearAuthData();
      router.replace('/'); // redirect to login
    }
    return Promise.reject(error);
  }
);


export default api;
