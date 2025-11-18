import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Paperclip } from "lucide-react";

const savedPitches = [
  "Saved Song 1",
  "Saved Song 2", 
  "Saved Song 3",
  "Saved Song 4",
  "Saved Song 5",
];

const recommendedSongs = [
  {
    id: 1,
    title: "Song Title",
    artist: "Artist Name",
    album: "Album Name",
    producer: "Producer Name",
    writer: "Writer Name",
    licensing: "Licensing Details",
    keywords: ["Keyword 1", "Keyword 2"],
    duration: "00:00",
  },
  {
    id: 2,
    title: "Song Title",
    artist: "Artist Name",
    album: "Album Name",
    producer: "Producer Name",
    writer: "Writer Name",
    licensing: "Licensing Details",
    keywords: ["Keyword 1", "Keyword 2"],
    duration: "00:00",
  },
  {
    id: 3,
    title: "Song Title",
    artist: "Artist Name",
    album: "Album Name",
    producer: "Producer Name",
    writer: "Writer Name",
    licensing: "Licensing Details",
    keywords: ["Keyword 1", "Keyword 2"],
    duration: "00:00",
  },
];

export const PitchBuilder = () => {
  return (
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
                  <div className="w-12 h-12 bg-muted rounded"></div>
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
  );
};
