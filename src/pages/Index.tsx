import { Navigation } from "@/components/Navigation";
import { MusicCatalog } from "@/components/MusicCatalog";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SearchInterface } from "@/components/SearchInterface";
import { useState } from "react";

const Index = () => {
  const [showSearch, setShowSearch] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navigation />
      <main className="pt-6">
        {showSearch ? <SearchInterface /> : <MusicCatalog />}
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
