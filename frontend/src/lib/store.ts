import { create } from 'zustand';

interface User {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  photos?: string[];
  isVerified: boolean;
  profileCompletion: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setTokens: (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
    set({ accessToken, isAuthenticated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        set({ accessToken: token, isAuthenticated: true });
      }
    }
  },
}));
