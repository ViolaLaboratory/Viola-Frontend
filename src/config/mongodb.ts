/**
 * MongoDB Configuration
 * 
 * WARNING: MongoDB connection should ONLY be used in the backend.
 * Never expose MongoDB credentials in the frontend code.
 * 
 * This file is for reference only - actual MongoDB operations
 * should be performed through your backend API.
 */

// MongoDB connection string (for backend reference only)
export const MONGODB_CONFIG = {
  // DO NOT use this directly in frontend - use backend API instead
  CONNECTION_STRING: import.meta.env.VITE_MONGODB_URL || 
    'mongodb+srv://kimkyungtae12386_db_user:yBCn4hYANtHb3zRI@viola.x07ascb.mongodb.net/?appName=viola',
};

/**
 * Note: To fetch track details from MongoDB, use your backend API endpoint:
 * GET /api/music/tracks/:trackId
 * 
 * The backend should handle MongoDB connections securely.
 */

export default MONGODB_CONFIG;

