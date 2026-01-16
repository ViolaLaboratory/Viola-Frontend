import { useState, useEffect } from "react";
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
import { CheckCircle2, Loader2, MoreHorizontal, Plus, Pencil, Trash2, ArrowUp, Play, ThumbsUp, MessageCircle, X, SkipBack, SkipForward } from "lucide-react";
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

// Fetch track details helper (uses MongoDB, falls back to ChromaDB)
const fetchTrackDetails = async (trackIds: string[]): Promise<Song[]> => {
  try {
    const tracks = await fetchTrackDetailsFromMongoDB(trackIds);
    // Convert TrackDetails to Song format
    return tracks.map((track) => ({
      id: parseInt(track.id) || 0,
      title: track.title,
      artist: track.artist,
      album: track.album,
      thumbnail: track.thumbnail || "🎵",
      producer: track.producer || "Unknown Producer",
      writer: track.writer || "Unknown Writer",
      licensing: track.licensing || "Standard",
      keywords: track.keywords || ["Music"],
      duration: track.duration,
    }));
  } catch (error) {
    console.error("Error fetching track details:", error);
    // Fallback to placeholder data
    return trackIds.map((id, index) => ({
      id: parseInt(id) || index + 1,
      title: `Track ${id}`,
      artist: "Unknown Artist",
      album: "Unknown Album",
      thumbnail: "🎵",
      producer: "Unknown Producer",
      writer: "Unknown Writer",
      licensing: "Standard",
      keywords: ["Music"],
      duration: "03:00",
    }));
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
}

export const PitchBuilder = () => {
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
          const songs = await fetchTrackDetails(folder.trackIds);
          setRecommendedSongs(songs);
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

      // Create a text file with track information for each track
      for (const trackId of folder.trackIds) {
        const trackDetails = await fetchTrackDetails([trackId]);
        if (trackDetails.length > 0) {
          const track = trackDetails[0];
          const trackInfo = `Title: ${track.title}\nArtist: ${track.artist}\nAlbum: ${track.album}\nDuration: ${track.duration}\nProducer: ${track.producer}\nWriter: ${track.writer}\nLicensing: ${track.licensing}\nKeywords: ${track.keywords.join(", ")}\n`;
          zip.file(`${track.title.replace(/[^a-z0-9]/gi, "_")}_${trackId}.txt`, trackInfo);
        }
      }

      // Generate ZIP file and trigger download
      const blob = await zip.generateAsync({ type: "blob" });
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
                      className={`group flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 transition ${
                        selectedFolderId === folder.id
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/70 hover:bg-white/15"
                      }`}
                      onClick={() => setSelectedFolderId(folder.id)}
                    >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-dm ${
                          selectedFolderId === folder.id
                            ? "bg-red-500 text-white"
                            : "bg-white/15 text-white/80"
                        }`}
                      >
                        {folder.name.slice(0, 1).toUpperCase()}
                      </div>
                        <div className="text-sm truncate">{folder.name}</div>
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
                        {recommendedSongs.map((song) => (
                          <div
                            key={song.id}
                            className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                          >
                            <button
                              type="button"
                              className="flex h-12 w-12 items-center justify-center rounded-md bg-white text-black"
                            >
                              <Play className="h-5 w-5" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="text-white">{song.title}</div>
                              <div className="text-white/50 text-xs">{song.artist}</div>
                              <div className="text-white/40 text-xs">{song.album}</div>
                            </div>
                            <div className="text-sm text-white/70 font-dm w-14 text-right">
                              {song.duration}
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
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-black"
                                  aria-label="Add track"
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
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-white/60">
                        No songs recommended yet. Add songs from the search results.
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-black/60 px-5 py-4 shadow-[0_0_24px_rgba(0,0,0,0.4)] backdrop-blur">
                  <div className="flex items-center gap-4">
                    <img
                      src="/NoteAlbumArt.png"
                      alt="Now playing"
                      className="h-12 w-12 rounded-md"
                    />
                    <div className="text-sm">
                      <div className="text-white">Song Title</div>
                      <div className="text-white/60">Artist Name</div>
                      <div className="text-white/60">Album Name</div>
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
                      <button type="button" className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center focus-visible:ring-0 focus-visible:ring-offset-0">
                        <SkipBack className="h-4 w-4" />
                      </button>
                      <button type="button" className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center focus-visible:ring-0 focus-visible:ring-offset-0">
                        <Play className="h-4 w-4" />
                      </button>
                      <button type="button" className="h-9 w-9 rounded-full border border-white/40 flex items-center justify-center focus-visible:ring-0 focus-visible:ring-offset-0">
                        <SkipForward className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
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
    </>
  );
};
