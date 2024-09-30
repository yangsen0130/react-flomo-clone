// ./src/components/ManageTags.tsx
import React, { useState } from 'react';
import { Tag } from '../services/blogService';
import { createTag, addTagToBlog, removeTagFromBlog } from '../services/blogService';
import { LeanCloudError } from '../services/authService';

interface ManageTagsProps {
  blogId: string;
  allTags: Tag[];
  blogTags: Tag[];
  onClose: () => void;
  onTagsUpdated: () => void;
}

const ManageTags: React.FC<ManageTagsProps> = ({
  blogId,
  allTags,
  blogTags,
  onClose,
  onTagsUpdated,
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(blogTags.map((tag) => tag.objectId));
  const [newTagName, setNewTagName] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>(allTags);
  const [message, setMessage] = useState('');

  const handleToggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSaveTags = async () => {
    setMessage('');
    try {
      const currentTagIds = blogTags.map((tag) => tag.objectId);
      const tagsToRemove = currentTagIds.filter((id) => !selectedTags.includes(id));
      const tagsToAdd = selectedTags.filter((id) => !currentTagIds.includes(id));

      // Remove tags
      for (const tagId of tagsToRemove) {
        await removeTagFromBlog(blogId, tagId);
      }

      // Add tags
      for (const tagId of tagsToAdd) {
        await addTagToBlog(blogId, tagId);
      }

      onTagsUpdated(); // Refresh data in parent component
      onClose();
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      setMessage(leanCloudError.error || 'Failed to manage tags.');
    }
  };

  const handleCreateTag = async () => {
    setMessage('');
    try {
      if (!newTagName.trim()) {
        setMessage('Tag name cannot be empty.');
        return;
      }
      const newTag = await createTag(newTagName.trim());
      setAvailableTags([...availableTags, newTag]);
      setSelectedTags([...selectedTags, newTag.objectId]);
      setNewTagName('');
    } catch (error) {
      const leanCloudError = error as LeanCloudError;
      setMessage(leanCloudError.error || 'Failed to create tag.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <strong>Select Tags:</strong>
        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
          {availableTags.map((tag) => (
            <label key={tag.objectId} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.objectId)}
                onChange={() => handleToggleTag(tag.objectId)}
                className="mr-2"
              />
              {tag.name}
            </label>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <strong>Create New Tag:</strong>
        <div className="flex mt-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="flex-grow px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="New tag name"
          />
          <button
            type="button"
            onClick={handleCreateTag}
            className="ml-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
          >
            Add
          </button>
        </div>
      </div>
      {message && <p className="text-red-500 mb-2">{message}</p>}
      <div className="flex justify-end space-x-2">
        <button
          onClick={onClose}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveTags}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ManageTags;