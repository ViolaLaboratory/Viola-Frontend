import { Play, SkipBack, SkipForward, Volume2, ListMusic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export const MusicPlayer = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-border px-6 py-4">
      <div className="flex items-center justify-between gap-8">
        {/* Current Track Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-14 h-14 bg-secondary rounded flex items-center justify-center text-2xl flex-shrink-0">
            <img
            src="/NoteAlbumArt.png"
            alt="Album Art"
            className=""
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-white font-medium truncate font-dm font-extrabold">Trophies</span>
            <span className="text-muted-foreground text-sm truncate font-dm">Drake</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="transition all duration-300 h-8 w-8 hover:bg-[#E4EA04]/30">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="transition all duration-300 h-10 w-10 bg-[#E4EA04] hover:bg-[#E4EA04]/80 text-black rounded-full">
              <Play className="h-5 w-5" fill="currentColor" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-[#E4EA04]/40">
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground">0:00</span>
            <Slider defaultValue={[20]} max={100} step={1} className="flex-1" />
            <span className="text-xs text-muted-foreground">2:34</span>
          </div>
        </div>

        {/* Volume & Additional Controls */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
          </div>
          <Button variant="ghost" size="icon" className="transition all duration-300 h-8 w-8 text-[#E4EA04] hover:bg-[#E4EA04] hover:text-black">
            <ListMusic className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
