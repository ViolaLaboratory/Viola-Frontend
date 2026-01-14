import { useState, useEffect, useCallback } from "react";
import { ArrowUp, Play, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import API_ENDPOINTS from "@/config/api";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  licensing: string;
  duration: string;
  thumbnail: string;
  views?: string;
}

interface BackendTrack {
  id?: number | string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  mood?: string;
  licensing?: string;
  duration?: string;
  thumbnail?: string;
}

interface CatalogResponse {
  results?: BackendTrack[];
  pagination?: {
    total_pages?: number;
  };
}

// Default/fallback songs
const defaultSongs: Song[] = [
  {
    id: 1,
    title: "new Phone, new Me",
    artist: "Neon District",
    album: "Chromatic Bloom",
    genre: "Pop",
    mood: "Upbeat",
    licensing: "Standard",
    duration: "2:09",
    thumbnail: "🎵",
    views: "524,424,511",
  },
  {
    id: 2,
    title: "Up the Score",
    artist: "Tidal Echo",
    album: "Heartline",
    genre: "Pop",
    mood: "Energetic",
    licensing: "Premium",
    duration: "2:30",
    thumbnail: "🎵",
    views: "10,117,807",
  },
  {
    id: 3,
    title: "Z Branch",
    artist: "City Lanterns",
    album: "After Hours",
    genre: "R&B",
    mood: "Chill",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "5,938,875",
  },
  {
    id: 4,
    title: "Right Here",
    artist: "Blushing Violet",
    album: "Midnight Bloom",
    genre: "Hip Hop",
    mood: "Intense",
    licensing: "Premium",
    duration: "2:31",
    thumbnail: "🎵",
    views: "135,604,979",
  },
  {
    id: 5,
    title: "John Wick",
    artist: "Axiom Fields",
    album: "Nocturne Drive",
    genre: "Electronic",
    mood: "Dark",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "2,966,803",
  },
  {
    id: 6,
    title: "Midnight Dreams",
    artist: "Nova Saffron",
    album: "Violet Echoes",
    genre: "Ambient",
    mood: "Relaxing",
    licensing: "Premium",
    duration: "3:15",
    thumbnail: "🎵",
  },
  {
    id: 7,
    title: "Electric Pulse",
    artist: "Phase Runner",
    album: "Circuit Bloom",
    genre: "EDM",
    mood: "Energetic",
    licensing: "Standard",
    duration: "2:45",
    thumbnail: "🎵",
  },
  {
    id: 8,
    title: "Summer Breeze",
    artist: "Golden Sands",
    album: "Evershine",
    genre: "Indie",
    mood: "Happy",
    licensing: "Premium",
    duration: "3:20",
    thumbnail: "🎵",
  },
  {
    id: 9,
    title: "Harbor Lights",
    artist: "Selene Ward",
    album: "Blue Harbour",
    genre: "Indie",
    mood: "Dreamy",
    licensing: "Standard",
    duration: "3:08",
    thumbnail: "🎵",
    views: "1,245,998",
  },
  {
    id: 10,
    title: "Carbon Pulse",
    artist: "Riot Satellite",
    album: "Neo Arc",
    genre: "Electronic",
    mood: "Hype",
    licensing: "Premium",
    duration: "2:57",
    thumbnail: "🎵",
    views: "22,110,543",
  },
  {
    id: 11,
    title: "Glasshouse",
    artist: "Lumen Choir",
    album: "Holographic Bloom",
    genre: "Alternative",
    mood: "Ethereal",
    licensing: "Standard",
    duration: "3:32",
    thumbnail: "🎵",
  },
  {
    id: 12,
    title: "Floodline",
    artist: "Compass North",
    album: "Greywater",
    genre: "Rock",
    mood: "Driving",
    licensing: "Standard",
    duration: "2:51",
    thumbnail: "🎵",
  },
  {
    id: 13,
    title: "Metallic Heart",
    artist: "Chrome Coral",
    album: "Pulse Engine",
    genre: "Synthwave",
    mood: "Moody",
    licensing: "Premium",
    duration: "3:04",
    thumbnail: "🎵",
  },
  {
    id: 14,
    title: "Dawn Patrol",
    artist: "Atlas Vega",
    album: "Skyline Shift",
    genre: "Ambient",
    mood: "Uplifting",
    licensing: "Standard",
    duration: "4:01",
    thumbnail: "🎵",
  },
  {
    id: 15,
    title: "Mercury Bloom",
    artist: "Static Bloom",
    album: "Soft Voltage",
    genre: "Pop",
    mood: "Nostalgic",
    licensing: "Premium",
    duration: "3:18",
    thumbnail: "🎵",
  },
  {
    id: 16,
    title: "Silver Thread",
    artist: "Emberline",
    album: "Handwritten Notes",
    genre: "Folk",
    mood: "Warm",
    licensing: "Standard",
    duration: "3:40",
    thumbnail: "🎵",
  },
  {
    id: 17,
    title: "Rose Quartz Run",
    artist: "Muse District",
    album: "Velvet Traces",
    genre: "R&B",
    mood: "Seductive",
    licensing: "Premium",
    duration: "2:48",
    thumbnail: "🎵",
  },
  {
    id: 18,
    title: "Night Swim",
    artist: "Hollow Isles",
    album: "Blue Static",
    genre: "Indie",
    mood: "Introspective",
    licensing: "Standard",
    duration: "3:26",
    thumbnail: "🎵",
  },
  {
    id: 19,
    title: "Ghost Metric",
    artist: "Vapor Scout",
    album: "Prism Ghosts",
    genre: "Electronic",
    mood: "Mysterious",
    licensing: "Premium",
    duration: "3:11",
    thumbnail: "🎵",
  },
  {
    id: 20,
    title: "Satellite Bloom",
    artist: "Lunar Pines",
    album: "Signal Fires",
    genre: "Alternative",
    mood: "Expansive",
    licensing: "Standard",
    duration: "4:12",
    thumbnail: "🎵",
  },
  {
    id: 21,
    title: "Crimson Paper",
    artist: "The Civic",
    album: "Letters West",
    genre: "Rock",
    mood: "Anthemic",
    licensing: "Premium",
    duration: "3:44",
    thumbnail: "🎵",
  },
  {
    id: 22,
    title: "Ivory Circuit",
    artist: "Magnet Juno",
    album: "Orbit Field",
    genre: "EDM",
    mood: "Pulsing",
    licensing: "Standard",
    duration: "2:55",
    thumbnail: "🎵",
  },
  {
    id: 23,
    title: "Paper Lantern Wolves",
    artist: "June Monsoon",
    album: "Night Market",
    genre: "Indie",
    mood: "Playful",
    licensing: "Premium",
    duration: "3:05",
    thumbnail: "🎵",
  },
  {
    id: 24,
    title: "Fever Coast",
    artist: "Desert Bloom",
    album: "Mirage Diaries",
    genre: "Pop",
    mood: "Sultry",
    licensing: "Standard",
    duration: "2:59",
    thumbnail: "🎵",
  },
  {
    id: 25,
    title: "Cerulean Static",
    artist: "Polar Isles",
    album: "Crystal Archive",
    genre: "Ambient",
    mood: "Glacial",
    licensing: "Premium",
    duration: "4:18",
    thumbnail: "🎵",
  },
  {
    id: 26,
    title: "Voltage Bloom",
    artist: "Phase Garden",
    album: "Neon Roots",
    genre: "Electronic",
    mood: "Driving",
    licensing: "Standard",
    duration: "3:00",
    thumbnail: "🎵",
  },
  {
    id: 27,
    title: "Sable Skyline",
    artist: "Echo Harbor",
    album: "Anthracite",
    genre: "Alternative",
    mood: "Brooding",
    licensing: "Premium",
    duration: "3:29",
    thumbnail: "🎵",
  },
  {
    id: 28,
    title: "Sunset Static",
    artist: "Pacific Relay",
    album: "Signal Orange",
    genre: "Indie",
    mood: "Carefree",
    licensing: "Standard",
    duration: "3:14",
    thumbnail: "🎵",
  },
  {
    id: 29,
    title: "Monochrome Bloom",
    artist: "Retro Courier",
    album: "Analog Atlas",
    genre: "Synthwave",
    mood: "Cinematic",
    licensing: "Premium",
    duration: "3:47",
    thumbnail: "🎵",
  },
  {
    id: 30,
    title: "Drift Theory",
    artist: "Cascade 94",
    album: "Outer Bloom",
    genre: "Ambient",
    mood: "Serene",
    licensing: "Standard",
    duration: "4:26",
    thumbnail: "🎵",
  },
];

export const MusicCatalog = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 30; // Show 30 songs per page in the catalog

  // Load songs from MongoDB backend API with pagination
  const loadSongsFromBackend = useCallback(async (page: number = 1) => {
    try {
      const response = await fetch(API_ENDPOINTS.SONGS_LIST(page, pageSize));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: CatalogResponse = await response.json();
      const fetchedTracks = data.results ?? [];
      const pagination = data.pagination ?? {};

      const catalogSongs: Song[] = fetchedTracks.map((track) => {
        const songId = track.id || "0";
        const songIdNum =
          typeof songId === "string" ? parseInt(songId) || 0 : songId;

        return {
          id: songIdNum,
          title: track.title || "Unknown Title",
          artist: track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          genre: track.genre || "Unknown",
          mood: track.mood || "Unknown",
          licensing: track.licensing || "Standard",
          duration: track.duration || "03:00",
          thumbnail: track.thumbnail || "🎵",
        };
      });

      // Replace current page of songs
      setSongs(catalogSongs);

      // Use pagination info from backend when available
      const totalPagesCount = pagination.total_pages || page;
      setTotalPages(totalPagesCount);
      setError(null);
      return true;
    } catch (error) {
      console.error('Error loading from backend:', error);
      return false;
    }
  }, [pageSize]);

  const loadSongs = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoading(true);
    setError(null);
    
    // Use backend API to fetch from MongoDB
    const success = await loadSongsFromBackend(page);
    
    if (!success && !append) {
      setSongs([]);
      setError('Failed to load songs from MongoDB. Please check your connection.');
    }
    
    setIsLoading(false);
  }, [loadSongsFromBackend]);

  useEffect(() => {
    loadSongs(1, false);
  }, [loadSongs]);

  const handlePageChange = (page: number) => {
    if (page === currentPage || page < 1 || page > totalPages || isLoading) {
      return;
    }
    setCurrentPage(page);
    loadSongs(page, false);
  };

  const getPageNumbers = () => {
    const maxVisible = 7;
    let start = Math.max(1, currentPage - 3);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <section className="w-full min-h-screen text-white font-exo">
      <div className="min-h-screen w-full px-10 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-dm">Your Catalog</h1>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/20 bg-black/40 backdrop-blur-[26px] p-6 shadow-[0_0_28px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-6 rounded-full border border-white/30 bg-black/40 px-6 py-3 shadow-[inset_0_0_24px_rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-4 text-white/70">
              <img src="/flower.png" alt="Search" className="h-5 w-5" />
              <span className="text-sm">Your next song is found when you type...</span>
            </div>
            <button
              type="button"
              className="h-10 w-10 rounded-full bg-white text-black flex items-center justify-center"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-white/70">
              <Loader2 className="h-8 w-8 animate-spin text-white/70" />
              <p className="ml-3">Loading catalog from MongoDB...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <p className="text-red-300 mb-4 text-center">{error}</p>
              <Button
                onClick={() => loadSongs(1, false)}
                variant="outline"
                className="bg-transparent border-white/30 text-white hover:bg-white/10"
              >
                Retry
              </Button>
            </div>
          ) : songs.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-white/60">No songs found.</p>
            </div>
          ) : (
            <>
              <div className="mt-8 grid grid-cols-[60px_90px_1fr_1fr_1fr_140px_140px_120px_120px] gap-4 px-2 text-sm text-white/70 font-dm">
                <div>#</div>
                <div></div>
                <div>Title</div>
                <div>Artist</div>
                <div>Album</div>
                <div className="text-center">Genre</div>
                <div className="text-center">Mood</div>
                <div className="text-center">Duration</div>
                <div className="text-center">Details</div>
              </div>

              <div className="mt-4 space-y-3">
                {songs.map((song, index) => (
                  <div
                    key={song.id}
                    className="grid grid-cols-[60px_90px_1fr_1fr_1fr_140px_140px_120px_120px] gap-4 items-center rounded-xl border border-white/20 bg-black/40 px-4 py-3 shadow-[0_0_22px_rgba(0,0,0,0.35)]"
                  >
                    <div className="text-white/80 font-dm">
                      {(currentPage - 1) * pageSize + index + 1}
                    </div>
                    <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center">
                      {song.thumbnail}
                    </div>
                    <div className="text-white">{song.title}</div>
                    <div className="text-white/80">{song.artist}</div>
                    <div className="text-white/80">{song.album}</div>
                    <div className="text-center text-white/80">{song.genre}</div>
                    <div className="text-center text-white/80">{song.mood}</div>
                    <div className="text-center text-white/80 font-dm">{song.duration}</div>
                    <div className="flex items-center justify-center gap-3 text-sm text-white/70">
                      <span>See more...</span>
                      <button
                        type="button"
                        className="h-6 w-6 rounded-full bg-white text-black flex items-center justify-center"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/60">
                <span>
                  Page {currentPage} of {totalPages} • Showing {songs.length} songs per page
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || isLoading}
                  >
                    ‹
                  </Button>
                  {getPageNumbers().map((page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-8 rounded-full px-0 ${
                        page === currentPage
                          ? "bg-white text-black border-transparent"
                          : "bg-transparent border-white/20 text-white hover:bg-white/10"
                      }`}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-40"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    ›
                  </Button>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-white/15 bg-black/50 px-6 py-3 shadow-[0_0_18px_rgba(0,0,0,0.35)]">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-white/10 flex items-center justify-center">
                      🎵
                    </div>
                    <div>
                      <div className="text-white">Song Title</div>
                      <div className="text-white/60 text-sm">Artist Name</div>
                      <div className="text-white/60 text-sm">Album Name</div>
                    </div>
                  </div>
                  <div className="flex-1 px-6">
                    <div className="relative h-[3px] bg-white/20 rounded-full">
                      <div className="absolute left-0 top-0 h-full w-[35%] bg-white rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60 mt-2 font-dm">
                      <span>00:00</span>
                      <span>2:37</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" className="h-9 w-9 rounded-full border border-white/40">
                      <Play className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};
