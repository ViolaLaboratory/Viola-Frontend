import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { CheckCircle2, Loader2, Paperclip, MoreHorizontal, Plus, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import API_ENDPOINTS from "@/config/api";
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

  return (
    <>
      {status !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur">
          {status === "loading" ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-lg font-medium text-foreground">Preparing your export…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <CheckCircle2 className="h-16 w-16 text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
              <p className="text-xl font-semibold text-foreground">File saved to your computer</p>
            </div>
          )}
        </div>
      )}
      <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <aside className="w-64 bg-muted sticky top-[74px] self-start h-[700px] border-r border-border bg-[linear-gradient(to_bottom,#000,#14166C)]">
        <div className="p-4 space-y-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`group w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors cursor-pointer ${
                selectedFolderId === folder.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              onClick={() => setSelectedFolderId(folder.id)}
            >
              <span className="truncate">{folder.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-secondary rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameFolder(folder.id);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Folder
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-10 pb-28">
        {/* Header */}
        <div className="">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-medium text-foreground font-dm">
                {selectedFolderId ? getFolderById(selectedFolderId)?.name || "Select a folder" : "Select a folder"}
              </h1>
              <Badge variant="outline" className="border-border text-foreground px-4 py-1 text-sm flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                Brief
              </Badge>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-white font-dm text-lg py-2 px-6 bg-red-600 rounded-full ">Netflix</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl text-white mb-3 font-dm">Description</h2>
            <div className="bg-black rounded-lg p-6 mb-6">
              <p className="text-muted-foreground leading-relaxed">
                Based on the brief, we recommend the following two songs for the suspenseful scene where lead girl and
                lead boy are chased in the woods at 00:11:02 of S1E3 of Stranger Things on Netflix.
              </p>
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div>
          <h2 className="text-xl text-white mb-4 font-dm">Songs</h2>
          {isLoadingSongs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-3 text-muted-foreground">Loading recommended songs...</p>
            </div>
          ) : recommendedSongs.length > 0 ? (
            <div className="space-y-3 z-1">
              {recommendedSongs.map((song) => (
              <ContextMenu key={song.id}>
                <ContextMenuTrigger asChild>
                  <div className="bg-card border border-border rounded-lg p-4 hover:bg-hover-row transition-colors cursor-context-menu">
                    {/* Top Row */}
                    <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-2xl">{song.thumbnail}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-medium">{song.title}</span>
                          <span className="text-muted-foreground italic">{song.artist}</span>
                          <span className="text-foreground">{song.album}</span>
                          <div className="flex gap-2 ml-auto">
                            {song.keywords.map((keyword, idx) => (
                              <Badge key={idx} className="bg-secondary/50 text-foreground border-0">
                                {keyword}
                              </Badge>
                            ))}
                            <span className="text-foreground ml-4">{song.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-center gap-8 ml-16 text-sm">
                      <span className="text-foreground">{song.producer}</span>
                      <span className="text-muted-foreground italic">{song.writer}</span>
                      <span className="text-foreground">{song.licensing}</span>
                    </div>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => handleRemoveTrackFromFolder(song.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete from folder
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No songs recommended yet. Add songs from the search results.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8">
          <Button 
            size="lg" 
            className="bg-[#C4D82E] hover:bg-[#B5C929] text-black font-medium px-8"
            onClick={handleExport}
            disabled={status === "loading"}
          >
            Export
          </Button>
        </div>
      </main>
    </div>

    {/* Create Folder Dialog */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent>
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
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Rename Folder Dialog */}
    <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
      <DialogContent>
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
          autoFocus
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveRename} disabled={!renameFolderName.trim()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
