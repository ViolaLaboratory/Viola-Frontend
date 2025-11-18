import { Navigation } from "@/components/Navigation";
import { MusicCatalog } from "@/components/MusicCatalog";
import { MusicPlayer } from "@/components/MusicPlayer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navigation />
      <main className="pt-6">
        <MusicCatalog />
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
