// ./src/services/authService.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const APP_ID = process.env.REACT_APP_APP_ID;
const APP_KEY = process.env.REACT_APP_APP_KEY;

if (!API_BASE_URL || !APP_ID || !APP_KEY) {
  throw new Error('Missing environment variables');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'X-LC-Id': APP_ID,
    'X-LC-Key': APP_KEY,
    'Content-Type': 'application/json',
  },
});

export interface LeanCloudError {
  code: number;
  error: string;
}

export interface User {
  objectId: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  // 根据需要添加更多字段
}

export const register = async (email: string, password: string): Promise<void> => {
  try {
    await api.post('/1.1/users', { email, password, username: email });
    await api.post('/1.1/requestEmailVerify', { email });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/1.1/login', { email, password });
    if (!response.data.emailVerified) {
      throw { error: 'Please verify your email before logging in.' } as LeanCloudError;
    }
    localStorage.setItem('sessionToken', response.data.sessionToken);
    localStorage.setItem('userData', JSON.stringify(response.data)); // 存储用户数据
    return {
      objectId: response.data.objectId,
      email: response.data.email,
      emailVerified: response.data.emailVerified,
      createdAt: response.data.createdAt,
      // 添加更多字段
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    const response = await api.get('/1.1/users/me', {
      headers: { 'X-LC-Session': sessionToken },
    });
    return {
      objectId: response.data.objectId,
      email: response.data.email,
      emailVerified: response.data.emailVerified,
      createdAt: response.data.createdAt,
      // 添加更多字段
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('userData'); // 移除用户数据
};

export const getCurrentUserId = (): string => {
  const userData = localStorage.getItem('userData');
  if (!userData) {
    throw { error: 'No user data found' } as LeanCloudError;
  }
  const user = JSON.parse(userData);
  return user.objectId;
};