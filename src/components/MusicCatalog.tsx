import { Play, Plus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  mood: string;
  licensing: string;
  duration: string;
  thumbnail: string;
  views?: string;
}

const songs: Song[] = [
  {
    id: 1,
    title: "new Phone, new Me",
    artist: "Neon District",
    album: "Chromatic Bloom",
    genre: "Pop",
    mood: "Upbeat",
    licensing: "Standard",
    duration: "2:09",
    thumbnail: "🎵",
    views: "524,424,511",
  },
  {
    id: 2,
    title: "Up the Score",
    artist: "Tidal Echo",
    album: "Heartline",
    genre: "Pop",
    mood: "Energetic",
    licensing: "Premium",
    duration: "2:30",
    thumbnail: "🎵",
    views: "10,117,807",
  },
  {
    id: 3,
    title: "Z Branch",
    artist: "City Lanterns",
    album: "After Hours",
    genre: "R&B",
    mood: "Chill",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "5,938,875",
  },
  {
    id: 4,
    title: "Right Here",
    artist: "Blushing Violet",
    album: "Midnight Bloom",
    genre: "Hip Hop",
    mood: "Intense",
    licensing: "Premium",
    duration: "2:31",
    thumbnail: "🎵",
    views: "135,604,979",
  },
  {
    id: 5,
    title: "John Wick",
    artist: "Axiom Fields",
    album: "Nocturne Drive",
    genre: "Electronic",
    mood: "Dark",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "2,966,803",
  },
  {
    id: 6,
    title: "Midnight Dreams",
    artist: "Nova Saffron",
    album: "Violet Echoes",
    genre: "Ambient",
    mood: "Relaxing",
    licensing: "Premium",
    duration: "3:15",
    thumbnail: "🎵",
  },
  {
    id: 7,
    title: "Electric Pulse",
    artist: "Phase Runner",
    album: "Circuit Bloom",
    genre: "EDM",
    mood: "Energetic",
    licensing: "Standard",
    duration: "2:45",
    thumbnail: "🎵",
  },
  {
    id: 8,
    title: "Summer Breeze",
    artist: "Golden Sands",
    album: "Evershine",
    genre: "Indie",
    mood: "Happy",
    licensing: "Premium",
    duration: "3:20",
    thumbnail: "🎵",
  },
  {
    id: 9,
    title: "Harbor Lights",
    artist: "Selene Ward",
    album: "Blue Harbour",
    genre: "Indie",
    mood: "Dreamy",
    licensing: "Standard",
    duration: "3:08",
    thumbnail: "🎵",
    views: "1,245,998",
  },
  {
    id: 10,
    title: "Carbon Pulse",
    artist: "Riot Satellite",
    album: "Neo Arc",
    genre: "Electronic",
    mood: "Hype",
    licensing: "Premium",
    duration: "2:57",
    thumbnail: "🎵",
    views: "22,110,543",
  },
  {
    id: 11,
    title: "Glasshouse",
    artist: "Lumen Choir",
    album: "Holographic Bloom",
    genre: "Alternative",
    mood: "Ethereal",
    licensing: "Standard",
    duration: "3:32",
    thumbnail: "🎵",
  },
  {
    id: 12,
    title: "Floodline",
    artist: "Compass North",
    album: "Greywater",
    genre: "Rock",
    mood: "Driving",
    licensing: "Standard",
    duration: "2:51",
    thumbnail: "🎵",
  },
  {
    id: 13,
    title: "Metallic Heart",
    artist: "Chrome Coral",
    album: "Pulse Engine",
    genre: "Synthwave",
    mood: "Moody",
    licensing: "Premium",
    duration: "3:04",
    thumbnail: "🎵",
  },
  {
    id: 14,
    title: "Dawn Patrol",
    artist: "Atlas Vega",
    album: "Skyline Shift",
    genre: "Ambient",
    mood: "Uplifting",
    licensing: "Standard",
    duration: "4:01",
    thumbnail: "🎵",
  },
  {
    id: 15,
    title: "Mercury Bloom",
    artist: "Static Bloom",
    album: "Soft Voltage",
    genre: "Pop",
    mood: "Nostalgic",
    licensing: "Premium",
    duration: "3:18",
    thumbnail: "🎵",
  },
  {
    id: 16,
    title: "Silver Thread",
    artist: "Emberline",
    album: "Handwritten Notes",
    genre: "Folk",
    mood: "Warm",
    licensing: "Standard",
    duration: "3:40",
    thumbnail: "🎵",
  },
  {
    id: 17,
    title: "Rose Quartz Run",
    artist: "Muse District",
    album: "Velvet Traces",
    genre: "R&B",
    mood: "Seductive",
    licensing: "Premium",
    duration: "2:48",
    thumbnail: "🎵",
  },
  {
    id: 18,
    title: "Night Swim",
    artist: "Hollow Isles",
    album: "Blue Static",
    genre: "Indie",
    mood: "Introspective",
    licensing: "Standard",
    duration: "3:26",
    thumbnail: "🎵",
  },
  {
    id: 19,
    title: "Ghost Metric",
    artist: "Vapor Scout",
    album: "Prism Ghosts",
    genre: "Electronic",
    mood: "Mysterious",
    licensing: "Premium",
    duration: "3:11",
    thumbnail: "🎵",
  },
  {
    id: 20,
    title: "Satellite Bloom",
    artist: "Lunar Pines",
    album: "Signal Fires",
    genre: "Alternative",
    mood: "Expansive",
    licensing: "Standard",
    duration: "4:12",
    thumbnail: "🎵",
  },
  {
    id: 21,
    title: "Crimson Paper",
    artist: "The Civic",
    album: "Letters West",
    genre: "Rock",
    mood: "Anthemic",
    licensing: "Premium",
    duration: "3:44",
    thumbnail: "🎵",
  },
  {
    id: 22,
    title: "Ivory Circuit",
    artist: "Magnet Juno",
    album: "Orbit Field",
    genre: "EDM",
    mood: "Pulsing",
    licensing: "Standard",
    duration: "2:55",
    thumbnail: "🎵",
  },
  {
    id: 23,
    title: "Paper Lantern Wolves",
    artist: "June Monsoon",
    album: "Night Market",
    genre: "Indie",
    mood: "Playful",
    licensing: "Premium",
    duration: "3:05",
    thumbnail: "🎵",
  },
  {
    id: 24,
    title: "Fever Coast",
    artist: "Desert Bloom",
    album: "Mirage Diaries",
    genre: "Pop",
    mood: "Sultry",
    licensing: "Standard",
    duration: "2:59",
    thumbnail: "🎵",
  },
  {
    id: 25,
    title: "Cerulean Static",
    artist: "Polar Isles",
    album: "Crystal Archive",
    genre: "Ambient",
    mood: "Glacial",
    licensing: "Premium",
    duration: "4:18",
    thumbnail: "🎵",
  },
  {
    id: 26,
    title: "Voltage Bloom",
    artist: "Phase Garden",
    album: "Neon Roots",
    genre: "Electronic",
    mood: "Driving",
    licensing: "Standard",
    duration: "3:00",
    thumbnail: "🎵",
  },
  {
    id: 27,
    title: "Sable Skyline",
    artist: "Echo Harbor",
    album: "Anthracite",
    genre: "Alternative",
    mood: "Brooding",
    licensing: "Premium",
    duration: "3:29",
    thumbnail: "🎵",
  },
  {
    id: 28,
    title: "Sunset Static",
    artist: "Pacific Relay",
    album: "Signal Orange",
    genre: "Indie",
    mood: "Carefree",
    licensing: "Standard",
    duration: "3:14",
    thumbnail: "🎵",
  },
  {
    id: 29,
    title: "Monochrome Bloom",
    artist: "Retro Courier",
    album: "Analog Atlas",
    genre: "Synthwave",
    mood: "Cinematic",
    licensing: "Premium",
    duration: "3:47",
    thumbnail: "🎵",
  },
  {
    id: 30,
    title: "Drift Theory",
    artist: "Cascade 94",
    album: "Outer Bloom",
    genre: "Ambient",
    mood: "Serene",
    licensing: "Standard",
    duration: "4:26",
    thumbnail: "🎵",
  },
];

export const MusicCatalog = () => {
  return (
    <div className="bg-black w-full max-h-[calc(100vh-140px)] min-h-[60vh] overflow-y-auto rounded-xl border border-border bg-card/60 mt-6">
      {/* Table Header */}
      <div className="sticky top-0 z-10 grid grid-cols-[40px_60px_1fr_200px_120px_120px_120px_80px] gap-4 px-6 py-3 border-b border-border text-sm text-muted-foreground font-medium bg-card/90 backdrop-blur">
        <div>#</div>
        <div></div>
        <div>Title</div>
        <div className="justify-self-center">Album</div>
        <div className="justify-self-center">Genre</div>
        <div className="justify-self-center">Mood</div>
        <div className="justify-self-center">Licensing</div>
        <div className="text-right">Duration</div>
      </div>

      {/* Song List */}
      <div className="divide-y divide-border/50">
        {songs.map((song, index) => (
          <div
            key={song.id}
            className="grid grid-cols-[40px_60px_1fr_200px_120px_120px_120px_80px] gap-4 px-6 py-3 hover:bg-hover-row transition-colors duration-150 group cursor-pointer items-center"
          >
            {/* Number / Play Button */}
            <div className="text-muted-foreground text-sm">
              <span className="group-hover:hidden">{index + 1}</span>
              <Play className="hidden group-hover:block w-4 h-4 text-foreground" />
            </div>

            {/* Thumbnail */}
            <div className="w-12 h-12 bg-secondary rounded flex items-center justify-center text-2xl">
              {song.thumbnail}
            </div>

            {/* Title & Artist */}
            <div className="flex flex-col overflow-hidden">
              <span className="text-foreground font-medium truncate">{song.title}</span>
              <span className="text-muted-foreground text-sm truncate">{song.artist}</span>
            </div>

            {/* Album */}
            <div className="text-foreground text-center text-sm truncate">{song.album}</div>

            {/* Genre Badge */}
            <div className="flex justify-self-center">
              <Badge variant="secondary" className="bg-badge-genre/20 text-badge-genre border-0 hover:bg-badge-genre/30">
                {song.genre}
              </Badge>
            </div>

            {/* Mood Badge */}
            <div className="flex justify-self-center">
              <Badge variant="secondary" className="bg-badge-mood/20 text-badge-mood border-0 hover:bg-badge-mood/30">
                {song.mood}
              </Badge>
            </div>

            {/* Licensing Badge */}
            <div className="flex justify-self-center">
              <Badge variant="secondary" className="bg-badge-licensing/20 text-badge-licensing border-0 hover:bg-badge-licensing/30">
                {song.licensing}
              </Badge>
            </div>

            {/* Duration & Actions */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-muted-foreground text-sm">{song.duration}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
