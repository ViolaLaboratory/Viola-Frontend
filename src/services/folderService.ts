/**
 * Folder Service
 * Manages folders (pitch projects) and their tracks in localStorage
 */

export interface Folder {
  id: string;
  name: string;
  trackIds: string[]; // Array of track IDs
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'viola_folders';
const DEFAULT_FOLDERS: Folder[] = [
  {
    id: '1',
    name: 'Stranger Things',
    trackIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    name: 'The White Lotus',
    trackIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    name: "Now You See Me: Now You Don't",
    trackIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '4',
    name: 'Adidas',
    trackIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '5',
    name: 'Lego Batman',
    trackIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * Get all folders from localStorage
 */
export const getFolders = (): Folder[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default folders if nothing exists
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FOLDERS));
    return DEFAULT_FOLDERS;
  } catch (error) {
    console.error('Error loading folders:', error);
    return DEFAULT_FOLDERS;
  }
};

/**
 * Save folders to localStorage
 */
export const saveFolders = (folders: Folder[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
  } catch (error) {
    console.error('Error saving folders:', error);
  }
};

/**
 * Create a new folder
 */
export const createFolder = (name: string): Folder => {
  const folders = getFolders();
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name: name.trim(),
    trackIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  folders.push(newFolder);
  saveFolders(folders);
  return newFolder;
};

/**
 * Get a folder by ID
 */
export const getFolderById = (id: string): Folder | null => {
  const folders = getFolders();
  return folders.find(f => f.id === id) || null;
};

/**
 * Update folder name
 */
export const updateFolderName = (id: string, name: string): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === id);
  if (folder) {
    folder.name = name.trim();
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Add track IDs to a folder
 */
export const addTracksToFolder = (folderId: string, trackIds: string[]): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    // Add track IDs that don't already exist
    const newTrackIds = trackIds.filter(id => !folder.trackIds.includes(id));
    folder.trackIds = [...folder.trackIds, ...newTrackIds];
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Remove track IDs from a folder
 */
export const removeTracksFromFolder = (folderId: string, trackIds: string[]): void => {
  const folders = getFolders();
  const folder = folders.find(f => f.id === folderId);
  if (folder) {
    folder.trackIds = folder.trackIds.filter(id => !trackIds.includes(id));
    folder.updatedAt = Date.now();
    saveFolders(folders);
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = (id: string): void => {
  const folders = getFolders();
  const filtered = folders.filter(f => f.id !== id);
  saveFolders(filtered);
};


