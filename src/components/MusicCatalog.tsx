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
    title: "Touch (ft. YEONJUN of TOMORROW X...",
    artist: "Artist Name",
    album: "Album Name",
    genre: "Pop",
    mood: "Upbeat",
    licensing: "Standard",
    duration: "2:09",
    thumbnail: "🎵",
    views: "524,424,511",
  },
  {
    id: 2,
    title: "Talk to You",
    artist: "Artist Name",
    album: "Album Name",
    genre: "Pop",
    mood: "Energetic",
    licensing: "Premium",
    duration: "2:30",
    thumbnail: "🎵",
    views: "10,117,807",
  },
  {
    id: 3,
    title: "Let Me Tell You (feat. Daniela of KATSE...",
    artist: "Artist Name",
    album: "Album Name",
    genre: "R&B",
    mood: "Chill",
    licensing: "Standard",
    duration: "2:34",
    thumbnail: "🎵",
    views: "5,938,875",
  },
  {
    id: 4,
    title: "GGUM",
    artist: "Artist Name",
    album: "Album Name",
    genre: "Hip Hop",
    mood: "Intense",
    licensing: "Premium",
    duration: "2:31",
    thumbnail: "🎵",
    views: "135,604,979",
  },
  {
    id: 5,
    title: "Coma",
    artist: "Artist Name",
    album: "Album Name",
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
    artist: "Artist Name",
    album: "Album Name",
    genre: "Ambient",
    mood: "Relaxing",
    licensing: "Premium",
    duration: "3:15",
    thumbnail: "🎵",
  },
  {
    id: 7,
    title: "Electric Pulse",
    artist: "Artist Name",
    album: "Album Name",
    genre: "EDM",
    mood: "Energetic",
    licensing: "Standard",
    duration: "2:45",
    thumbnail: "🎵",
  },
  {
    id: 8,
    title: "Summer Breeze",
    artist: "Artist Name",
    album: "Album Name",
    genre: "Indie",
    mood: "Happy",
    licensing: "Premium",
    duration: "3:20",
    thumbnail: "🎵",
  },
];

export const MusicCatalog = () => {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[40px_60px_1fr_200px_120px_120px_120px_80px] gap-4 px-6 py-3 border-b border-border text-sm text-muted-foreground font-medium">
        <div>#</div>
        <div></div>
        <div>Title</div>
        <div>Album</div>
        <div>Genre</div>
        <div>Mood</div>
        <div>Licensing</div>
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
            <div className="text-foreground text-sm truncate">{song.album}</div>

            {/* Genre Badge */}
            <div>
              <Badge variant="secondary" className="bg-badge-genre/20 text-badge-genre border-0 hover:bg-badge-genre/30">
                {song.genre}
              </Badge>
            </div>

            {/* Mood Badge */}
            <div>
              <Badge variant="secondary" className="bg-badge-mood/20 text-badge-mood border-0 hover:bg-badge-mood/30">
                {song.mood}
              </Badge>
            </div>

            {/* Licensing Badge */}
            <div>
              <Badge variant="secondary" className="bg-badge-licensing/20 text-badge-licensing border-0 hover:bg-badge-licensing/30">
                {song.licensing}
              </Badge>
            </div>

            {/* Duration & Actions */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-muted-foreground text-sm">{song.duration}</span>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
