// ./src/contexts/TagsContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Tag, getAllTags } from '../services/blogService';
import { LeanCloudError } from '../services/authService';

interface TagsContextType {
  tags: Tag[];
  refreshTags: () => void;
}

export const TagsContext = createContext<TagsContextType>({
  tags: [],
  refreshTags: () => {},
});

export const TagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  const fetchTags = async () => {
    try {
      const allTags = await getAllTags();
      setTags(allTags);
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      console.error('Failed to fetch tags:', leanCloudError.error || error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const refreshTags = () => {
    fetchTags();
  };

  return (
    <TagsContext.Provider value={{ tags, refreshTags }}>
      {children}
    </TagsContext.Provider>
  );
};