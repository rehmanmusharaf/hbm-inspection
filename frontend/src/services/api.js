import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    // Don't redirect to login if we're already on auth pages or if it's a login/register request
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/register');
    const isAuthPage = window.location.pathname.includes('/login') || 
                      window.location.pathname.includes('/register');
    
    if (error.response?.status === 401 && !isAuthEndpoint && !isAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please wait a moment.');
    } else if (!isAuthEndpoint) {
      // Only show error toast for non-auth endpoints (login/register handle their own errors)
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/update-password', data),
  logout: () => api.post('/auth/logout'),
};

export const carsAPI = {
  getCars: (params) => api.get('/cars', { params }),
  getCar: (id) => api.get(`/cars/${id}`),
  createCar: (data) => api.post('/cars', data),
  updateCar: (id, data) => api.put(`/cars/${id}`, data),
  deleteCar: (id) => api.delete(`/cars/${id}`),
};

export const inspectionsAPI = {
  getInspections: (params) => api.get('/inspections', { params }),
  getInspection: (id) => api.get(`/inspections/${id}`),
  createInspection: (data) => api.post('/inspections', data),
  updateInspection: (id, data) => api.put(`/inspections/${id}`, data),
  publishInspection: (id) => api.put(`/inspections/${id}/publish`),
  deleteInspection: (id) => api.delete(`/inspections/${id}`),
  getPublicInspection: (id, token) => api.get(`/inspections/public/${id}/${token}`),
};

export const bookingsAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (data) => api.post('/bookings', data),
  updateBooking: (id, data) => api.put(`/bookings/${id}`, data),
  assignInspector: (id, inspectorId) => api.put(`/bookings/${id}/assign-inspector`, { inspectorId }),
  cancelBooking: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
};

export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/users/${id}`),
};

export const uploadAPI = {
  uploadSingle: (file, addWatermark = false) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('addWatermark', addWatermark);
    return api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultiple: (files, addWatermark = false) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    formData.append('addWatermark', addWatermark);
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (publicId) => api.delete(`/upload/${publicId}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: (limit = 10) => api.get('/dashboard/activity', { params: { limit } }),
};

export default api;