import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

export default api;

// Auth API
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

// Profile API
export const profileApi = {
  getMe: () => api.get('/profile/me'),
  update: (data: any) => api.put('/profile/update', data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/profile/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getMatches: () => api.get('/profile/matches'),
  discover: () => api.get('/profile/discover'),
  getCompatibility: (id: string) => api.get(`/profile/compatibility/${id}`),
};

// Companion API
export const companionApi = {
  create: (data: any) => api.post('/companion/create', data),
  list: (params?: any) => api.get('/companion/list', { params }),
  getById: (id: string) => api.get(`/companion/${id}`),
};

// Booking API
export const bookingApi = {
  create: (data: any) => api.post('/booking/create', data),
  respond: (data: any) => api.patch('/booking/respond', data),
  complete: (id: string) => api.post(`/booking/complete/${id}`),
  history: () => api.get('/booking/history'),
};

// Payment API
export const paymentApi = {
  createOrder: (bookingId: string) => api.post('/payment/create-order', { bookingId }),
  verify: (data: any) => api.post('/payment/verify', data),
  refund: (paymentId: string) => api.post('/payment/refund', { paymentId }),
};

// Search API
export const searchApi = {
  users: (params?: any) => api.get('/search/users', { params }),
  companions: (params?: any) => api.get('/search/companions', { params }),
};

// Chat API
export const chatApi = {
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (userId: string, page?: number) =>
    api.get(`/chat/${userId}`, { params: { page } }),
  getUnreadCount: () => api.get('/chat/unread/count'),
};

// Admin API
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  banUser: (userId: string, reason: string) =>
    api.patch('/admin/ban', { userId, reason }),
  unbanUser: (id: string) => api.patch(`/admin/unban/${id}`),
  getBookings: () => api.get('/admin/bookings'),
  approveCompanion: (userId: string) =>
    api.patch(`/admin/companion/approve/${userId}`),
};
