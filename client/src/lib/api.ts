import axios from 'axios';
import { User, UserRole } from '../contexts/AuthContext';

interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
}

interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const api = {
  setAuthToken: (token: string | null) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
    }
  },

  login: (email: string, password: string) => 
    axiosInstance.post<LoginResponse>('/auth/login', { email, password }),

  register: (name: string, email: string, password: string, role: UserRole) => 
    axiosInstance.post<LoginResponse>('/auth/register', { name, email, password, role }),

  getProfile: () => 
    axiosInstance.get<APIResponse<{ user: User }>>('/auth/profile'),

  updateProfile: (userData: Partial<User>) => 
    axiosInstance.put<APIResponse<User>>('/auth/profile', userData),

  getAllUsers: () => 
    axiosInstance.get<{ success: boolean; users: User[] }>('/auth/users'),

  deleteUser: (userId: string) => 
    axiosInstance.delete<APIResponse<void>>(`/auth/users/${userId}`),

  getDevices: () => 
    axiosInstance.get<APIResponse<User['devices']>>('/auth/devices'),

  // Add the uploadPhoto method
  uploadPhoto: (taskId: string, formData: FormData, token: string) => 
    axiosInstance.post<APIResponse<any>>(`/tasks/${taskId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    }),

  getTasks: () => 
    axiosInstance.get<{ success: boolean; data: any[] }>('/tasks'),

  createTask: (taskData: any) =>
    axiosInstance.post<{ success: boolean; data: any }>('/tasks', taskData),
};

export default api;
