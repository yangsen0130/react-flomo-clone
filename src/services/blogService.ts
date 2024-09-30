import axios from 'axios';
import { LeanCloudError, getCurrentUserId } from './authService'; // 确保引入 getCurrentUserId

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
    // 验证每个博客对象是否包含 content 字段
    if (response.data.results) {
      response.data.results.forEach((blog: any) => {
        if (typeof blog.content !== 'string') {
          console.warn(`Blog with objectId ${blog.objectId} is missing 'content' field.`);
          blog.content = ''; // 赋予默认值以防止错误
        }
      });
    }
    return response.data.results;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

// 新增: 创建博客
export const createBlog = async (title: string, content: string): Promise<Blog> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const response = await api.post('/1.1/classes/Blog', {
      title,
      content,
      author: {
        "__type": "Pointer",
        "className": "_User",
        "objectId": getCurrentUserId()
      },
    }, {
      headers: { 'X-LC-Session': sessionToken }
    });
    // 确保 response.data 包含 content 字段
    response.data.content = content;
    response.data.title =  title;
    // if (typeof response.data.content !== 'string') {
    //   console.warn(`Created blog is missing 'content' field.`);
    //   response.data.content = '';
    // }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

// 新增: 更新博客
export const updateBlog = async (blogId: string, title: string, content: string): Promise<Blog> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const response = await api.put(`/1.1/classes/Blog/${blogId}`, {
      title,
      content
    }, {
      headers: { 'X-LC-Session': sessionToken }
    });
    // 确保 response.data 包含 content 字段
    response.data.content = content;
    response.data.title =  title;
    // if (typeof response.data.content !== 'string') {
    //   console.warn(`Updated blog is missing 'content' field.`);
    //   response.data.content = '';
    // }
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

// 新增: 删除博客
export const deleteBlog = async (blogId: string): Promise<void> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    await api.delete(`/1.1/classes/Blog/${blogId}`, {
      headers: { 'X-LC-Session': sessionToken }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};