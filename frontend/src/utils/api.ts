import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      
      // Check if the error is not related to authentication
      if (status !== 401 && status !== 403) {
        console.error('Non-authentication error:', error.response.data);
        // Handle non-authentication errors here
        // For example, you could dispatch an action to show an error message
      }
    }
    return Promise.reject(error);
  }
);

export default api;
