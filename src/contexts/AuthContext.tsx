import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login as authLogin, logout as authLogout, register as authRegister } from '../services/authService';
// import { LeanCloudError } from '../services/authService';

interface User {
  objectId: string;
  email: string;
  emailVerified: boolean;
  // 添加其他需要的用户字段
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      if (sessionToken) {
        try {
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          setUser(null);
          localStorage.removeItem('sessionToken');
        }
      }
      setLoading(false);
    };
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userData = await authLogin(email, password);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      await authRegister(email, password);
      // 注册后可以选择自动登录或提示用户登录
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};