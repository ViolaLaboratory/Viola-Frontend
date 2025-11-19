import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Paperclip } from "lucide-react";

const savedPitches = [
  "Stranger Things",
  "The White Lotus", 
  "Now You See Me: Now You Don't",
  "Adidas",
  "Lego Batman",
];

const recommendedSongs = [
  {
    id: 1,
    title: "Static Bloom",
    artist: "Vela Noir",
    album: "Neon Afterglow",
    thumbnail: "🎵",
    producer: "Harper Woldt",
    writer: "Vela Noir",
    licensing: "Master + Publishing Ready",
    keywords: ["Glitch", "Ethereal", "Analog"],
    duration: "03:06",
  },
  {
    id: 2,
    title: "Ash Lanterns",
    artist: "Orion Vale",
    album: "Pale Signal",
    thumbnail: "🎵",
    producer: "Seraphine West",
    writer: "Orion Vale",
    licensing: "Pre-cleared",
    keywords: ["Tension", "Noir", "Cinematic"],
    duration: "04:28",
  },
  {
    id: 3,
    title: "Moonlit Concrete",
    artist: "Midnight Highrise",
    album: "Grayscale Echoes",
    thumbnail: "🎵",
    producer: "Anika Rhee",
    writer: "Anika Rhee",
    licensing: "Master + Publishing",
    keywords: ["Industrial", "Pulse", "Noir"],
    duration: "03:12",
  },
];

export const PitchBuilder = () => {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleExport = () => {
    if (status === "loading") return;

    setStatus("loading");

    setTimeout(() => {
      setStatus("success");

      setTimeout(() => {
        setStatus("idle");
      }, 1800);
    }, 1800);
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
      <div className="flex h-[calc(100vh-200px)]">
      {/* Left Sidebar */}
      <aside className="w-64 bg-muted border-r border-border">
        <div className="p-4 space-y-2">
          {savedPitches.map((pitch, index) => (
            <button
              key={index}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                index === 0
                  ? "bg-secondary/50 text-foreground"
                  : "text-muted-foreground hover:bg-secondary/30"
              }`}
            >
              {pitch}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-4xl font-medium text-foreground">Stranger Things</h1>
            <Badge variant="outline" className="border-destructive text-destructive px-4 py-1 text-sm">
              Netflix
            </Badge>
            <Badge variant="outline" className="border-border text-foreground px-4 py-1 text-sm flex items-center gap-1">
              <Paperclip className="h-3 w-3" />
              Brief
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl text-muted-foreground mb-3">Description</h2>
            <div className="bg-muted/30 rounded-lg p-6">
              <p className="text-muted-foreground leading-relaxed">
                Based on the brief, we recommend the following two songs for the suspenseful scene where lead girl and
                lead boy are chased in the woods at 00:11:02 of S1E3 of Stranger Things on Netflix.
              </p>
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div>
          <h2 className="text-xl text-muted-foreground mb-4">Songs</h2>
          <div className="space-y-3">
            {recommendedSongs.map((song) => (
              <div
                key={song.id}
                className="bg-card border border-border rounded-lg p-4 hover:bg-hover-row transition-colors"
              >
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
            ))}
          </div>
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
          <Button 
            size="lg" 
            variant="outline" 
            className="border-destructive text-destructive hover:bg-destructive/10 font-medium px-8"
          >
            Save
          </Button>
        </div>
      </main>
    </div>
    </>
  );
};
