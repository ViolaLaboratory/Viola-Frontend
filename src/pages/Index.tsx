import { Navigation } from "@/components/Navigation";
import { MusicCatalog } from "@/components/MusicCatalog";
import { MusicPlayer } from "@/components/MusicPlayer";
import { SearchInterface } from "@/components/SearchInterface";
import { PitchBuilder } from "@/components/PitchBuilder";
import { useState } from "react";

const Index = () => {
  const [currentView, setCurrentView] = useState<'search' | 'pitchBuilder' | 'catalogue'>('search');

  return (
    <div className="min-h-screen bg-background text-foreground pb-0">
      <header className="sticky top-0 z-20">
        <Navigation currentView={currentView} onViewChange={setCurrentView} />
      </header>
      
      <main className="pt-0">
        {currentView === 'search' && <SearchInterface />}
        {currentView === 'pitchBuilder' && <PitchBuilder />}
        {currentView === 'catalogue' && <MusicCatalog />}
      </main>
      {(currentView === 'pitchBuilder' || currentView === 'catalogue') && (<MusicPlayer />)}
    </div>
  );
};

export default Index;
