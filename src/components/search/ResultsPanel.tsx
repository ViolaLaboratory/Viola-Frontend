import { useEffect, useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { getFolders, addTracksToFolder, type Folder } from "@/services/folderService";
import { useToast } from "@/hooks/use-toast";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Scrolling Title Component for long song titles
interface ScrollingTitleProps {
  text: string;
  className?: string;
}

const ScrollingTitle = ({ text, className = "" }: ScrollingTitleProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    if (containerRef.current && textRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const textWidth = textRef.current.scrollWidth;
      setNeedsScroll(textWidth > containerWidth);
    }
  }, [text]);

  if (!needsScroll) {
    return (
      <div ref={containerRef} className={`overflow-hidden ${className}`}>
        <div className="truncate">{text}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden relative ${className}`}
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}
    >
      <div
        ref={textRef}
        className="inline-block whitespace-nowrap"
        style={{
          animation: needsScroll ? 'scroll-text 15s linear infinite' : 'none',
        }}
      >
        {text}
        <span className="mx-8">•</span>
        {text}
      </div>
    </div>
  );
};

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  keywords: string[];
  duration: string;
}

interface ResultsPanelProps {
  isLoading: boolean;
  showResults: boolean;
  thinkingText: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  searchResults: Song[];
  fallbackSongs: Song[];
  selectedSong?: Song | null;
  onSongClick?: (song: Song) => void;
}

export const ResultsPanel = ({
  isLoading,
  showResults,
  thinkingText,
  isPlaying,
  onTogglePlay,
  searchResults,
  fallbackSongs,
  selectedSong: propSelectedSong,
  onSongClick,
}: ResultsPanelProps) => {
  const { currentSong, currentTime, duration, nextTrack, previousTrack, seekTo, playSong, loadSong } = useMusicPlayer();
  const [songDurations, setSongDurations] = useState<Record<number, string>>({});
  const [progress, setProgress] = useState(0);
  const [showPitchKitDialog, setShowPitchKitDialog] = useState(false);
  const [pitchKitFolders, setPitchKitFolders] = useState<Folder[]>([]);
  const [selectedSongForPitchKit, setSelectedSongForPitchKit] = useState<Song | null>(null);
  const { toast } = useToast();

  // Update progress based on current time and duration
  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  // Update song duration when audio metadata loads
  useEffect(() => {
    if (currentSong && duration > 0) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      setSongDurations(prev => ({
        ...prev,
        [currentSong.id]: formattedDuration,
      }));
    }
  }, [currentSong, duration]);

  // Preload audio metadata for all songs in results to get actual durations
  useEffect(() => {
    const allSongs = searchResults.length > 0 ? searchResults : fallbackSongs;
    const songsToPreload = allSongs.slice(0, 10); // Preload top 10 results
    
    songsToPreload.forEach((song) => {
      // Skip if we already have the duration
      if (songDurations[song.id] || !song.id) return;
      
      // Create a temporary audio element to load metadata
      const audio = new Audio();
      const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${song.id % 10 + 1}.mp3`;
      
      audio.addEventListener('loadedmetadata', () => {
        const actualDuration = audio.duration;
        if (actualDuration > 0) {
          const minutes = Math.floor(actualDuration / 60);
          const seconds = Math.floor(actualDuration % 60);
          const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          
          setSongDurations(prev => ({
            ...prev,
            [song.id]: formattedDuration,
          }));
        }
        // Clean up
        audio.src = '';
        audio.load();
      });
      
      audio.addEventListener('error', () => {
        // If audio fails to load, keep the API duration
        audio.src = '';
        audio.load();
      });
      
      // Set src to trigger metadata load
      audio.src = audioUrl;
      audio.load();
    });
  }, [searchResults, fallbackSongs]); // Run when results change

  // Use selectedSong from props, or currentSong from context, or first result
  // Convert currentSong to local Song type if needed
  const getDisplayedSong = (): Song => {
    if (propSelectedSong) return propSelectedSong;
    if (currentSong) {
      return {
        id: currentSong.id,
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || 'Unknown Album',
        keywords: currentSong.keywords || [],
        duration: currentSong.duration || '03:00',
      };
    }
    return searchResults.length > 0 ? searchResults[0] : fallbackSongs[0];
  };
  const displayedSong = getDisplayedSong();
  const songsToDisplay = searchResults.length > 0 ? searchResults : fallbackSongs;

  // Load folders when dialog opens
  useEffect(() => {
    if (showPitchKitDialog) {
      setPitchKitFolders(getFolders());
    }
  }, [showPitchKitDialog]);

  // Handle "Add to Pitch Kit" button click
  const handleAddToPitchKit = (song: Song | null, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Prevent triggering parent click handlers
    }
    if (!song) return;
    // Ensure we have a valid Song with all required fields
    const validSong: Song = {
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album || 'Unknown Album',
      keywords: song.keywords || [],
      duration: song.duration || '03:00',
    };
    setSelectedSongForPitchKit(validSong);
    setShowPitchKitDialog(true);
  };

  // Handle folder selection and add song to folder
  const handleSelectFolder = (folderId: string) => {
    if (!selectedSongForPitchKit) return;

    try {
      // Create track cache with the song information
      const trackCache: Record<string, { id: number; title: string; artist: string; album: string; duration: string; thumbnail?: string }> = {
        [selectedSongForPitchKit.id.toString()]: {
          id: selectedSongForPitchKit.id,
          title: selectedSongForPitchKit.title,
          artist: selectedSongForPitchKit.artist,
          album: selectedSongForPitchKit.album,
          duration: selectedSongForPitchKit.duration,
        }
      };
      
      addTracksToFolder(folderId, [selectedSongForPitchKit.id.toString()], trackCache);
      toast({
        title: "Added to Pitch Kit",
        description: `"${selectedSongForPitchKit.title}" has been added to the folder.`,
      });
      setShowPitchKitDialog(false);
      setSelectedSongForPitchKit(null);
    } catch (error) {
      console.error("Error adding song to folder:", error);
      toast({
        title: "Error",
        description: "Failed to add song to folder. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper to split keywords into genres and moods
  const getGenresAndMoods = (keywords: string[]) => {
    const genreKeywords = [
      "Kpop", "Pop", "Pop Punk", "Emo Pop", "R&B", "Hip Hop", "Electronic", "EDM",
      "Indie", "Rock", "Synthwave", "Alternative", "Ambient", "Darkwave", "Orchestral", "Cinematic",
    ];
    const moodKeywords = [
      "Dark", "Suspense", "Eerie", "Suspenseful", "Atmospheric", "Horror", "Tension", "Mysterious",
      "Haunting", "Ethereal", "Cold", "Hypnotic", "Minimal", "Deep", "Melancholic", "Emotional",
      "Expansive", "Meditative", "Tense", "Building", "Dramatic", "Retro", "Nostalgic",
    ];

    const genres = keywords.filter((k) => genreKeywords.some((g) => k.includes(g) || g.includes(k)));
    const moods = keywords.filter((k) => moodKeywords.some((m) => k.includes(m) || m.includes(k)));

    const finalGenres = genres.length > 0 ? genres : keywords.slice(0, 3);
    const finalMoods = moods.length > 0 ? moods : keywords.slice(3).length ? keywords.slice(3) : keywords.slice(0, 2);

    return { genres: finalGenres, moods: finalMoods };
  };

  const { genres, moods } = displayedSong
    ? getGenresAndMoods(displayedSong.keywords || [])
    : { genres: [], moods: [] };

  const handlePlayPause = () => {
    // If no song is loaded, load the current display song first
    if (!currentSong && displayedSong) {
      const allSongs = searchResults.length > 0 ? searchResults : fallbackSongs;
      const queue = allSongs.map(s => ({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        duration: s.duration,
        keywords: s.keywords,
      }));
      
      const songToPlay = {
        id: displayedSong.id,
        title: displayedSong.title,
        artist: displayedSong.artist,
        album: displayedSong.album,
        duration: displayedSong.duration,
        keywords: displayedSong.keywords,
      };
      
      playSong(songToPlay, queue);
    } else {
      onTogglePlay();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    seekTo(newTime);
  };

  if (!isLoading && !showResults) {
    return null;
  }

  return (
    <section className="w-2/3 p-8 h-screen overflow-y-auto font-exo text-white mt-3 z-5">
      <style>{`
        @keyframes cd-spin {
          from { transform: rotate(var(--start-rotation, 0deg)); }
          to { transform: rotate(calc(var(--start-rotation, 0deg) + 360deg)); }
        }
        .album-spin.is-spinning {
          animation: cd-spin 7s linear infinite;
        }
        @keyframes scroll-text {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <div className="min-h-full backdrop-blur-[12px]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-10">
            <div className="text-xs tracking-[0.3em] text-white uppercase">
              Updating brief instructions... / Loading CDs / etc...
            </div>
            {/* CTO FIX: replace with final loading illustration assets */}
            <div className="loading-drive" />
            <div className="cd-disc w-44 h-44 rounded-full border-[10px] border-white/90 shadow-[0_0_30px_rgba(255,255,255,0.25)]" />
            <div className="text-white text-sm">{thinkingText}</div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-10 text-white">
            <div className="flex items-start gap-12">
              <div className="flex flex-col items-center gap-4 flex-shrink-0" style={{ width: '280px' }}>
                {/* Larger spinning track indicator (vinyl) */}
                <div className="relative h-56 w-56 flex items-center justify-center">
                  <img
                    src="/vynl.png"
                    alt="Track indicator"
                    className="album-spin is-spinning"
                    style={{ 
                      animationPlayState: isPlaying ? "running" : "paused",
                      width: '224px',
                      height: '224px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div className="text-center w-full">
                  <ScrollingTitle
                    text={currentSong?.title || displayedSong?.title || "Select a song"}
                    className="text-xl font-dm px-2"
                  />
                  <div className="text-xs uppercase tracking-[0.25em] text-white font-exo truncate px-2">
                    {currentSong?.artist || displayedSong?.artist || ""}
                    {(currentSong?.album || displayedSong?.album) && (
                      <>
                        <span className="mx-2 inline-block h-1 w-1 rounded-full bg-white align-middle" />
                        {currentSong?.album || displayedSong?.album}
                      </>
                    )}
                  </div>
                </div>
                <div className="w-full" style={{ maxWidth: '280px' }}>
                  <div 
                    className="relative h-[3px] bg-white/20 rounded-full cursor-pointer group"
                    onClick={handleProgressBarClick}
                    title="Click to seek"
                  >
                    <div 
                      className="absolute left-0 top-0 h-full bg-[#e4ea04] rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                    <div className="absolute inset-0 rounded-full group-hover:bg-white/10 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white font-dm mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>
                      {duration > 0 ? formatTime(duration) :
                       (displayedSong && songDurations[displayedSong.id]) || 
                       displayedSong?.duration || 
                       "0:00"}
                    </span>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button 
                      type="button" 
                      className="text-white/80 hover:text-white"
                      onClick={previousTrack}
                    >
                      <SkipBack className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="h-12 w-12 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button 
                      type="button" 
                      className="text-white/80 hover:text-white"
                      onClick={nextTrack}
                    >
                      <SkipForward className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6 min-w-0">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-dm font-normal mb-5">The Details</h2>
                    
                    {genres.length > 0 && (
                      <div className="flex-col mb-5">
                        <div className="text-lg font-dm font-normal mb-2">Genre</div>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {genres.map((genre, idx) => {
                            const colors = [
                              "bg-[#2bb7b1]",
                              "bg-[#7c3aed]",
                              "bg-[#34d399]",
                              "bg-[#eab308]",
                              "bg-[#f59e0b]",
                            ];
                            return (
                              <Badge 
                                key={idx}
                                className={`${colors[idx % colors.length]} text-white rounded-full px-4 py-1 font-dm font-normal`}
                              >
                                {genre}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {moods.length > 0 && (
                      <div>
                        <div className="text-lg font-dm font-normal mb-2">Mood</div>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {moods.map((mood, idx) => {
                            const colors = [
                              "bg-[#4338ca]",
                              "bg-[#b45309]",
                              "bg-[#dc2626]",
                              "bg-[#7c2d12]",
                            ];
                            return (
                              <Badge 
                                key={idx}
                                className={`${colors[idx % colors.length]} text-white rounded-full px-4 py-1 font-dm font-normal`}
                              >
                                {mood}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                  </div>
                  
                  <div className="flex flex-col gap-3 items-end flex-shrink-0" style={{ width: '200px' }}>
                    <Button 
                      size="sm" 
                      className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo w-full backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]"
                      onClick={() => {
                        const songToAdd = displayedSong || fallbackSongs[0];
                        handleAddToPitchKit(songToAdd);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Pitch Kit
                    </Button>
                    <div className="text-sm text-white text-left font-exo w-full">
                      Key: C# Major
                      <br />
                      Tempo: 105 BPM
                      <br />
                      Duration: {
                        (displayedSong && songDurations[displayedSong.id]) || 
                        displayedSong?.duration || 
                        "2:38"
                      }
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-white">
                  <div>
                    <div className="text-lg font-dm font-normal mb-2">Collaborators</div>
                    <p className="text-white font-exo">
                      Songwriters: Cirkut, Jason Evigan, David Stewart, Lou-ridz, & Supreme Boi
                    </p>
                    <p className="text-white font-exo">
                      Producer: Cirkut & Jason Evigan
                    </p>
                  </div>
                </div>

                <div className="items-center gap-3 text-white min-h-[100px]">
                  <div className="flex italic items-center gap-2 mb-2">
                    <img src="/flower.png" alt="Why" className="h-5 w-5" />
                    <div className="text-white font-exo text-lg">why this song?</div>
                  </div>
                  <div className="min-h-[60px]">
                    <p className="text-sm text-white font-exo">
                      "{displayedSong?.title || "Bite Me"}" by {displayedSong?.artist || "Enhypen"} can be
                      used from 00:00-00:35 to represent a fighter getting ready to go into an intense
                      adventure in the dark and scary woods.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(0,0,0,0.35))] p-6 mt-3">
              <div className="text-xl font-dm mb-4">Top 10 Results</div>
              <div className="grid grid-cols-2 gap-5 text-sm text-white">
                {songsToDisplay.slice(0, 10).map((song, index) => {
                  const isSelected = currentSong?.id === song.id || (propSelectedSong?.id === song.id) || (!currentSong && !propSelectedSong && index === 0);

                  return (
                    <div 
                      key={song.id} 
                      className={`flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors ${
                        isSelected ? 'bg-white/10' : ''
                      }`}
                      onClick={() => onSongClick?.(song)}
                    >
                      <div className="w-6 text-white font-dm">{index + 1}</div>
                      <div className="h-12 w-12 rounded-md bg-white/10 flex items-center justify-center">
                        <div className="h-7 w-7 rounded-full border border-white/60" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <ScrollingTitle
                          text={song.title}
                          className="text-white font-dm"
                        />
                        <div className="text-xs text-white font-exo truncate">{song.artist}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 10 }).map((_, idx) => (
                            <span
                              key={`${song.id}-bar-${idx}`}
                              className="inline-block w-[3px] rounded-full bg-white/70"
                              style={{ height: `${6 + (idx % 5) * 3}px` }}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white font-dm">
                            {songDurations[song.id] || song.duration || "03:00"}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                type="button"
                                className="h-6 w-6 rounded-full border border-white/30 flex items-center justify-center text-[10px]"
                                aria-label="Track options"
                                onClick={(e) => e.stopPropagation()}
                              >
                                ...
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-black/80 border border-white/20 text-white p-2 rounded-xl shadow-[0_0_18px_rgba(0,0,0,0.4)]">
                              <DropdownMenuItem 
                                className="cursor-pointer focus:bg-white/10 rounded-lg px-3 py-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToPitchKit(song, e);
                                }}
                              >
                                Add to Pitch Kit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add to Pitch Kit Dialog */}
      <Dialog open={showPitchKitDialog} onOpenChange={setShowPitchKitDialog}>
        <DialogContent className="bg-black/90 border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Add to Pitch Kit</DialogTitle>
            <DialogDescription className="text-white/60">
              Select a folder to add "{selectedSongForPitchKit?.title || 'this song'}" to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {pitchKitFolders.length === 0 ? (
              <p className="text-white/60 text-center py-4">No folders available. Create a folder in Pitch Kit first.</p>
            ) : (
              pitchKitFolders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => handleSelectFolder(folder.id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-white/30 hover:bg-white/5 transition-all duration-200 text-left group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    {folder.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-dm font-medium">{folder.name}</div>
                    <div className="text-white/60 text-sm font-exo">
                      {folder.trackIds.length} track{folder.trackIds.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-white/40 group-hover:text-white/80 transition-colors" />
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
