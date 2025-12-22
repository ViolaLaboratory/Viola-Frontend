import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Play, X, Check, ArrowRight } from "lucide-react";
import { PitchBuilder } from "./PitchBuilder"; // Import your existing PitchBuilder
import API_ENDPOINTS from "@/config/api";
import { fetchTrackDetailsFromMongoDB } from "@/services/trackService";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  keywords: string[];
  duration: string;

}

const mockSongs: Song[] = [
  {
    id: 1,
    title: "Into the Upside Down",
    artist: "Kyle Bobby Dunn",
    album: "Strange Atmospheres",

    keywords: ["Eerie", "Suspenseful", "Dark", "Atmospheric"],
    duration: "03:24",
    
  },
  {
    id: 2,
    title: "Forest of Shadows",
    artist: "Akira Yamaoka",
    album: "Silent Tracks",
  
    keywords: ["Horror", "Tension", "Mysterious", "Cinematic"],
    duration: "04:12",

  },
  {
    id: 3,
    title: "Moonlit Concrete",
    artist: "Midnight Highrise",
    album: "Grayscale Echoes",
    
    keywords: ["Eerie", "Industrial", "Pulse", "Noir"],
    duration: "03:12",

  },
  {
    id: 4,
    title: "Fog Ritual",
    artist: "Astra & The Veil",
    album: "Coven Choir",
   
    keywords: ["Choir", "Haunting", "Ambient", "Slow Burn"],
    duration: "04:05",

  },
  {
    id: 5,
    title: "Midnight Salt",
    artist: "Vox Meridian",
    album: "Glassheart",
    
    keywords: ["Darkwave", "Ethereal", "Cold", "Electronic"],
    duration: "03:58",

  }
];

const typingPhrases = [
  "spooky choirs...",
  "dark synths...",
  "a spicy melody...",
  "cinematic builds..."
];

const thinkingPhrases = [
  "humming along...",
  "arguing with managers...",
  "going for lunch..."
];


const availablePitches = [
  { id: 1, name: "Stranger Things", company: "Netflix", color: "bg-red-500", description: "S1E3 Woods Scene" },
  { id: 2, name: "The White Lotus", company: "HBO Max", color: "bg-purple-500", description: "Season 2 Resort Scenes" },
  { id: 3, name: "Now You See Me: Now You Don't", company: "Lionsgate", color: "bg-blue-500", description: "Magic Heist Sequences" },
  { id: 4, name: "Adidas", company: "Adidas", color: "bg-black", description: "Athletic Campaign 2024" },
  { id: 5, name: "Lego Batman", company: "Warner Bros", color: "bg-yellow-500", description: "Hero Action Scenes" }
];

export const SearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPitchBuilder, setShowPitchBuilder] = useState(false);
  const [showPitchSelection, setShowPitchSelection] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [backgroundShift, setBackgroundShift] = useState({ x: 50, y: 50 });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, message: string}>>([]);
  const [waitingForResponse, setWaitingForResponse] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xPercent = (event.clientX / innerWidth) * 100;
      const yPercent = (event.clientY / innerHeight) * 100;
      setBackgroundShift({
        x: 50 + (xPercent - 50) * 0.2,
        y: 50 + (yPercent - 50) * 0.2
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Generate or retrieve session ID
  useEffect(() => {
    const getOrCreateSessionId = () => {
      // Try to get from localStorage
      const storedSessionId = localStorage.getItem('viola_session_id');
      if (storedSessionId) {
        setSessionId(storedSessionId);
        return storedSessionId;
      }
      // Generate new UUID v4
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('viola_session_id', newSessionId);
      setSessionId(newSessionId);
      return newSessionId;
    };

    const initSession = async () => {
      const currentSessionId = getOrCreateSessionId();
      try {
        // Start conversation with "start" message
        const response = await fetch(API_ENDPOINTS.CHATBOT_CHAT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_input: "start",
            session_id: currentSessionId,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSessionId(data.session_id);
          setChatMessage(data.message);
          setConversationHistory([{ role: 'bot', message: data.message }]);
        }
      } catch (error) {
        console.error("Failed to start session:", error);
      }
    };

    initSession();
  }, []);

  const translateX = (backgroundShift.x - 50) * 0.8;
  const translateY = (backgroundShift.y - 50) * 0.8;

  const containerStyle = {
    "--bg-x": `${backgroundShift.x}%`,
    "--bg-y": `${backgroundShift.y}%`,
    "--bg-tx": `${translateX}px`,
    "--bg-ty": `${translateY}px`
  } as React.CSSProperties;

  // Fetch track details from MongoDB (falls back to ChromaDB)
  const fetchTrackDetails = async (trackIds: string[]): Promise<Song[]> => {
    try {
      const tracks = await fetchTrackDetailsFromMongoDB(trackIds);
      // Convert TrackDetails to Song format
      return tracks.map((track) => ({
        id: parseInt(track.id) || 0,
        title: track.title,
        artist: track.artist,
        album: track.album,
        keywords: track.keywords || ["Music"],
        duration: track.duration,
      }));
    } catch (error) {
      console.error("Error fetching track details:", error);
      // Fallback to placeholder songs
      return trackIds.map((id, index) => ({
        id: parseInt(id) || index + 1,
        title: `Track ${id}`,
        artist: "Unknown Artist",
        album: "Unknown Album",
        keywords: ["Music"],
        duration: "03:00",
      }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !sessionId) return;

    setIsLoading(true);
    setHasSearched(true);
    setWaitingForResponse(true);
    
    // Add user message to conversation
    const userMessage = searchQuery;
    setConversationHistory(prev => [...prev, { role: 'user', message: userMessage }]);
    
    try {
      const response = await fetch(API_ENDPOINTS.CHATBOT_CHAT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: searchQuery,
          session_id: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Store session ID
      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem('viola_session_id', data.session_id);
      }

      // Add bot response to conversation
      if (data.message) {
        setChatMessage(data.message);
        setConversationHistory(prev => [...prev, { role: 'bot', message: data.message }]);
      }

      // Check if conversation is complete and we have results
      if (data.is_complete && data.results?.results?.ids?.[0]) {
        // Extract track IDs from results
        const trackIds = data.results.results.ids[0];
        
        // Fetch track details (or use placeholders for now)
        const tracks = await fetchTrackDetails(trackIds);
        setSearchResults(tracks);
        setShowResults(true);
        setIsLoading(false);
        setWaitingForResponse(false);
      } else {
        // Conversation is still ongoing
        setIsLoading(false);
        setWaitingForResponse(false);
        setShowResults(false);
        // The chat message is already set above
      }
    } catch (error) {
      console.error("Search error:", error);
      setChatMessage("Sorry, I encountered an error. Please try again.");
      setIsLoading(false);
      setWaitingForResponse(false);
      // Fallback to showing mock results if API fails
      setSearchResults(mockSongs);
      setShowResults(true);
    }
    
    // Clear search input
    setSearchQuery("");
  };

  const [placeholderText, setPlaceholderText] = useState("Find ");
  const [thinkingText, setThinkingText] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Thinking text animation effect - runs when loading
  useEffect(() => {
    if (!isLoading) {
      setThinkingText("");
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(() => {
      const phrase = thinkingPhrases[phraseIndex];
      setThinkingText(phrase.slice(0, charIndex));

      if (!deleting) {
        charIndex++;
        if (charIndex > phrase.length) {
          deleting = true;
        }
      } else {
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % thinkingPhrases.length;
        }
      }
    }, deleting ? 90 : 100);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Placeholder text animation effect
  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(() => {
      const phrase = typingPhrases[phraseIndex];
      setPlaceholderText(`Find me ${phrase.slice(0, charIndex)}`);

      if (!deleting) {
        charIndex++;
        if (charIndex > phrase.length) {
          deleting = true;
          setTimeout(() => {}, 2000);
        }
      } else {
        charIndex--;
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % typingPhrases.length;
        }
      }
    }, deleting ? 400 : 170);

    return () => clearInterval(intervalId);
  }, []);

  const addToPitch = (song: Song) => {
    setSelectedSong(song);
    setShowPitchSelection(true);
    
    // Save track ID to localStorage for PitchBuilder
    const savedTrackIds = JSON.parse(localStorage.getItem('pitch_track_ids') || '[]');
    if (!savedTrackIds.includes(song.id.toString())) {
      savedTrackIds.push(song.id.toString());
      localStorage.setItem('pitch_track_ids', JSON.stringify(savedTrackIds));
    }
  };

  const selectPitch = (pitch: any) => {
    setShowPitchSelection(false);
    setShowPitchBuilder(true);
  };

  if (showPitchBuilder) {
    return <PitchBuilder />;
  }

  return (
    <div className="min-h-screen zen-dots fluid-bg relative overflow-hidden" style={containerStyle}>
      {/* Noise texture overlay */}
      <svg className="noise-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="300%" filter="url(#noiseFilter)" />
      </svg>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

          .zen-dots,
          .zen-dots .song-card * {
            font-family: 'Dm Sans', system-ui, sans-serif !important;
          }

          .inter {
            font-family: 'Inter', system-ui, sans-serif;
          }

          .fluid-bg {
            position: relative;
            z-index: 0;
            background-color:rgb(0, 0, 0);
          }

          .fluid-bg::before,
          .fluid-bg::after {
            content: "";
            position: fixed;
            inset: 0;
            pointer-events: none;
          }

          .fluid-bg::before {
            z-index: -2;
            background-image: url('/viola.jpg');
            background-size: 200% 200%;
            background-repeat: no-repeat;
            background-position: var(--bg-x, 50%) var(--bg-y, 50%);
            filter: blur(22px) saturate(2);
            transform: translate(var(--bg-tx, 0px), var(--bg-ty, 0px)) scale(1.3);
            transition: transform 0.35s ease-out, filter 0.3s ease;
            opacity: 0.9;
          }

          .fluid-bg::after {
            z-index: -1;
            background-image:
              radial-gradient(circle at calc(var(--bg-x, 50%) + 5%) calc(var(--bg-y, 50%) + 8%),
                rgba(255, 214, 92, 0.55),
                rgba(247, 98, 19, 0.4) 18%,
                rgba(122, 35, 204, 0.55) 42%,
                rgba(22, 4, 47, 0.8) 70%),
              radial-gradient(circle at calc(var(--bg-x, 50%) - 10%) calc(var(--bg-y, 50%) - 12%),
                rgba(0, 0, 0, 0.35),
                transparent 45%),
              linear-gradient(120deg, rgba(16, 0, 32, 0.95), rgba(45, 3, 81, 0.95));
            mix-blend-mode: screen;
            filter: blur(22px);
            opacity: 0.9;
            transform: translate(calc(var(--bg-tx, 0px) * 1.2), calc(var(--bg-ty, 0px) * 1.2));
            transition: transform 0.25s ease-out, opacity 0.3s ease-out;
            weight: 10%;
            height: 100%;
          }

          /* Noise overlay */
          .fluid-bg > .noise-overlay {
            position: fixed;
            inset: -5;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0.9;
            mix-blend-mode: overlay;
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 0.9;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          @keyframes border-glow {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          .glow-border {
            background: linear-gradient(120deg,rgba(249, 249, 249, 0.18),rgba(255, 255, 255, 0.43),rgba(202, 145, 255, 0.27),rgba(255, 210, 233, 0.4),rgba(231, 208, 255, 0.23));
            background-size: 300% 300%;
            animation: border-glow 6s linear infinite;
            padding: 1px;
            border-radius: 999px;
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.79);
          }

          .glow-border:hover {
            background: white;
            padding: 1px;
            transition: all 0.2s ease-in-out;
          }
        `}
      </style>

      {/* Loading State - Center of Screen */}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm z-40">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-6"></div>
          <p className="text-white text-lg">{thinkingText}<span className="animate-pulse">|</span></p>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        {/* Results Section - Above search when results shown */}
        {showResults && !isLoading && (
          <div className="px-6 pt-8 pb-4 animate-fade-in">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center content-start mb-6">
                <img
                  src="/flower.png"
                  alt="Viola"
                  className={`transition-all duration-900 h-12 w-12 mr-3 self-start rounded-full animate-pulse object-cover`}
                />
                <h2 className="text-2xl w-lg font-semibold">
                  Let me know if these are the top songs that sound like your search for "{searchQuery}".
                </h2>
              </div>
              <div className="flex justify-self-end mb-2">
                <p className="text-sm text-white bg-black w-fit p-3 rounded-full bg-black/80">
                    Ranked by relevance • {searchResults.length} results
                  </p>
              </div>

              <div className="space-y-3 mb-8 z-8">
                {searchResults.length > 0 ? searchResults.map((song, index) => (
                 <Card 
                 key={song.id} 
                 className="transition-all duration-500 bg-black/80 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer border hover:bg-muted/20 hover:backdrop-blur-lg"
                 onClick={() => addToPitch(song)}
                 style={{ fontFamily: 'Inter, system-ui, sans-serif !important' }}
               >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Rank Number */}
                        <div className="flex-shrink-0 w-8 text-center">
                          <span className="text-xl font-bold text-white-600">
                            {index + 1}
                          </span>
                        </div>

                        {/* Album Art Placeholder */}
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-800 to-orange-900 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <img 
                          src="/NoteAlbumArt.png"
                          alt="Album Art"
                          className="rounded-sm"
                          />
                        </div>

                        {/* Song Details */}
                        <div className="flex-1 min-w-0 inter">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{song.title}</h3>
                            <span className="text-muted-foreground italic">{song.artist}</span>  • 
                            <span className="text-foreground">{song.album}</span>
                            {/* <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {song.relevanceScore}% match
                            </Badge> */}
                          </div>
                          
                          {/* <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span>{song.producer}</span>
                            <span className="italic">{song.writer}</span>
                            <span>{song.licensing}</span>
                          </div> */}
                        </div>

                        {/* Keywords and Duration */}
                        <div className="flex items-center gap-4 z-5">
                          <div className="flex gap-2">
                            {song.keywords.slice(0, 2).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-orange-500 text-white">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                          <span className="text-foreground font-mono text-lg">{song.duration}</span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToPitch(song);
                            }}
                            className="transition all duration-600 ease-in-out bg-[#E4EA04] hover:bg-black text-black hover:text-[#E4EA04] font-medium"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Pitch
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found. Try refining your search.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface - Show when conversation is ongoing */}
        {chatMessage && !showResults && hasSearched && (
          <div className="px-6 pt-8 pb-4 animate-fade-in max-w-3xl mx-auto">
            <div className="space-y-4">
              {conversationHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === 'user'
                        ? 'bg-[#E4EA04] text-black'
                        : 'bg-white/10 text-white border border-white/20'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Section - Bottom when results shown */}
        <div
          className={`px-6 transition-all duration-700 ease-in-out ${
            hasSearched
              ? "py-4 sticky top-0 z-30"
              : "flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"
          }`}
        >
          
          {/* Title - disappears when searched */}
          {!hasSearched && (
            <h1 className="text-4xl font-light text mb-8">
              what are we making today, Michael?
            </h1>
          )}

          {/* Search Bar with purple glow */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto transition-all duration-700">
            <div className="glow-border">
              <div className="relative">
                <img
                  src="/flower.png"
                  alt="Viola"
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full object-cover transition-all duration-300 ${
                    isSearchFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  placeholder={chatMessage || placeholderText}
                  className={`h-14 text-base border-0 bg-card focus-visible:ring-white rounded-full shadow-lg hover:border-white  shadow-white-500/30 transition-all duration-300 text-white placeholder:text-white/60 ${
                    isSearchFocused ? 'pl-16 pr-14' : 'pl-6 pr-6'
                  }`}
                  disabled={isLoading}
                />
                {isLoading && (
                  <Loader2 className="absolute right-6 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-purple-500" />
                )}
                {!isLoading && isSearchFocused && (
                  <ArrowRight className={`absolute right-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white transition-all duration-300 ${
                    isSearchFocused ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
                  }`} />
                )}
              </div>
            </div>

            {/* Tagline - only visible when not searched */}
            {!hasSearched && (
              <p className="text-center text-white/30 text-sm mt-4 tracking-wide">
                locate, listen, license.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Pitch Selection Modal */}
      {showPitchSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm drop-shadow-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold font-dm">Add to Pitch</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPitchSelection(false)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4 m-2 hover:bg-[#e4ea04]" />
                </Button>
              </div>
              
              {selectedSong && (
                <div className="flex content-center gap-3 p-3 bg-muted/50 rounded-sm">
                  <div className="w-12 h-12 bg-gradient-to-br flex items-center justify-center">
                    <img
                    src="/NoteAlbumArt.png"
                    alt="Album Art"
                    className="rounded-sm w-full h-full"/>
                  </div>
                  <div>
                    <div className="font-medium">{selectedSong.title}</div>
                    <div className="text-sm text-muted-foreground">{selectedSong.artist}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Select a pitch to add this song to:</h3>
              <div className="space-y-3">
                {availablePitches.map((pitch) => (
                  <button
                    key={pitch.id}
                    onClick={() => selectPitch(pitch)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/10 transition-all duration-200 text-left group"
                  >
                    <div className={`w-12 h-12 ${pitch.color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {pitch.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{pitch.name}</div>
                      <div className="text-sm text-muted-foreground">{pitch.company} • {pitch.description}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-8 h-8 bg-[#E4EA04] rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-black" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};