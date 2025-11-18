import { Navigation } from "@/components/Navigation";
import { MusicCatalog } from "@/components/MusicCatalog";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SearchInterface } from "@/components/SearchInterface";
import { PitchBuilder } from "@/components/PitchBuilder";
import { useState } from "react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'search' | 'pitchBuilder' | 'catalogue'>('search');

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="pt-6">
        {currentView === 'search' && <SearchInterface />}
        {currentView === 'pitchBuilder' && <PitchBuilder />}
        {currentView === 'catalogue' && <MusicCatalog />}
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Index;
