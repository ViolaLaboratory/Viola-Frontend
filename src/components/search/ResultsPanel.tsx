import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pause, Play, Plus, SkipBack, SkipForward } from "lucide-react";

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
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songDurations, setSongDurations] = useState<Record<number, string>>({});

  // Default to first song if no selection yet
  const displayedSong =
    selectedSong || (searchResults.length > 0 ? searchResults[0] : fallbackSongs[0]);
  const songsToDisplay = searchResults.length > 0 ? searchResults : fallbackSongs;

  // Preload audio metadata for durations (top 10)
  useEffect(() => {
    const songsToPreload = songsToDisplay.slice(0, 10);

    songsToPreload.forEach((song) => {
      if (!song?.id) return;
      if (songDurations[song.id]) return;

      const audio = new Audio();
      const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${
        (song.id % 10) + 1
      }.mp3`;

      const onLoaded = () => {
        const d = audio.duration;
        if (d > 0) {
          const minutes = Math.floor(d / 60);
          const seconds = Math.floor(d % 60);
          const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;

          setSongDurations((prev) => ({
            ...prev,
            [song.id]: formatted,
          }));
        }
        cleanup();
      };

      const onError = () => cleanup();

      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", onLoaded);
        audio.removeEventListener("error", onError);
        audio.src = "";
        audio.load();
      };

      audio.addEventListener("loadedmetadata", onLoaded);
      audio.addEventListener("error", onError);

      audio.src = audioUrl;
      audio.load();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songsToDisplay]);

  if (!isLoading && !showResults) {
    return null;
  }

  // Helper to split keywords into genres and moods (simple heuristic)
  const getGenresAndMoods = (keywords: string[]) => {
    const genreKeywords = [
      "Kpop",
      "Pop",
      "Pop Punk",
      "Emo Pop",
      "R&B",
      "Hip Hop",
      "Electronic",
      "EDM",
      "Indie",
      "Rock",
      "Synthwave",
      "Alternative",
      "Ambient",
      "Darkwave",
      "Orchestral",
      "Cinematic",
    ];
    const moodKeywords = [
      "Dark",
      "Suspense",
      "Eerie",
      "Suspenseful",
      "Atmospheric",
      "Horror",
      "Tension",
      "Mysterious",
      "Haunting",
      "Ethereal",
      "Cold",
      "Hypnotic",
      "Minimal",
      "Deep",
      "Melancholic",
      "Emotional",
      "Expansive",
      "Meditative",
      "Tense",
      "Building",
      "Dramatic",
      "Retro",
      "Nostalgic",
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
    onTogglePlay();
  };

  return (
    <section className="w-2/3 p-8 h-screen overflow-y-auto font-exo text-white mt-3 z-5">
      <div className="min-h-full backdrop-blur-[12px]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-10">
            <div className="text-xs tracking-[0.3em] text-white uppercase">
              Updating brief instructions... / Loading CDs / etc...
            </div>
            <div className="loading-drive" />
            <div className="cd-disc w-44 h-44 rounded-full border-[10px] border-white/90 shadow-[0_0_30px_rgba(255,255,255,0.25)]" />
            <div className="text-white text-sm">{thinkingText}</div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-10 text-white">
            <div className="flex items-start gap-12">
              <div className="flex w-[320px] flex-col items-center gap-4 shrink-0">
                <div className="relative h-64 w-64 flex items-center justify-center">
                  <img
                    src="/NoteAlbumArt.png"
                    alt="Album art"
                    className="album-spin is-spinning h-56 w-56 rounded-full object-cover"
                    style={{ animationPlayState: isPlaying ? "running" : "paused" }}
                  />
                </div>

                <div className="w-full px-2 text-center h-[54px] flex flex-col justify-center">
                  <div className="text-xl font-dm truncate whitespace-nowrap overflow-hidden text-ellipsis">
                    {displayedSong?.title || "Bite Me"}
                  </div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white font-exo truncate whitespace-nowrap overflow-hidden text-ellipsis">
                    {displayedSong?.artist || "ENHYPEN"}
                    <span className="mx-2 inline-block h-1 w-1 rounded-full bg-white align-middle" />
                    {displayedSong?.album || "DARK BLOOD"}
                  </div>
                </div>

                <div className="w-full max-w-xs mt-6">
                  <div className="relative h-[3px] bg-white/20 rounded-full mb-2">
                    <div className="absolute left-0 top-0 h-full w-[35%] bg-[#e4ea04] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-white font-dm mb-3">
                    <span>{formatTime(0)}</span>
                    <span>{displayedSong?.duration || "2:37"}</span>
                  </div>

                  <div className="flex items-center justify-center gap-5">
                    <button type="button" className="text-white/80 hover:text-white">
                      <SkipBack className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handlePlayPause}
                      className="h-12 w-12 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>

                    <button type="button" className="text-white/80 hover:text-white">
                      <SkipForward className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6 ml-8 min-h-[500px]">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-3xl font-dm font-normal mb-5">The Details</h2>

                    <div className="flex-col mb-5">
                      <div className="text-lg font-dm font-normal mb-2">Genre</div>
                      <div className="flex gap-2 flex-wrap mt-2 min-h-[32px] items-start">
                        {genres.length > 0 ? (
                          genres.map((genre, idx) => {
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
                                className={`${colors[idx % colors.length]} hover:opacity-90 text-white rounded-full px-4 py-1 font-dm font-normal transition-none`}
                              >
                                {genre}
                              </Badge>
                            );
                          })
                        ) : (
                          <>
                            <Badge className="bg-[#2bb7b1] hover:bg-[#2bb7b1] text-white rounded-full px-4 py-1 font-dm font-normal transition-none">
                              Kpop
                            </Badge>
                            <Badge className="bg-[#7c3aed] hover:bg-[#7c3aed] text-white rounded-full px-4 py-1 font-dm font-normal transition-none">
                              Pop Punk
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="text-lg font-dm font-normal mb-2">Mood</div>
                      <div className="flex gap-2 flex-wrap mt-2 min-h-[32px] items-start">
                        {moods.length > 0 ? (
                          moods.map((mood, idx) => {
                            const colors = [
                              "bg-[#4338ca]",
                              "bg-[#b45309]",
                              "bg-[#059669]",
                              "bg-[#7c2d12]",
                              "bg-[#581c87]",
                            ];
                            return (
                              <Badge
                                key={idx}
                                className={`${colors[idx % colors.length]} hover:opacity-90 text-white rounded-full px-4 py-1 font-dm font-normal transition-none`}
                              >
                                {mood}
                              </Badge>
                            );
                          })
                        ) : (
                          <>
                            <Badge className="bg-[#4338ca] hover:bg-[#4338ca] text-white rounded-full px-4 py-1 font-dm font-normal transition-none">
                              Dark
                            </Badge>
                            <Badge className="bg-[#b45309] hover:bg-[#b45309] text-white rounded-full px-4 py-1 font-dm font-normal transition-none">
                              Suspense
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 items-end flex-shrink-0" style={{ width: "200px" }}>
                    <Button
                      size="sm"
                      className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo w-full backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Playlist
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white/10 text-white border border-white/30 hover:bg-white/20 rounded-full px-6 font-exo w-full backdrop-blur-md shadow-[inset_0_1px_10px_rgba(255,255,255,0.12)]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Pitch Kit
                    </Button>
                    <div className="text-sm text-white text-left font-exo w-full">
                      Key: C# Major
                      <br />
                      Tempo: 105 BPM
                      <br />
                      Duration: {displayedSong?.duration || "2:38"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-white">
                  <div className="min-h-[80px]">
                    <div className="text-lg font-dm font-normal mb-2">Collaborators</div>
                    <p className="text-white font-exo">
                      Songwriters: Cirkut, Jason Evigan, David Stewart, Lou-ridz, & Supreme Boi
                    </p>
                    <p className="text-white font-exo">Producer: Cirkut & Jason Evigan</p>
                  </div>
                </div>

                <div className="items-center gap-3 text-white min-h-[100px]">
                  <div className="flex italic items-center gap-2 mb-2">
                    <img src="/flower.png" alt="Why" className="h-5 w-5" />
                    <div className="text-white font-exo text-lg">Why this song?</div>
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
                  const isSelected = selectedSong?.id === song.id || (!selectedSong && index === 0);

                  return (
                    <div
                      key={song.id}
                      onClick={() => setSelectedSong(song)}
                      className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "bg-white/10 ring-2 ring-[#e4ea04]/50 shadow-lg"
                          : "hover:bg-white/5"
                      }`}
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

                            <DropdownMenuContent
                              align="end"
                              className="bg-black/80 border border-white/20 text-white p-2 rounded-xl shadow-[0_0_18px_rgba(0,0,0,0.4)]"
                            >
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
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
