# MongoDB Backend API Setup Guide

To display all 7,997 songs from your MongoDB database, you need to create a backend API endpoint.

## MongoDB Database Structure

Based on your MongoDB Atlas setup:
- **Database**: `fma_small`
- **Collection**: `extracted_meta_data`
- **Total Documents**: 7,997
- **Fields**: `track_id`, `title`, `genre_top`, `name` (artist)

## Required Backend Endpoint

### Endpoint: `GET /api/music/songs/`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Expected Response Format:**

```json
{
  "results": [
    {
      "track_id": 4102,
      "title": "Herasinkuoleena",
      "genre_top": "International",
      "name": "Polka Madre"
    }
  ],
  "total": 7997,
  "page": 1,
  "limit": 50
}
```

Or a simple array:
```json
[
  {
    "track_id": 4102,
    "title": "Herasinkuoleena",
    "genre_top": "International",
    "name": "Polka Madre"
  }
]
```

## Django Backend Implementation Example

If you're using Django, create this endpoint:

```python
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from pymongo import MongoClient
from django.conf import settings

@api_view(['GET'])
def get_songs(request):
    page = int(request.GET.get('page', 1))
    limit = int(request.GET.get('limit', 50))
    skip = (page - 1) * limit
    
    # Connect to MongoDB
    client = MongoClient(settings.MONGODB_URI)
    db = client['fma_small']
    collection = db['extracted_meta_data']
    
    # Get total count
    total = collection.count_documents({})
    
    # Fetch paginated songs
    songs = list(collection.find({}).skip(skip).limit(limit))
    
    # Convert ObjectId to string and format response
    results = []
    for song in songs:
        results.append({
            'track_id': song.get('track_id'),
            'title': song.get('title'),
            'genre_top': song.get('genre_top'),
            'name': song.get('name'),
            'id': str(song.get('_id')),
        })
    
    return Response({
        'results': results,
        'total': total,
        'page': page,
        'limit': limit
    })
```

## Alternative: MongoDB Atlas Data API

If you have MongoDB Atlas Data API enabled, you can use it directly from the frontend. Update the API endpoint in `src/config/api.ts` to use the Data API endpoint.

## Testing

Once your backend is running:

1. Test the endpoint: `curl http://localhost:8000/api/music/songs/?page=1&limit=50`
2. Check the browser console for API calls
3. The frontend will automatically display songs from MongoDB

## Current Status

The frontend is configured to:
- Fetch from `http://localhost:8000/api/music/songs/`
- Handle pagination (50 songs per page)
- Map MongoDB fields (`track_id`, `title`, `genre_top`, `name`) to the UI
- Fall back to ChromaDB if MongoDB API is unavailable

