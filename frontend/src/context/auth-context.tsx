// // context/auth-context.tsx
// "use client";
// import { createContext, useContext, useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import api from '@/lib/api';
// import { useRouter } from 'next/navigation';
// import { UserRole } from '@/components/auth/sign-up-form';

// type User = {
//   id: number;
//   email: string;
//   displayName: string;
//   dateOfBirth: string;
//   gender: string;
//   heightCm: number;
//   weightKg: string;
//   createdAt: string;
//   role: UserRole;
// }

// type OAuthProvider = 'github' | 'microsoft';

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   token: string | null;
//   signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
//   login: (email: string, password: string) => Promise<void>;
//   loginWithOAuth: (provider: OAuthProvider) => void;
//   logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | null>(null);

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       if (token) {
//         try {
//           setLoading(true);
//           const { data } = await api.get('/users/profile');
//           console.log(data);
//           console.log('Profile Data:', data);
//           setUser(data.data);
//         } catch (error) {
//           console.error('Failed to fetch user profile');
//           logout();
//         } finally {
//           setLoading(false);
//         }
//       } else {
//         setLoading(false);
//       }
//     };

//     fetchUserProfile();
//   }, [token]); // This dependency is important

//   useEffect(() => {
//     const token = new URLSearchParams(window.location.search).get('token');
//     if (token) {
//       // Clear the URL
//       window.history.replaceState({}, document.title, window.location.pathname);

//       // Set the token
//       Cookies.set('token', token, {
//         expires: 7,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict'
//       });
//       setToken(token);

//       // Redirect to dashboard
//       router.push('/dashboard/statistics');
//     }
//   }, [router]);

//   useEffect(() => {
//     if (user && !loading) {
//       const currentPath = window.location.pathname;
//       const expectedDashboard = getDefaultDashboard(user.role);

//       // Only redirect if user is on a generic dashboard path
//       if (currentPath === '/dashboard/statistics' || currentPath === '/dashboard') {
//         router.push(expectedDashboard);
//       }
//     }
//   }, [user, loading, router]);

//   const getDefaultDashboard = (role: UserRole): string => {
//     switch (role) {
//       case UserRole.ADMIN:
//         return '/dashboard/admin/dashboard';
//       case UserRole.GYM_OWNER:
//         return '/dashboard/gym-owner/dashboard';
//       case UserRole.REGULAR_USER:
//       default:
//         return '/dashboard/dashboard';
//     }
//   };

//   const loginWithOAuth = (provider: 'github' | 'microsoft') => {
//     // Redirect to OAuth endpoint
//     window.location.href = `http://localhost:5000/api/auth/${provider}`;
//   };

//   const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
//     try {
//       setLoading(true);
//       const { data } = await api.post('/auth/register', { email, password, displayName, role });

//       const newToken = data.data.token;

//       Cookies.set('token', newToken, {
//         expires: 7, // Set cookie expiration (e.g., 7 days)
//         secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
//         sameSite: 'strict' // Helps prevent CSRF attacks
//       });
//       setToken(newToken);

//       // Redirect based on role after successful signup
//       const userRole = role || UserRole.REGULAR_USER;
//       router.push(getDefaultDashboard(userRole));
//     } catch (error) {
//       console.error('Login Error:', error);
//       throw error;
//     }
//   }

//   const login = async (email: string, password: string) => {
//     try {
//       setLoading(true);
//       const { data } = await api.post('/auth/login', { email, password });

//       const newToken = data.data.token;

//       // Set cookie first
//       Cookies.set('token', newToken, {
//         expires: 7,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'strict'
//       });

//       // Then set token - this will trigger the useEffect to fetch the profile
//       setToken(newToken);
//     } catch (error) {
//       console.error('Login Error:', error);
//       throw error;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     setToken(null);
//     Cookies.remove('token');
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, token, login, logout, loginWithOAuth, signUp }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };
// src/context/auth-context.tsx
// src/context/auth-context.tsx
"use client";
import { createContext, useContext, useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/components/auth/sign-up-form';

type User = {
  id: number;
  email: string;
  displayName: string;
  dateOfBirth: string;
  gender: string;
  heightCm: number;
  weightKg: string;
  createdAt: string;
  role: UserRole;
}

type OAuthProvider = 'github' | 'microsoft';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  signUp: (email: string, password: string, displayName: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// Add this helper function
const getDefaultDashboard = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/dashboard/admin/dashboard';
    case UserRole.GYM_OWNER:
      return '/dashboard/gym-owner/dashboard';
    case UserRole.REGULAR_USER:
    default:
      return '/dashboard/dashboard';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(Cookies.get('token') || null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const hasRedirected = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && !isInitialized.current) {
        try {
          setLoading(true);
          const { data } = await api.get('/users/profile');
          console.log('Profile Data:', data);
          setUser(data.data);
          isInitialized.current = true;
        } catch (error) {
          console.error('Failed to fetch user profile');
          logout();
        } finally {
          setLoading(false);
        }
      } else if (!token) {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken && !hasRedirected.current) {
      // Clear the URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Set the token
      Cookies.set('token', urlToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      setToken(urlToken);
      hasRedirected.current = true;

      // Redirect to dashboard
      router.push('/dashboard/statistics');
    }
  }, [router]);

  // Handle role-based redirect after user is loaded - but only once and only for specific routes
  useEffect(() => {
    if (user && !loading && !hasRedirected.current && isInitialized.current) {
      const currentPath = window.location.pathname;
      
      // Only redirect from these specific paths
      const shouldRedirect = [
        '/dashboard/statistics',
        '/dashboard',
        '/'
      ].includes(currentPath);
      
      if (shouldRedirect) {
        hasRedirected.current = true;
        const expectedDashboard = getDefaultDashboard(user.role);
        console.log(`Redirecting ${user.role} from ${currentPath} to ${expectedDashboard}`);
        router.push(expectedDashboard);
      }
    }
  }, [user, loading, router]);

  const loginWithOAuth = (provider: 'github' | 'microsoft') => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/register', { email, password, displayName, role});

      const newToken = data.data.token;

      Cookies.set('token', newToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      setToken(newToken);
      hasRedirected.current = true;
      isInitialized.current = false; // Reset for new user

    } catch (error) {
      console.error('SignUp Error:', error);
      throw error;
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data } = await api.post('/auth/login', { email, password });

      const newToken = data.data.token;

      Cookies.set('token', newToken, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      setToken(newToken);
      hasRedirected.current = true;
      isInitialized.current = false; // Reset for new user
      
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    hasRedirected.current = false;
    isInitialized.current = false;
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
