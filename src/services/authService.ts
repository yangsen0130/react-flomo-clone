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

export interface LeanCloudErrorResponse {
  code: number;
  error: string;
}

export class LeanCloudError extends Error implements LeanCloudErrorResponse {
  code: number;
  error: string;

  constructor(message: string, code: number) {
    super(message);
    this.name = 'LeanCloudError';
    this.code = code;
    this.error = message;
  }
}

export interface User {
  objectId: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  // Add other user fields as needed
}

export const register = async (email: string, password: string): Promise<void> => {
  try {
    await api.post('/1.1/users', { email, password, username: email });
    await api.post('/1.1/requestEmailVerify', { email });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const leanCloudErrorData = error.response.data as LeanCloudErrorResponse;
      throw new LeanCloudError(leanCloudErrorData.error, leanCloudErrorData.code);
    }
    throw error;
  }
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/1.1/login', { email, password });
    if (!response.data.emailVerified) {
      throw new LeanCloudError('Please verify your email before logging in.', 401);
    }
    localStorage.setItem('sessionToken', response.data.sessionToken);
    localStorage.setItem('userData', JSON.stringify(response.data)); // Store user data
    return {
      objectId: response.data.objectId,
      email: response.data.email,
      emailVerified: response.data.emailVerified,
      createdAt: response.data.createdAt,
      // Add more fields as needed
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const leanCloudErrorData = error.response.data as LeanCloudErrorResponse;
      throw new LeanCloudError(leanCloudErrorData.error, leanCloudErrorData.code);
    }
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw new LeanCloudError('No session token found', 401);
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
      // Add more fields as needed
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const leanCloudErrorData = error.response.data as LeanCloudErrorResponse;
      throw new LeanCloudError(leanCloudErrorData.error, leanCloudErrorData.code);
    }
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('sessionToken');
  localStorage.removeItem('userData'); // Remove user data
};

export const getCurrentUserId = (): string => {
  const userData = localStorage.getItem('userData');
  if (!userData) {
    throw new LeanCloudError('No user data found', 401);
  }
  const user = JSON.parse(userData);
  return user.objectId;
};