/**
 * Chat History Service
 * Manages persistent storage of chat sessions in localStorage
 *
 * STORAGE KEY: 'viola_chat_history'
 * MAX SESSIONS: 50 (oldest sessions are automatically removed)
 */

export interface ChatSession {
  id: string;                    // Unique UUID for this chat session
  title: string;                 // Display title (first query, truncated to 50 chars)
  query: string;                 // Original search query
  sessionId: string;             // Backend session ID for API continuity
  conversationHistory: Array<{   // Full conversation between user and bot
    role: 'user' | 'bot';
    message: string;
  }>;
  resultCount: number;           // Number of tracks found
  searchResults?: Array<{        // Saved search results to restore
    id: number;
    title: string;
    artist: string;
    album: string;
    keywords: string[];
    duration: string;
  }>;
  selectedSongId?: number;        // ID of the currently selected song in details view
  createdAt: number;             // Timestamp (Date.now())
  updatedAt: number;             // Timestamp (Date.now())
}

const STORAGE_KEY = 'viola_chat_history';
const MAX_SESSIONS = 50;

/**
 * Get all chat sessions from localStorage
 * @returns Array of ChatSession objects, sorted by most recent first
 */
export const getChatHistory = (): ChatSession[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const sessions: ChatSession[] = JSON.parse(stored);

    // Sort by updatedAt (most recent first)
    return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Error reading chat history:', error);
    return [];
  }
};

/**
 * Save or update a chat session
 * Automatically cleans up old sessions if MAX_SESSIONS is exceeded
 * @param session - ChatSession object to save
 */
export const saveChatSession = (session: ChatSession): void => {
  try {
    const sessions = getChatHistory();

    // Check if session already exists (update case)
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      // Update existing session
      sessions[existingIndex] = session;
    } else {
      // Add new session at the beginning
      sessions.unshift(session);
    }

    // Keep only the most recent MAX_SESSIONS
    const toKeep = sessions.slice(0, MAX_SESSIONS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toKeep));
  } catch (error) {
    console.error('Error saving chat session:', error);
  }
};

/**
 * Delete a specific chat session
 * @param id - Session ID to delete
 */
export const deleteChatSession = (id: string): void => {
  try {
    const sessions = getChatHistory();
    const filtered = sessions.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting chat session:', error);
  }
};

/**
 * Get a specific chat session by ID
 * @param id - Session ID to retrieve
 * @returns ChatSession object or null if not found
 */
export const getChatSessionById = (id: string): ChatSession | null => {
  try {
    const sessions = getChatHistory();
    return sessions.find(s => s.id === id) || null;
  } catch (error) {
    console.error('Error getting chat session:', error);
    return null;
  }
};

/**
 * Clear all chat history (useful for debugging or user preference)
 */
export const clearChatHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};
