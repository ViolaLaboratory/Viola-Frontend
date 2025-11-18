import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Play, X, Check } from "lucide-react";
import { PitchBuilder } from "./PitchBuilder"; // Import your existing PitchBuilder

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

  const translateX = (backgroundShift.x - 50) * 0.8;
  const translateY = (backgroundShift.y - 50) * 0.8;

  const containerStyle = {
    "--bg-x": `${backgroundShift.x}%`,
    "--bg-y": `${backgroundShift.y}%`,
    "--bg-tx": `${translateX}px`,
    "--bg-ty": `${translateY}px`
  } as React.CSSProperties;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    
    // Simulate 2 second loading
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 2000);
  };

  const addToPitch = (song: Song) => {
    setSelectedSong(song);
    setShowPitchSelection(true);
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
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Zen+Dots&display=swap');

          .zen-dots,
          .zen-dots .song-card * {
            font-family: 'Inter', system-ui, sans-serif !important;
          }

          .fluid-bg {
            position: relative;
            z-index: 0;
            background-color: #0b021d;
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
            background-size: 180% 180%;
            background-repeat: no-repeat;
            background-position: var(--bg-x, 50%) var(--bg-y, 50%);
            filter: blur(32px) saturate(1.25);
            transform: translate(var(--bg-tx, 0px), var(--bg-ty, 0px)) scale(1.3);
            transition: transform 0.35s ease-out, background-position 0.25s ease-out, filter 0.3s ease;
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
                rgba(60, 200, 255, 0.35),
                transparent 45%),
              linear-gradient(120deg, rgba(16, 0, 32, 0.95), rgba(45, 3, 81, 0.95));
            mix-blend-mode: screen;
            filter: blur(22px);
            opacity: 0.85;
            transform: translate(calc(var(--bg-tx, 0px) * 1.2), calc(var(--bg-ty, 0px) * 1.2));
            transition: transform 0.25s ease-out, opacity 0.3s ease-out;
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
            background: linear-gradient(120deg, #c084fc, #6366f1, #a855f7, #ec4899, #c084fc);
            background-size: 300% 300%;
            animation: border-glow 6s linear infinite;
            padding: 1px;
            border-radius: 999px;
            box-shadow: 0 0 20px rgba(148, 0, 211, 0.25);
          }
        `}
      </style>

      {/* Loading State - Center of Screen */}
      {isLoading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-40">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-6"></div>
          <p className="text-muted-foreground text-lg">Searching for the perfect tracks...</p>
        </div>
      )}

      <div className="flex flex-col min-h-screen">
        {/* Results Section - Above search when results shown */}
        {showResults && !isLoading && (
          <div className="px-6 pt-8 pb-4 animate-fade-in">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                  Top 5 Songs
                </h2>
                <p className="text-muted-foreground">
                  Ranked by relevance • {mockSongs.length} results
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {mockSongs.map((song, index) => (
                 <Card 
                 key={song.id} 
                 className="transition-all duration-200 hover:shadow-md hover:shadow-purple-500/10 cursor-pointer border hover:bg-muted/30"
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
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex-shrink-0 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>

                        {/* Song Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{song.title}</h3>
                            <span className="text-muted-foreground italic">{song.artist}</span>
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
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            {song.keywords.slice(0, 2).map((keyword, idx) => (
                              <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-800">
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
                            className="bg-[#E4EA04] hover:bg-[#B5C929] text-black font-medium"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add to Pitch
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Section - Bottom when results shown */}
        <div
          className={`px-6 transition-all duration-700 ease-in-out ${
            hasSearched
              ? "py-4   sticky top-0 z-30 /5"
              : "flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"
          }`}
        >
          
          {/* Title - disappears when searched */}
          {!hasSearched && (
            <h1 className="text-4xl font-medium text mb-8">
              What would you like to listen to today?
            </h1>
          )}

          {/* Search Bar with purple glow */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto transition-all duration-700">
            <div className="glow-border">
              <div className="relative">
                <Input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find me an eerie, suspenseful soundtrack for a scene in the woods" 
                  className="h-14 text-base border-0 bg-card focus-visible:ring-0 rounded-full px-6 pr-12 shadow-lg shadow-purple-500/30 transition-all duration-300"
                  disabled={isLoading}
                />
                {isLoading && (
                  <Loader2 className="absolute right-6 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-purple-500" />
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Pitch Selection Modal */}
      {showPitchSelection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Add to Pitch</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPitchSelection(false)}
                  className="rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {selectedSong && (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
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
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200 text-left group"
                  >
                    <div className={`w-12 h-12 ${pitch.color} rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {pitch.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{pitch.name}</div>
                      <div className="text-sm text-muted-foreground">{pitch.company} • {pitch.description}</div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
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