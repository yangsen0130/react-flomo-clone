// ./src/services/blogService.ts
import axios from 'axios';
import { LeanCloudError, getCurrentUserId } from './authService';

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

export interface Tag {
  objectId: string;
  name: string;
}

export interface Blog {
  objectId: string;
  content: string;
  createdAt: string;
  tags?: Tag[];
}

export const getUserBlogs = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<Blog[]> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const skip = (page - 1) * limit;
    const response = await api.get('/1.1/classes/Blog', {
      headers: { 'X-LC-Session': sessionToken },
      params: {
        where: JSON.stringify({
          author: { __type: 'Pointer', className: '_User', objectId: userId },
        }),
        order: '-createdAt',
        limit,
        skip,
      },
    });
    const blogs = response.data.results;

    // Fetch tags for each blog
    for (const blog of blogs) {
      const tags = await getTagsForBlog(blog.objectId);
      blog.tags = tags;
    }

    // Ensure content field exists
    if (blogs) {
      blogs.forEach((blog: any) => {
        if (typeof blog.content !== 'string') {
          console.warn(`Blog with objectId ${blog.objectId} is missing 'content' field.`);
          blog.content = ''; // Assign default value to prevent errors
        }
      });
    }
    return blogs;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const getTagsForBlog = async (blogId: string): Promise<Tag[]> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    const response = await api.get('/1.1/classes/Blog_Tags', {
      headers: { 'X-LC-Session': sessionToken },
      params: {
        where: JSON.stringify({
          blog_id: {
            __type: 'Pointer',
            className: 'Blog',
            objectId: blogId,
          },
        }),
        include: 'tag_id',
      },
    });
    const blogTags = response.data.results;
    const tags: Tag[] = blogTags.map((blogTag: any) => {
      const tag = blogTag.tag_id;
      return {
        objectId: tag.objectId,
        name: tag.name,
      };
    });
    return tags;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const addTagToBlog = async (blogId: string, tagId: string): Promise<void> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    await api.post(
      '/1.1/classes/Blog_Tags',
      {
        blog_id: {
          __type: 'Pointer',
          className: 'Blog',
          objectId: blogId,
        },
        tag_id: {
          __type: 'Pointer',
          className: 'Tag',
          objectId: tagId,
        },
      },
      {
        headers: { 'X-LC-Session': sessionToken },
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const removeTagFromBlog = async (blogId: string, tagId: string): Promise<void> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    // Find the Blog_Tags object to delete
    const response = await api.get('/1.1/classes/Blog_Tags', {
      headers: { 'X-LC-Session': sessionToken },
      params: {
        where: JSON.stringify({
          blog_id: {
            __type: 'Pointer',
            className: 'Blog',
            objectId: blogId,
          },
          tag_id: {
            __type: 'Pointer',
            className: 'Tag',
            objectId: tagId,
          },
        }),
      },
    });
    const results = response.data.results;
    if (results.length > 0) {
      const blogTagId = results[0].objectId;
      await api.delete(`/1.1/classes/Blog_Tags/${blogTagId}`, {
        headers: { 'X-LC-Session': sessionToken },
      });
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const createTag = async (name: string): Promise<Tag> => {
  const sessionToken = localStorage.getItem('sessionToken');
  const userId = getCurrentUserId();
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    const response = await api.post(
      '/1.1/classes/Tag',
      {
        name,
        creator: {
          __type: 'Pointer',
          className: '_User',
          objectId: userId,
        },
      },
      {
        headers: { 'X-LC-Session': sessionToken },
      }
    );
    return {
      objectId: response.data.objectId,
      name,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const getAllTags = async (): Promise<Tag[]> => {
  const sessionToken = localStorage.getItem('sessionToken');
  const userId = getCurrentUserId();
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }
  try {
    const response = await api.get('/1.1/classes/Tag', {
      headers: { 'X-LC-Session': sessionToken },
      params: {
        where: JSON.stringify({
          creator: {
            __type: 'Pointer',
            className: '_User',
            objectId: userId,
          },
        }),
        order: 'name',
      },
    });
    const tags: Tag[] = response.data.results.map((tag: any) => ({
      objectId: tag.objectId,
      name: tag.name,
    }));
    return tags;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const createBlog = async (content: string): Promise<Blog> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const response = await api.post(
      '/1.1/classes/Blog',
      {
        content,
        author: {
          __type: 'Pointer',
          className: '_User',
          objectId: getCurrentUserId(),
        },
      },
      {
        headers: { 'X-LC-Session': sessionToken },
      }
    );
    response.data.content = content;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const updateBlog = async (
  blogId: string,
  content: string
): Promise<Blog> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const response = await api.put(
      `/1.1/classes/Blog/${blogId}`,
      {
        content,
      },
      {
        headers: { 'X-LC-Session': sessionToken },
      }
    );
    response.data.content = content;
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const deleteBlog = async (blogId: string): Promise<void> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    await api.delete(`/1.1/classes/Blog/${blogId}`, {
      headers: { 'X-LC-Session': sessionToken },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};

export const getBlogCountsByDate = async (
  userId: string,
  days: number = 84
): Promise<{ [date: string]: number }> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (days - 1)); // start from days ago

  try {
    // Fetch all blogs created by the user in the last 'days' days
    const response = await api.get('/1.1/classes/Blog', {
      headers: { 'X-LC-Session': sessionToken },
      params: {
        where: JSON.stringify({
          author: { __type: 'Pointer', className: '_User', objectId: userId },
          createdAt: { '$gte': { '__type': 'Date', 'iso': startDate.toISOString() } },
        }),
        order: 'createdAt', // ascending order
        limit: 1000, // Adjust as needed
      },
    });

    const blogs = response.data.results;

    // Initialize counts for each day in the range
    const counts: { [date: string]: number } = {};
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().slice(0, 10); // yyyy-mm-dd
      counts[dateString] = 0;
    }

    // Count blogs per day
    for (const blog of blogs) {
      const dateString = new Date(blog.createdAt).toISOString().slice(0, 10);
      if (counts[dateString] !== undefined) {
        counts[dateString]++;
      }
    }

    return counts;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const leanCloudError = error.response?.data as LeanCloudError;
      throw leanCloudError;
    }
    throw error;
  }
};