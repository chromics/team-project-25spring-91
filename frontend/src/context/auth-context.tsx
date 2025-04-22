// context/auth-context.tsx
"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/utils/api';
import { useRouter } from 'next/navigation';

type User = {
  id: number;
  email: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  heightCm: number;
  weightKg: string;
  createdAt: string;
}

type OAuthProvider = 'github' | 'microsoft';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token) {
        try {
          setLoading(true);
          const { data } = await api.get('/users/profile');
          console.log('Profile Data:', data);
          setUser(data.data);
        } catch (error) {
          console.error('Failed to fetch user profile');
          logout();
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]); // This dependency is important

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      // Clear the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Set the token
      Cookies.set('token', token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      setToken(token);

      // Redirect to dashboard
      router.push('/dashboard/statistics');
    }
  }, [router]);

  const loginWithOAuth = (provider: 'github' | 'microsoft') => {
    // Redirect to OAuth endpoint
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { email, password, displayName });

      const newToken = data.data.token;

      Cookies.set('token', newToken, {
        expires: 7, // Set cookie expiration (e.g., 7 days)
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict' // Helps prevent CSRF attacks
      });
      setToken(newToken);


    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });

      const newToken = data.data.token;

      // Set cookie first
      Cookies.set('token', newToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      // Then set token - this will trigger the useEffect to fetch the profile
      setToken(newToken);
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    Cookies.remove('token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, token, login, logout, loginWithOAuth, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};