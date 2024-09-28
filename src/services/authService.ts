import axios, { AxiosError } from 'axios';

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

export const register = async (email: string, password: string) => {
  try {
    const response = await api.post('/1.1/users', { email, password, username: email });
    await api.post('/1.1/requestEmailVerify', { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/1.1/login', { email, password });
    if (!response.data.emailVerified) {
      throw { error: 'Please verify your email before logging in.' } as LeanCloudError;
    }
    localStorage.setItem('sessionToken', response.data.sessionToken);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const getCurrentUser = async () => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    const response = await api.get('/1.1/users/me', {
      headers: { 'X-LC-Session': sessionToken },
    });
    return response.data;
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
};

