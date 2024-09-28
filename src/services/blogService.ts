import axios from 'axios';
import { LeanCloudError } from './authService';

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

export interface Blog {
  objectId: string;
  title: string;
  content: string;
  createdAt: string;
}

export const getUserBlogs = async (userId: string): Promise<Blog[]> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const response = await api.get('/1.1/classes/Blog', {
      headers: { 'X-LC-Session': sessionToken },
      params: {
        where: JSON.stringify({ author: { "__type": "Pointer", "className": "_User", "objectId": userId } }),
        order: '-createdAt'
      }
    });
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};