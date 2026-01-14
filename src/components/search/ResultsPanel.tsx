import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react";

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
}

export const ResultsPanel = ({
  isLoading,
  showResults,
  thinkingText,
  isPlaying,
  onTogglePlay,
  searchResults,
  fallbackSongs,
}: ResultsPanelProps) => {
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
              <div className="flex flex-col items-center gap-4">
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
                <div className="text-center">
                  <div className="text-xl font-dm">Bite Me</div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white font-exo">
                    ENHYPEN
                    <span className="mx-2 inline-block h-1 w-1 rounded-full bg-white align-middle" />
                    DARK BLOOD
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white font-exo">
                    BELIFT LAB
                  </div>
                </div>
                <div className="w-full max-w-xs">
                  <div className="relative h-[3px] bg-white/20 rounded-full">
                    <div className="absolute left-0 top-0 h-full w-[35%] bg-[#e4ea04] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white font-dm mt-2">
                    <span>00:00</span>
                    <span>2:37</span>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-4">
                    <button type="button" className="text-white/80 hover:text-white">
                      <SkipBack className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={onTogglePlay}
                      className="h-12 w-12 rounded-full border border-white/40 flex items-center justify-center"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button type="button" className="text-white/80 hover:text-white">
                      <SkipForward className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="w-2/3">
                    <h2 className="text-3xl font-dm font-normal mb-5">The Details</h2>
                    
                    <div className="flex-col mb-5">
                      <div className="text-lg font-dm font-normal mb-2">Genre</div>
                        <div className="flex gap-2 flex-wrap mt-2">
                          <Badge className="bg-[#2bb7b1] text-white rounded-full px-4 py-1 font-dm font-normal">Kpop</Badge>
                          <Badge className="bg-[#7c3aed] text-white rounded-full px-4 py-1 font-dm font-normal">Pop Punk</Badge>
                          <Badge className="bg-[#34d399] text-white rounded-full px-4 py-1 font-dm font-normal">Emo Pop</Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-dm font-normal mb-2">Mood</div>
                        <div className="flex gap-2 flex-wrap mt-2">
                          <Badge className="bg-[#4338ca] text-white rounded-full px-4 py-1 font-dm font-normal">Dark</Badge>
                          <Badge className="bg-[#b45309] text-white rounded-full px-4 py-1 font-dm font-normal">Suspense</Badge>
                        </div>
                    </div>
                    
                  </div>
                  
                  <div className="flex flex-col gap-3 items-end">
                    <Button size="sm" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo min-w-[180px] backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Playlist
                    </Button>
                    <Button size="sm" className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo min-w-[180px] backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]">
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Pitch Kit
                    </Button>
                    <div className="text-sm text-white text-left font-exo">
                      Key: C# Major
                      <br />
                      Tempo: 105 BPM
                      <br />
                      Duration: 2:38
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
                  <div key={song.id} className="flex items-center gap-3">
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
                        <span className="text-xs text-white font-dm">{song.duration}</span>
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
