import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, MoreHorizontal, Plus, Pencil, Trash2, ArrowUp, Play, Pause, ThumbsUp, MessageCircle, X, SkipBack, SkipForward } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchTrackDetailsFromMongoDB } from "@/services/trackService";
import { 
  getFolders, 
  createFolder, 
  getFolderById,
  addTracksToFolder,
  updateFolderName,
  deleteFolder,
  removeTracksFromFolder,
  type Folder 
} from "@/services/folderService";
import { useMusicPlayer, type Song as MusicPlayerSong } from "@/contexts/MusicPlayerContext";
import { useToast } from "@/hooks/use-toast";
import API_ENDPOINTS from "@/config/api";

// Fetch track details helper (uses MongoDB, falls back to ChromaDB)
const fetchTrackDetails = async (trackIds: string[]): Promise<Song[]> => {
  if (!trackIds || trackIds.length === 0) {
    return [];
  }

  try {
    // Ensure all track IDs are strings and filter out empty values
    const stringTrackIds = trackIds
      .map(id => String(id).trim())
      .filter(id => id && id !== 'undefined' && id !== 'null');
    
    if (stringTrackIds.length === 0) {
      console.warn("No valid track IDs provided");
      return [];
    }

    console.log("Fetching track details for IDs:", stringTrackIds);
    const tracks = await fetchTrackDetailsFromMongoDB(stringTrackIds);
    
    if (!tracks || tracks.length === 0) {
      console.warn("No tracks returned from API for IDs:", stringTrackIds);
      // Try fetching one by one as fallback
      const fallbackTracks: Song[] = [];
      for (const id of stringTrackIds) {
        try {
          const singleTrack = await fetchTrackDetailsFromMongoDB([id]);
          if (singleTrack && singleTrack.length > 0) {
            fallbackTracks.push({
              id: parseInt(singleTrack[0].id) || parseInt(id) || 0,
              title: singleTrack[0].title || `Track ${id}`,
              artist: singleTrack[0].artist || "Unknown Artist",
              album: singleTrack[0].album || "Unknown Album",
              thumbnail: singleTrack[0].thumbnail || "🎵",
              producer: singleTrack[0].producer || "Unknown Producer",
              writer: singleTrack[0].writer || "Unknown Writer",
              licensing: singleTrack[0].licensing || "Standard",
              keywords: singleTrack[0].keywords || ["Music"],
              duration: singleTrack[0].duration || "03:00",
            });
          }
        } catch (err) {
          console.error(`Error fetching track ${id}:`, err);
        }
      }
      return fallbackTracks;
    }
    
    // Convert TrackDetails to Song format
    return tracks.map((track) => ({
      id: parseInt(track.id) || 0,
      title: track.title || `Track ${track.id}`,
      artist: track.artist || "Unknown Artist",
      album: track.album || "Unknown Album",
      thumbnail: track.thumbnail || "🎵",
      producer: track.producer || "Unknown Producer",
      writer: track.writer || "Unknown Writer",
      licensing: track.licensing || "Standard",
      keywords: track.keywords || ["Music"],
      duration: track.duration || "03:00",
    }));
  } catch (error) {
    console.error("Error fetching track details:", error);
    // Return empty array instead of placeholder data to avoid showing "Track {id}"
    return [];
  }
};

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  thumbnail: string;
  producer: string;
  writer: string;
  licensing: string;
  keywords: string[];
  duration: string;
  audioUrl?: string;
}

export const PitchBuilder = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"builder" | "client" | "link">("builder");
  const [clientName, setClientName] = useState("Netflix");
  const [clientProject, setClientProject] = useState("Stranger Things, S1E4");
  const [clientColor, setClientColor] = useState("red");
  const [clientDescription, setClientDescription] = useState(
    "Needs a song for a 30 second clip with a dark and eerie song, where the lead girl and boy are being chased in the woods by a monster."
  );
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState("");
  const [songDurations, setSongDurations] = useState<Record<number, string>>({});
  const [showAddToFolderDialog, setShowAddToFolderDialog] = useState(false);
  const [selectedSongForFolder, setSelectedSongForFolder] = useState<Song | null>(null);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([]);

  /* Music Player Integration */
  const { playSong, loadSong, currentSong, isPlaying, togglePlayPause, nextTrack, previousTrack, currentTime, duration, seekTo } = useMusicPlayer();

  // Format time helper
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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

  // Preload audio metadata for all songs in the folder to get actual durations
  useEffect(() => {
    if (recommendedSongs.length === 0) return;
    
    const songsToPreload = recommendedSongs.slice(0, 10); // Preload top 10 songs
    
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
        // If audio fails to load, keep the cached/API duration
        audio.src = '';
        audio.load();
      });
      
      // Set src to trigger metadata load
      audio.src = audioUrl;
      audio.load();
    });
  }, [recommendedSongs]); // Run when recommended songs change

  // Load folders on mount
  useEffect(() => {
    const foldersList = getFolders();
    setFolders(foldersList);
    // Select first folder by default
    if (foldersList.length > 0 && !selectedFolderId) {
      setSelectedFolderId(foldersList[0].id);
    }
  }, []);

  // Fetch recommended songs for the selected folder
  useEffect(() => {
    const loadRecommendedSongs = async () => {
      if (!selectedFolderId) return;
      
      setIsLoadingSongs(true);
      try {
        const folder = getFolderById(selectedFolderId);
        if (folder && folder.trackIds.length > 0) {
          // First, try to use cached track information if available
          const cachedSongs: Song[] = [];
          const uncachedTrackIds: string[] = [];
          
          folder.trackIds.forEach(trackId => {
            if (folder.trackCache && folder.trackCache[trackId]) {
              const cached = folder.trackCache[trackId];
              cachedSongs.push({
                id: cached.id,
                title: cached.title,
                artist: cached.artist,
                album: cached.album,
                thumbnail: cached.thumbnail || "🎵",
                producer: "Unknown Producer", // Cache doesn't have these, will be updated if fetch succeeds
                writer: "Unknown Writer",
                licensing: "Standard",
                keywords: ["Music"],
                duration: cached.duration,
              });
            } else {
              uncachedTrackIds.push(trackId);
            }
          });
          
          // Fetch details for uncached tracks
          let fetchedSongs: Song[] = [];
          if (uncachedTrackIds.length > 0) {
            fetchedSongs = await fetchTrackDetails(uncachedTrackIds);
          }
          
          // Combine cached and fetched songs, maintaining order
          const allSongs: Song[] = [];
          folder.trackIds.forEach(trackId => {
            const cached = cachedSongs.find(s => s.id.toString() === trackId);
            const fetched = fetchedSongs.find(s => s.id.toString() === trackId);
            if (cached) {
              allSongs.push(cached);
            } else if (fetched) {
              allSongs.push(fetched);
            }
          });
          
          setRecommendedSongs(allSongs);
        } else {
          setRecommendedSongs([]);
        }
      } catch (error) {
        console.error("Failed to load recommended songs:", error);
        setRecommendedSongs([]);
      } finally {
        setIsLoadingSongs(false);
      }
    };

    loadRecommendedSongs();
  }, [selectedFolderId]);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = createFolder(newFolderName.trim());
      setFolders(getFolders());
      setSelectedFolderId(newFolder.id);
      setShowCreateDialog(false);
      setNewFolderName("");
    }
  };

  const handleRenameFolder = (folderId: string) => {
    const folder = getFolderById(folderId);
    if (folder) {
      setRenameFolderId(folderId);
      setRenameFolderName(folder.name);
      setShowRenameDialog(true);
    }
  };

  const handleSaveRename = () => {
    if (renameFolderId && renameFolderName.trim()) {
      updateFolderName(renameFolderId, renameFolderName.trim());
      setFolders(getFolders());
      setShowRenameDialog(false);
      setRenameFolderId(null);
      setRenameFolderName("");
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm("Are you sure you want to delete this folder? This action cannot be undone.")) {
      deleteFolder(folderId);
      const updatedFolders = getFolders();
      setFolders(updatedFolders);
      
      // If the deleted folder was selected, select another folder or clear selection
      if (selectedFolderId === folderId) {
        if (updatedFolders.length > 0) {
          setSelectedFolderId(updatedFolders[0].id);
        } else {
          setSelectedFolderId(null);
        }
      }
    }
  };

  const handleRemoveTrackFromFolder = (trackId: number) => {
    if (!selectedFolderId) return;
    
    removeTracksFromFolder(selectedFolderId, [trackId.toString()]);
    
    // Update the recommended songs list by removing the deleted track
    setRecommendedSongs(prev => prev.filter(song => song.id !== trackId));
    
    // Refresh folders to ensure state is in sync
    setFolders(getFolders());
  };

  // Load folders when add to folder dialog opens
  useEffect(() => {
    if (showAddToFolderDialog) {
      setAvailableFolders(getFolders());
    }
  }, [showAddToFolderDialog]);

  // Handle adding song to another folder
  const handleAddSongToFolder = (folderId: string) => {
    if (!selectedSongForFolder) return;

    try {
      // Check if song already exists in the folder
      const folder = getFolderById(folderId);
      if (folder && folder.trackIds.includes(selectedSongForFolder.id.toString())) {
        // Song already exists, show error message
        toast({
          title: "Duplicate Song",
          description: "This song has already been added and cannot be added again.",
          variant: "destructive",
        });
        return;
      }

      // Create track cache with the song information
      const trackCache: Record<string, { id: number; title: string; artist: string; album: string; duration: string; thumbnail?: string }> = {
        [selectedSongForFolder.id.toString()]: {
          id: selectedSongForFolder.id,
          title: selectedSongForFolder.title,
          artist: selectedSongForFolder.artist,
          album: selectedSongForFolder.album,
          duration: selectedSongForFolder.duration,
          thumbnail: selectedSongForFolder.thumbnail,
        }
      };
      
      addTracksToFolder(folderId, [selectedSongForFolder.id.toString()], trackCache);
      
      // Refresh folders to show updated track counts
      setFolders(getFolders());
      setAvailableFolders(getFolders());
      
      setShowAddToFolderDialog(false);
      setSelectedSongForFolder(null);
    } catch (error) {
      console.error("Error adding song to folder:", error);
      toast({
        title: "Error",
        description: "Failed to add song to folder. Please try again.",
        variant: "destructive",
      });
    }
  };


  const handleExport = async () => {
    if (status === "loading" || !selectedFolderId) return;

    setStatus("loading");

    try {
      // Dynamic import for JSZip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      
      const folder = getFolderById(selectedFolderId);
      if (!folder || folder.trackIds.length === 0) {
        throw new Error("No tracks to export");
      }

      // Create a text file with track information and download MP3 for each track
      let mp3Count = 0;
      for (const trackId of folder.trackIds) {
        const trackDetails = await fetchTrackDetails([trackId]);
        if (trackDetails.length > 0) {
          const track = trackDetails[0];
          const trackInfo = `Title: ${track.title}\nArtist: ${track.artist}\nAlbum: ${track.album}\nDuration: ${track.duration}\nProducer: ${track.producer}\nWriter: ${track.writer}\nLicensing: ${track.licensing}\nKeywords: ${track.keywords.join(", ")}\n`;
          const safeFileName = track.title.replace(/[^a-z0-9]/gi, "_");
          zip.file(`${safeFileName}_${trackId}.txt`, trackInfo);
          
          // Fetch and add MP3 file
          try {
            // Try backend endpoint first, then fallback to SoundHelix
            const backendAudioUrl = API_ENDPOINTS.TRACK_AUDIO(trackId);
            const fallbackUrl = track.audioUrl || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${parseInt(trackId) % 10 + 1}.mp3`;
            
            console.log(`Fetching MP3 for track ${trackId} from backend: ${backendAudioUrl}`);
            
            let response: Response | null = null;
            let audioUrl = backendAudioUrl;
            
            // Try backend endpoint first
            try {
              response = await fetch(backendAudioUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'audio/mpeg, audio/*, */*',
                },
              });
              
              if (response.ok && response.headers.get('content-type')?.includes('audio')) {
                // Backend served the file successfully
                console.log(`Backend served MP3 for track ${trackId}`);
              } else {
                // Backend didn't have the file, try fallback
                console.log(`Backend doesn't have MP3 for track ${trackId}, trying fallback URL`);
                response = null;
              }
            } catch (backendError) {
              console.warn(`Backend endpoint failed for track ${trackId}, trying fallback:`, backendError);
              response = null;
            }
            
            // If backend failed, try fallback URL
            if (!response || !response.ok) {
              audioUrl = fallbackUrl;
              console.log(`Trying fallback URL for track ${trackId}: ${fallbackUrl}`);
              
              try {
                response = await fetch(fallbackUrl, {
                  method: 'GET',
                  mode: 'cors',
                  cache: 'no-cache',
                  headers: {
                    'Accept': 'audio/mpeg, audio/*, */*',
                  },
                });
              } catch (corsError) {
                // If CORS fails, try with no-cors mode
                console.warn(`CORS error for ${fallbackUrl}, trying no-cors mode:`, corsError);
                response = await fetch(fallbackUrl, {
                  method: 'GET',
                  mode: 'no-cors',
                  cache: 'no-cache',
                });
              }
            }
            
            if (response && (response.ok || response.type === 'opaque')) {
              const audioBlob = await response.blob();
              
              // Verify it's actually an audio file (size check is most reliable)
              if (audioBlob.size > 0) {
                const fileName = `${safeFileName}_${trackId}.mp3`;
                // Use arrayBuffer for better binary handling
                const arrayBuffer = await audioBlob.arrayBuffer();
                zip.file(fileName, arrayBuffer, { binary: true });
                mp3Count++;
                console.log(`Successfully added MP3 file: ${fileName} (${audioBlob.size} bytes, type: ${audioBlob.type})`);
              } else {
                console.warn(`Fetched data for track ${trackId} but blob size is 0. Type: ${audioBlob.type}`);
              }
            } else {
              console.warn(`Failed to fetch MP3 for track ${trackId} from ${audioUrl}: ${response?.status} ${response?.statusText}, type: ${response?.type}`);
            }
          } catch (error) {
            console.error(`Error fetching MP3 for track ${trackId}:`, error);
            // Continue with other tracks even if one fails
          }
        }
      }
      
      console.log(`Added ${mp3Count} MP3 files to ZIP out of ${folder.trackIds.length} tracks`);
      
      // Log all files in ZIP for debugging
      const zipFiles: string[] = [];
      zip.forEach((relativePath, file) => {
        zipFiles.push(relativePath);
      });
      console.log(`Files in ZIP:`, zipFiles);

      // Generate ZIP file and trigger download
      // Use compression to reduce file size, but ensure all files are included
      const blob = await zip.generateAsync({ 
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
        streamFiles: false // Ensure all files are included
      });
      
      console.log(`ZIP file generated: ${blob.size} bytes, containing ${mp3Count} MP3 files and ${zipFiles.length} total files`);
      
      // Show user feedback
      if (mp3Count > 0) {
        toast({
          title: "Export Successful",
          description: `Exported ${mp3Count} MP3 file${mp3Count !== 1 ? 's' : ''} and ${folder.trackIds.length} metadata file${folder.trackIds.length !== 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "Export Warning",
          description: "Metadata files exported, but MP3 files could not be downloaded. Check console for details.",
          variant: "destructive",
        });
      }
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${folder.name.replace(/[^a-z0-9]/gi, "_")}_tracks.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
      }, 1800);
    } catch (error) {
      console.error("Export error:", error);
      // If JSZip is not available, show a fallback message
      setStatus("idle");
      alert("Export functionality requires JSZip library. Please install it: npm install jszip");
    }
  };

  const selectedFolder = selectedFolderId ? getFolderById(selectedFolderId) : null;
  const viewLabel =
    viewMode === "client"
      ? "Pitch Kit Builder (Add Client)"
      : viewMode === "link"
      ? "Pitch Kit Builder (link)"
      : "Pitch Kit Builder (zip)";
  const clientColorMap: Record<string, string> = {
    red: "bg-red-600",
    purple: "bg-purple-600",
    blue: "bg-blue-600",
    green: "bg-emerald-600",
    amber: "bg-amber-500",
  };
  const clientBadgeClass = clientColorMap[clientColor] ?? "bg-white/20";

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/demo/pitch-kit/share/${selectedFolderId ?? "kit"}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setLinkCopied(true);
        window.setTimeout(() => setLinkCopied(false), 1800);
      });
    } else {
      window.prompt("Copy this link:", shareUrl);
    }
  };

  const formatUpdatedAt = (timestamp?: number) => {
    if (!timestamp) return "Today";
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  };

  return (
    <>
      {status !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-white/70" />
              <p className="text-lg font-medium text-white">Preparing your export…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              <p className="text-xl font-semibold text-white">File saved to your computer</p>
            </div>
          )}
        </div>
      )}

      <div className="relative min-h-screen w-full overflow-hidden text-white font-exo">
        <style>{`
          @keyframes scroll-text {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#08080a_0%,#0b0b12_45%,#180a25_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_85%,rgba(137,28,45,0.55),transparent_55%),radial-gradient(circle_at_75%_30%,rgba(67,59,120,0.45),transparent_60%)] opacity-80" />
        <div className="relative z-10 h-full w-full px-8 py-6">
          <div className="text-sm text-white/70 font-dm">{viewLabel}</div>

          <div className="mt-5 flex min-h-[calc(100vh-160px)] gap-10">
            <aside className="w-60 shrink-0">
              <div className="space-y-4">
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={`group flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 transition overflow-hidden ${
                        selectedFolderId === folder.id
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/15"
                      }`}
                      onClick={() => setSelectedFolderId(folder.id)}
                    >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-dm flex-shrink-0 ${
                          selectedFolderId === folder.id
                            ? "bg-red-500 text-white"
                            : "bg-white/15 text-white/80"
                        }`}
                      >
                        {folder.name.slice(0, 1).toUpperCase()}
                      </div>
                        <div className="text-sm min-w-0 flex-1 overflow-hidden max-w-full">
                          {folder.name.length > 20 ? (
                            <div className="overflow-hidden relative w-full" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)' }}>
                              <div
                                className="inline-block whitespace-nowrap"
                                style={{
                                  animation: 'scroll-text 15s linear infinite',
                                }}
                              >
                                {folder.name}
                                <span className="mx-8">•</span>
                                {folder.name}
                              </div>
                            </div>
                          ) : (
                            <div className="line-clamp-2 break-words" style={{ maxWidth: '20ch' }}>{folder.name}</div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Pitch kit options"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44 bg-black/80 border border-white/20 text-white">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameFolder(folder.id);
                            }}
                            className="focus:bg-white/10"
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                            className="text-red-200 focus:bg-white/10"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateDialog(true)}
                  className="flex h-12 w-full items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white/80 hover:text-white hover:bg-white/15 shadow-[0_0_12px_rgba(0,0,0,0.3)]"
                >
                  <Plus className="h-4 w-4" />
                </button>

              </div>
            </aside>

            <main className="relative flex-1 min-w-0">
              <img
                src="/vynl.png"
                alt="Vinyl"
                className="pointer-events-none absolute right-[-120px] top-0 w-[680px] opacity-90 drop-shadow-[0_0_45px_rgba(0,0,0,0.55)]"
              />
              <div className="relative z-10 h-full pr-6 overflow-y-auto">
                <div className="flex items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full ${clientBadgeClass} flex items-center justify-center text-sm font-dm`}>
                    {clientName.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-3xl font-dm">{selectedFolder?.name ?? "Select a kit"}</div>
                    <div className="text-sm text-white/60">
                      Last update, {formatUpdatedAt(selectedFolder?.updatedAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      className="bg-white/5 text-white border border-white/25 hover:bg-white/15 rounded-full px-5 font-dm focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                      onClick={() => setViewMode("client")}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {viewMode !== "link" ? (
                      <Button
                        size="sm"
                        className="bg-white/5 text-white border border-white/25 hover:bg-white/15 rounded-full px-5 font-dm focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                        onClick={() => setViewMode("link")}
                      >
                        View Results
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-5 font-dm focus-visible:ring-0 focus-visible:ring-offset-0"
                        onClick={() => setViewMode("builder")}
                      >
                        Back to Builder
                      </Button>
                    )}
                  </div>
                  {viewMode === "builder" ? (
                    <Button
                      size="sm"
                      className="bg-white/5 text-white border border-white/25 hover:bg-white/15 rounded-full px-6 font-dm focus-visible:ring-0 focus-visible:ring-offset-0 shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                      onClick={handleExport}
                      disabled={status === "loading"}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-white/90 rounded-full px-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? "Link Copied" : "Copy Link"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 w-full max-w-[820px] space-y-6">
                <div className="relative rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,18,18,0.75),rgba(10,10,12,0.85))] p-6 shadow-[0_0_28px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                  <div className="text-sm text-white/60">Prepared for {clientName || "Client"}</div>
                  <div className="text-xl font-dm text-white">{clientProject || "Project Name"}</div>
                  <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm text-white/70">
                    {clientDescription}
                  </div>
                  <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-[#0f1e2e] border border-white/10 flex items-center justify-center text-[10px] font-dm text-[#b5ff4e]">
                    BMG
                  </div>

                  <div className="mt-5 space-y-3">
                    {isLoadingSongs ? (
                      <div className="flex items-center justify-center py-8 text-white/70">
                        <Loader2 className="h-6 w-6 animate-spin text-white/70" />
                        <span className="ml-3 text-sm">Loading recommended songs...</span>
                      </div>
                    ) : recommendedSongs.length > 0 ? (
                      <div className="space-y-3">
                        {recommendedSongs.map((song) => {
                          // Convert Song to MusicPlayerSong format
                          const musicPlayerSong: MusicPlayerSong = {
                            id: song.id,
                            title: song.title,
                            artist: song.artist,
                            album: song.album,
                            duration: song.duration,
                            keywords: song.keywords || [],
                            thumbnail: song.thumbnail,
                          };

                          return (
                          <div
                            key={song.id}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors"
                            onClick={() => {
                              // Create queue from all songs in the folder
                              const queue: MusicPlayerSong[] = recommendedSongs.map(s => ({
                                id: s.id,
                                title: s.title,
                                artist: s.artist,
                                album: s.album,
                                duration: s.duration,
                                keywords: s.keywords || [],
                                thumbnail: s.thumbnail,
                              }));
                              playSong(musicPlayerSong, queue);
                            }}
                          >
                            <button
                              type="button"
                              className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-black hover:bg-white/90 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                const queue: MusicPlayerSong[] = recommendedSongs.map(s => ({
                                  id: s.id,
                                  title: s.title,
                                  artist: s.artist,
                                  album: s.album,
                                  duration: s.duration,
                                  keywords: s.keywords || [],
                                  thumbnail: s.thumbnail,
                                }));
                                playSong(musicPlayerSong, queue);
                              }}
                            >
                              <Play className="h-5 w-5" />
                            </button>
                            <div className="flex-1 min-w-0 max-w-[200px]">
                              <div className="text-white break-words line-clamp-2 text-sm" style={{ wordBreak: 'break-word' }}>
                                {song.title.length > 22 ? song.title.substring(0, 22) + '...' : song.title}
                              </div>
                              <div className="text-white/50 text-xs truncate">{song.artist}</div>
                              <div className="text-white/40 text-xs truncate">{song.album}</div>
                            </div>
                            <div className="text-sm text-white/70 font-dm w-14 text-right">
                              {songDurations[song.id] || song.duration || "03:00"}
                            </div>
                            {viewMode === "link" ? (
                              <div className="flex items-center gap-2">
                                <button className="h-7 w-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                                  <ThumbsUp className="h-3 w-3" />
                                </button>
                                <button className="h-7 w-7 rounded-full bg-white/10 text-white/70 flex items-center justify-center">
                                  <MessageCircle className="h-3 w-3" />
                                </button>
                                <button className="h-7 w-7 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center">
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 text-xs text-white/60">
                                <span>See More...</span>
                                <button
                                  type="button"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black hover:bg-white/90 transition-colors"
                                  aria-label="Add track to another folder"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSongForFolder(song);
                                    setShowAddToFolderDialog(true);
                                  }}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTrackFromFolder(song.id)}
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black"
                                  aria-label="Remove track"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/60">
                        No songs recommended yet. Add songs from the search results.
                      </div>
                    )}
                  </div>
                </div>

                {currentSong && (
                  <div className="rounded-2xl border border-white/15 bg-black/60 px-5 py-4 shadow-[0_0_24px_rgba(0,0,0,0.4)] backdrop-blur">
                    <div className="flex items-center gap-4">
                      <img
                        src={currentSong.thumbnail || "/NoteAlbumArt.png"}
                        alt="Now playing"
                        className="h-12 w-12 rounded-md object-cover"
                      />
                      <div className="text-sm">
                        <div className="text-white font-dm">{currentSong.title || "Song Title"}</div>
                        <div className="text-white/60 font-exo">{currentSong.artist || "Artist Name"}</div>
                        <div className="text-white/60 font-exo">{currentSong.album || "Album Name"}</div>
                      </div>
                      <div className="flex-1 px-6">
                        <div 
                          className="relative h-[3px] bg-white/20 rounded-full cursor-pointer group"
                          onClick={(e) => {
                            if (!duration) return;
                            const progressBar = e.currentTarget;
                            const rect = progressBar.getBoundingClientRect();
                            const clickX = e.clientX - rect.left;
                            const percentage = clickX / rect.width;
                            const newTime = percentage * duration;
                            seekTo(newTime);
                          }}
                          title="Click to seek"
                        >
                          <div 
                            className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                          <div className="absolute inset-0 rounded-full group-hover:bg-white/10 transition-colors" />
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/60 mt-2 font-dm">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration) || currentSong.duration || "0:00"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button" 
                          className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                          onClick={previousTrack}
                        >
                          <SkipBack className="h-4 w-4" />
                        </button>
                        <button 
                          type="button" 
                          className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? (
                            <Pause className="h-4 w-4" fill="currentColor" />
                          ) : (
                            <Play className="h-4 w-4" fill="currentColor" />
                          )}
                        </button>
                        <button 
                          type="button" 
                          className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                          onClick={nextTrack}
                        >
                          <SkipForward className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {viewMode === "client" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full max-w-2xl rounded-2xl border border-white/20 bg-black/70 p-8 text-white shadow-[0_0_40px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <div className="mb-6 text-xl font-dm">Client</div>
            <div className="space-y-4">
              <Input
                placeholder="(e.g) Disney"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="bg-white/10 text-white border-white/20 placeholder:text-white/40 focus:border-white/40"
              />
              <div className="text-lg font-dm">Film/TV/Video Game/Commercial</div>
              <Input
                placeholder="(e.g) Coca Cola Commercial"
                value={clientProject}
                onChange={(e) => setClientProject(e.target.value)}
                className="bg-white/10 text-white border-white/20 placeholder:text-white/40 focus:border-white/40"
              />
              <div className="text-lg font-dm">Color</div>
              <select
                value={clientColor}
                onChange={(e) => setClientColor(e.target.value)}
                className="h-10 w-full rounded-md bg-white/10 px-3 text-white border border-white/20"
              >
                <option value="red">Red</option>
                <option value="purple">Purple</option>
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="amber">Amber</option>
              </select>
              <div className="text-lg font-dm">Description</div>
              <textarea
                value={clientDescription}
                onChange={(e) => setClientDescription(e.target.value)}
                className="h-24 w-full rounded-md bg-white/10 px-3 py-2 text-sm text-white border border-white/20 placeholder:text-white/40 focus:border-white/40"
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={() => setViewMode("builder")}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

    {/* Create Folder Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="bg-black/80 text-white border border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for your new pitch folder.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateFolder();
            }
          }}
          className="bg-white/10 text-white border-white/20 placeholder:text-white/40 focus:border-white/40"
          autoFocus
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(false)}
            className="border-white/30 text-white hover:bg-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
            className="bg-white/10 text-white border border-white/30 hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Rename Folder Dialog */}
    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <DialogContent className="bg-black/80 text-white border border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for this folder.
          </DialogDescription>
        </DialogHeader>
        <Input
          placeholder="Folder name"
          value={renameFolderName}
          onChange={(e) => setRenameFolderName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSaveRename();
            }
          }}
          className="bg-white/10 text-white border-white/20 placeholder:text-white/40 focus:border-white/40"
          autoFocus
        />
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowRenameDialog(false)}
            className="border-white/30 text-white hover:bg-white/10 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveRename}
            disabled={!renameFolderName.trim()}
            className="bg-white/10 text-white border border-white/30 hover:bg-white/20 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Add to Folder Dialog */}
    <Dialog open={showAddToFolderDialog} onOpenChange={setShowAddToFolderDialog}>
      <DialogContent className="sm:max-w-[425px] bg-black/80 border border-white/20 text-white p-6 rounded-xl shadow-[0_0_18px_rgba(0,0,0,0.4)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-dm">Add to Pitch Kit</DialogTitle>
          <DialogDescription className="text-white/70">
            Select a folder to add "{selectedSongForFolder?.title}" by "{selectedSongForFolder?.artist}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[300px] overflow-y-auto">
          {availableFolders.length > 0 ? (
            availableFolders.map((folder) => (
              <button
                key={folder.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                onClick={() => handleAddSongToFolder(folder.id)}
              >
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-dm flex-shrink-0">
                  {folder.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left font-dm">{folder.name}</div>
                <div className="text-xs text-white/50">{folder.trackIds.length} track{folder.trackIds.length !== 1 ? 's' : ''}</div>
              </button>
            ))
          ) : (
            <p className="text-center text-white/50">No Pitch Kit folders found. Create one using the "+" button.</p>
          )}
        </div>
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => setShowAddToFolderDialog(false)}
            className="text-white/70 hover:bg-white/10"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
