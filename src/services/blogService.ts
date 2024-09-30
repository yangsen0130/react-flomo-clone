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
  title: string;
  content: string;
  createdAt: string;
  tags?: Tag[];
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
        where: JSON.stringify({
          author: { __type: 'Pointer', className: '_User', objectId: userId },
        }),
        order: '-createdAt',
      },
    });
    const blogs = response.data.results;

    // Fetch tags for each blog
    for (const blog of blogs) {
      const tags = await getTagsForBlog(blog.objectId);
      blog.tags = tags;
    }

    // Verify content field
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

export const createBlog = async (title: string, content: string): Promise<Blog> => {
  const sessionToken = localStorage.getItem('sessionToken');
  if (!sessionToken) {
    throw { error: 'No session token found' } as LeanCloudError;
  }

  try {
    const response = await api.post(
      '/1.1/classes/Blog',
      {
        title,
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
    response.data.title = title;
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
  title: string,
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
        title,
        content,
      },
      {
        headers: { 'X-LC-Session': sessionToken },
      }
    );
    response.data.content = content;
    response.data.title = title;
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