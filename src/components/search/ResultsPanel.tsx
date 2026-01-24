import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { useEffect, useState } from "react";

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
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
  selectedSong,
  onSongClick,
}: ResultsPanelProps) => {
  const { currentSong, currentTime, duration, nextTrack, previousTrack, seekTo, playSong } = useMusicPlayer();
  const [progress, setProgress] = useState(0);
  const [songDurations, setSongDurations] = useState<Record<number, string>>({});

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
    const songsToPreload = allSongs.slice(0, 5); // Preload top 5 results
    
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

  // Use selectedSong if provided, otherwise use first result
  const displaySong = selectedSong || (searchResults.length > 0 ? searchResults[0] : fallbackSongs[0]);

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    seekTo(newTime);
  };

  const handlePlayPause = () => {
    // If no song is loaded, load the current display song first
    if (!currentSong && displaySong) {
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
        id: displaySong.id,
        title: displaySong.title,
        artist: displaySong.artist,
        album: displaySong.album,
        duration: displaySong.duration,
        keywords: displaySong.keywords,
      };
      
      playSong(songToPlay, queue);
    } else {
      onTogglePlay();
    }
  };

  if (!isLoading && !showResults) {
    return null;
  }

  return (
    <section className="w-2/3 p-8 h-screen overflow-y-auto font-exo text-white mt-3 z-5">
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
                {/* CTO FIX: replace with final album art + CD case assets */}
                <div className="relative h-48 w-48 flex items-center justify-center">
                  <img
                    src="/NoteAlbumArt.png"
                    alt="Album art"
                    className="album-spin is-spinning h-40 w-40 rounded-full object-cover"
                    style={{ animationPlayState: isPlaying ? "running" : "paused" }}
                  />
                  <img
                    src="/cd_overlay.png"
                    alt="CD Overlay"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div className="text-center w-full">
                  <div className="text-xl font-dm truncate px-2">{displaySong?.title || "Select a song"}</div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white font-exo truncate px-2">
                    {displaySong?.artist || ""}
                    {displaySong?.album && (
                      <>
                        <span className="mx-2 inline-block h-1 w-1 rounded-full bg-white align-middle" />
                        {displaySong.album}
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
                       (displaySong && songDurations[displaySong.id]) || 
                       displaySong?.duration || 
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
                    
                    {displaySong?.keywords && displaySong.keywords.length > 0 && (
                      <div className="flex-col mb-5">
                        <div className="text-lg font-dm font-normal mb-2">Keywords</div>
                        <div className="flex gap-2 flex-wrap mt-2">
                          {displaySong.keywords.slice(0, 5).map((keyword, idx) => (
                            <Badge 
                              key={idx}
                              className="bg-[#2bb7b1] text-white rounded-full px-4 py-1 font-dm font-normal"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                  </div>
                  
                  <div className="flex flex-col gap-3 items-end flex-shrink-0" style={{ width: '200px' }}>
                    <Button size="sm" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo w-full backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Playlist
                    </Button>
                    <Button size="sm" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo w-full backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Pitch Kit
                    </Button>
                    <div className="text-sm text-white text-left font-exo w-full">
                      Key: C# Major
                      <br />
                      Tempo: 105 BPM
                      <br />
                      Duration: {
                        (displaySong && songDurations[displaySong.id]) || 
                        displaySong?.duration || 
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

                <div className="items-center gap-3 text-white">
                  <div className="flex italic items-center gap-2 mb-2">
                    <img src="/flower.png" alt="Why" className="h-5 w-5" />
                    <div className="text-white font-exo text-lg">why this song?</div>
                  </div>
                  <div>
                    <p className="text-sm text-white font-exo">
                      “Bite Me” by Enhypen can be used from 00:00-00:35 to represent a
                      fighter getting ready to go into an intense adventure in the dark
                      and scary woods.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/15 bg-[linear-gradient(140deg,rgba(255,255,255,0.08),rgba(0,0,0,0.35))] p-6 mt-3">
              <div className="text-xl font-dm mb-4">Top 5 Results</div>
              <div className="grid grid-cols-2 gap-5 text-sm text-white">
                {(searchResults.length > 0 ? searchResults : fallbackSongs).slice(0, 5).map((song, index) => (
                  <div 
                    key={song.id} 
                    className={`flex items-center gap-3 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors ${
                      selectedSong?.id === song.id ? 'bg-white/10' : ''
                    }`}
                    onClick={() => onSongClick?.(song)}
                  >
                    <div className="w-6 text-white font-dm">{index + 1}</div>
                    <div className="h-12 w-12 rounded-md bg-white/10 flex items-center justify-center">
                      <div className="h-7 w-7 rounded-full border border-white/60" />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-dm">{song.title}</div>
                      <div className="text-xs text-white font-exo">{song.artist}</div>
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
                            >
                              ...
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-black/80 border border-white/20 text-white p-2 rounded-xl shadow-[0_0_18px_rgba(0,0,0,0.4)]">
                            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 rounded-lg px-3 py-2">
                              Add to Playlist
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer focus:bg-white/10 rounded-lg px-3 py-2">
                              Add to Pitch Kit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
