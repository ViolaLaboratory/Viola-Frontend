import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { ChatPanel } from "@/components/search/ChatPanel";
import { ResultsPanel } from "@/components/search/ResultsPanel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PitchBuilder } from "./PitchBuilder"; // Import your existing PitchBuilder
import API_ENDPOINTS from "@/config/api";
import { fetchTrackDetailsFromMongoDB } from "@/services/trackService";
import {
  getFolders,
  addTracksToFolder,
  type Folder,
} from "@/services/folderService";
/* NEW IMPORT: Chat history service for session persistence */
import {
  saveChatSession,
  getChatSessionById,
} from "@/services/chatHistoryService";

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
  },
  {
    id: 6,
    title: "Shadow Work",
    artist: "Nyx Collective",
    album: "Nocturnal Bloom",

    keywords: ["Mysterious", "Hypnotic", "Minimal", "Deep"],
    duration: "04:22",
  },
  {
    id: 7,
    title: "Crimson Hour",
    artist: "Scarlet Waves",
    album: "Afterglow",

    keywords: ["Melancholic", "Atmospheric", "Emotional", "Cinematic"],
    duration: "03:45",
  },
  {
    id: 8,
    title: "Void Walker",
    artist: "Echo Chamber",
    album: "Infinite Silence",

    keywords: ["Ambient", "Dark", "Expansive", "Meditative"],
    duration: "05:12",
  },
  {
    id: 9,
    title: "Phantom Strings",
    artist: "String Theory",
    album: "Resonance",

    keywords: ["Orchestral", "Tense", "Building", "Dramatic"],
    duration: "03:28",
  },
  {
    id: 10,
    title: "Neon Grave",
    artist: "Cyber Elegy",
    album: "Digital Requiem",

    keywords: ["Synthwave", "Retro", "Nostalgic", "Melancholic"],
    duration: "04:01",
  },
];

const typingPhrases = [
  "spooky choirs...",
  "dark synths...",
  "a spicy melody...",
  "cinematic builds...",
];

const thinkingPhrases = [
  "humming along...",
  "arguing with managers...",
  "going for lunch...",
];

export const SearchInterface = () => {
  /* ROUTING HOOKS: For navigation and URL parameters */
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams<{ sessionId?: string }>();
  const { toast } = useToast();

  /* STATE: Search and UI */
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showPitchBuilder, setShowPitchBuilder] = useState(false);
  const [showPitchSelection, setShowPitchSelection] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<number>>(
    new Set()
  );
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  /* STATE: Chat session management */
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; message: string }>
  >([]);
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  /* STATE: Track current chat session ID for saving */
  const [currentChatSessionId, setCurrentChatSessionId] = useState<
    string | null
  >(null);

  /* EFFECT: Initialize session - handle resuming saved sessions or starting new ones */
  useEffect(() => {
    // CASE 1: Resuming a saved chat session from URL parameter
    if (urlSessionId) {
      const savedSession = getChatSessionById(urlSessionId);

      if (savedSession) {
        // Restore chat session from history
        setCurrentChatSessionId(urlSessionId);
        setSessionId(savedSession.sessionId);
        setConversationHistory(savedSession.conversationHistory);
        setChatMessage(
          savedSession.conversationHistory[
            savedSession.conversationHistory.length - 1
          ]?.message || "Session resumed"
        );
        setHasSearched(true);
        setIsFirstMessage(false);

        // Note: Results are not persisted in localStorage, so we don't restore them
        // User will see the conversation but may need to re-run search if they want results
        toast({
          title: "Chat session resumed",
          description: `Conversation: "${savedSession.title}"`,
        });
      } else {
        // Session not found in history
        toast({
          title: "Session not found",
          description: "Starting a new search session instead",
          variant: "destructive",
        });
        navigate("/demo/search", { replace: true });
      }
    }
    // CASE 2: Starting new session from HomePage (query in location.state)
    else if (location.state?.query) {
      const initialQuery = location.state.query;

      // Generate new session ID
      const newSessionId = crypto.randomUUID();
      localStorage.setItem("viola_session_id", newSessionId);
      setSessionId(newSessionId);

      // Set search query and trigger search automatically
      setSearchQuery(initialQuery);
      setIsFirstMessage(true);

      // Clear the location state to prevent re-triggering
      navigate(location.pathname, { replace: true, state: {} });

      // Trigger search automatically (after a brief delay to ensure state is set)
      setTimeout(() => {
        const form = document.querySelector("form");
        if (form) {
          form.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true })
          );
        }
      }, 100);
    }
    // CASE 3: Regular new session
    else {
      const storedSessionId = localStorage.getItem("viola_session_id");
      if (storedSessionId) {
        setSessionId(storedSessionId);
      } else {
        const newSessionId = crypto.randomUUID();
        localStorage.setItem("viola_session_id", newSessionId);
        setSessionId(newSessionId);
      }

      // Set default welcome message
      setChatMessage(
        "Hi! Tell me what kind of music you'd like, and I'll help you find the perfect tracks."
      );
    }

    // Load folders
    setFolders(getFolders());
  }, [urlSessionId, location.state]); // Re-run if URL session ID or location state changes

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
    setConversationHistory((prev) => [
      ...prev,
      { role: "user", message: userMessage },
    ]);

    try {
      // Call backend search endpoint (proxies to chatbot, then CLAP when complete)
      const response = await fetch(API_ENDPOINTS.MUSIC_SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          session_id: sessionId,
          is_new_session: isFirstMessage, // used to tell the backend to initialize a new chatbot session
        }),
      });

      // Mark that we've sent the first message
      if (isFirstMessage) {
        setIsFirstMessage(false);
      }

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Store session ID
      if (data.session_id) {
        setSessionId(data.session_id);
        localStorage.setItem("viola_session_id", data.session_id);
      }

      // Add bot response to conversation
      if (data.message) {
        setChatMessage(data.message);
        setConversationHistory((prev) => [
          ...prev,
          { role: "bot", message: data.message },
        ]);
      }

      // Check if conversation is complete and we have results
      if (data.is_complete && data.tracks && data.tracks.length > 0) {
        // Use tracks directly from backend response (no separate fetch needed)

        const songs = data.tracks.map((track: any) => ({
          id: parseInt(track.id) || 0,
          title: track.title || "Unknown Title",
          artist: track.artist || "Unknown Artist",
          album: track.album || "Unknown Album",
          keywords: [track.genre || "Music"],
          duration: track.duration || "03:00",
        }));

        setSearchResults(songs);
        setShowResults(true);
        setIsLoading(false);
        setWaitingForResponse(false);

        /* NEW: Save completed chat session to history */
        const updatedHistory = [
          ...conversationHistory,
          { role: "bot", message: data.message },
        ];

        // Generate chat session ID if we don't have one yet
        const chatSessionId = currentChatSessionId || crypto.randomUUID();
        setCurrentChatSessionId(chatSessionId);

        // Extract title from first user message (truncate to 50 chars)
        const firstUserMessage =
          updatedHistory.find((msg) => msg.role === "user")?.message ||
          "Untitled Search";
        const title =
          firstUserMessage.length > 50
            ? firstUserMessage.slice(0, 50) + "..."
            : firstUserMessage;

        // Save to chat history
        saveChatSession({
          id: chatSessionId,
          title: title,
          query: firstUserMessage,
          sessionId: data.session_id,
          conversationHistory: updatedHistory,
          resultCount: songs.length,
          createdAt: currentChatSessionId ? Date.now() : Date.now(), // Keep original if updating
          updatedAt: Date.now(),
        });

        // Dispatch custom event to notify sidebar of chat history update
        window.dispatchEvent(new Event("chatHistoryUpdated"));
      } else {
        // Conversation is still ongoing - bot is asking for more info
        setIsLoading(false);
        setWaitingForResponse(false);
        setShowResults(false);
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

  // Thinking text animation effect - runs when loading
  useEffect(() => {
    if (!isLoading) {
      setThinkingText("");
      return;
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(
      () => {
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
      },
      deleting ? 90 : 100
    );

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Placeholder text animation effect
  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const intervalId = setInterval(
      () => {
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
      },
      deleting ? 400 : 170
    );

    return () => clearInterval(intervalId);
  }, []);

  const toggleTrackSelection = (songId: number) => {
    setSelectedTrackIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(songId)) {
        newSet.delete(songId);
      } else {
        newSet.add(songId);
      }
      return newSet;
    });
  };

  const handleSaveToFolder = () => {
    if (selectedTrackIds.size === 0) {
      return;
    }
    setShowFolderDialog(true);
  };

  const saveTracksToFolder = (folderId: string) => {
    const trackIdsToSave = Array.from(selectedTrackIds).map((id) =>
      id.toString()
    );
    addTracksToFolder(folderId, trackIdsToSave);
    setShowFolderDialog(false);
    setSelectedTrackIds(new Set());
    // Show success feedback (could use a toast here)
    alert(`Saved ${trackIdsToSave.length} track(s) to folder`);
  };

  const addToPitch = (song: Song) => {
    setSelectedSong(song);
    setShowPitchSelection(true);

    // Save track ID to localStorage for PitchBuilder (legacy support)
    const savedTrackIds = JSON.parse(
      localStorage.getItem("pitch_track_ids") || "[]"
    );
    if (!savedTrackIds.includes(song.id.toString())) {
      savedTrackIds.push(song.id.toString());
      localStorage.setItem("pitch_track_ids", JSON.stringify(savedTrackIds));
    }
  };

  const selectPitch = (folder: Folder) => {
    if (selectedSong) {
      // Add the selected song to the chosen folder
      addTracksToFolder(folder.id, [selectedSong.id.toString()]);

      // Refresh folders to show updated track counts
      setFolders(getFolders());

      // Show success feedback
      alert(`Added "${selectedSong.title}" to ${folder.name}`);
    }
    setShowPitchSelection(false);
    setSelectedSong(null);
  };

  if (showPitchBuilder) {
    return <PitchBuilder />;
  }

  return (
    <div className="h-screen w-full relative overflow-hidden text-white font-dm">
      <style>
        {`
          @keyframes cd-spin {
            from { transform: rotate(var(--start-rotation, 0deg)); }
            to { transform: rotate(calc(var(--start-rotation, 0deg) + 360deg)); }
          }
          .cd-disc.is-spinning {
            animation: cd-spin 3.2s linear infinite;
          }
          .album-spin.is-spinning {
            animation: cd-spin 7s linear infinite;
            animation-play-state: running;
          }
          .album-spin.is-paused {
            animation-play-state: paused;
          }
          .loading-drive {
            width: 420px;
            max-width: 80%;
            height: 180px;
            border: 1px solid rgba(255,255,255,0.5);
            border-radius: 12px;
            position: relative;
          }
          .loading-drive::before {
            content: "";
            position: absolute;
            left: 50%;
            top: 58%;
            transform: translate(-50%, -50%);
            width: 72%;
            height: 16px;
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 999px;
          }
          .loading-drive::after {
            content: "";
            position: absolute;
            right: 18px;
            top: 22px;
            width: 10px;
            height: 10px;
            border-radius: 999px;
            background: rgba(255,255,255,0.9);
          }
        `}
      </style>

      <div className="relative z-10 flex h-screen w-full">
        <ChatPanel
          conversationHistory={conversationHistory}
          waitingForResponse={waitingForResponse}
          isLoading={isLoading}
          showResults={showResults}
          thinkingText={thinkingText}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSubmit={handleSearch}
        />
        <ResultsPanel
          isLoading={isLoading}
          showResults={showResults}
          thinkingText={thinkingText}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((prev) => !prev)}
          searchResults={searchResults}
          fallbackSongs={mockSongs}
        />
      </div>

      {/* Folder Selection Dialog */}
      <Dialog open={showFolderDialog} onOpenChange={setShowFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Tracks to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to save {selectedTrackIds.size} track
              {selectedTrackIds.size > 1 ? "s" : ""} to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => saveTracksToFolder(folder.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/10 transition-all duration-200 text-left group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                  {folder.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-lg">{folder.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {folder.trackIds.length} track
                    {folder.trackIds.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-8 h-8 bg-[#E4EA04] rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-black" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Pitch Selection Modal */}
      {showPitchSelection && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm drop-shadow-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-dm">Add to Pitch</h2>
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
                      className="rounded-sm w-full h-full"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{selectedSong.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSong.artist}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                Select a folder to add this song to:
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => selectPitch(folder)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent hover:border-purple-200 hover:bg-purple-50/10 transition-all duration-200 text-left group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                      {folder.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{folder.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {folder.trackIds.length} track
                        {folder.trackIds.length !== 1 ? "s" : ""}
                      </div>
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
