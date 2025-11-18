import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NavigationProps {
  currentView: 'search' | 'pitchBuilder' | 'catalogue';
  onViewChange: (view: 'search' | 'pitchBuilder' | 'catalogue') => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold text-primary">V</div>
          
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search" 
              className="pl-10 bg-secondary border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className={currentView === 'search' ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
            onClick={() => onViewChange('search')}
          >
            Search
          </Button>
          <Button 
            variant={currentView === 'pitchBuilder' ? "default" : "ghost"}
            className={currentView === 'pitchBuilder' ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground hover:text-foreground"}
            onClick={() => onViewChange('pitchBuilder')}
          >
            Pitch Builder
          </Button>
          <Button 
            variant="ghost" 
            className={currentView === 'catalogue' ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
            onClick={() => onViewChange('catalogue')}
          >
            Catalogue
          </Button>
        </nav>

        {/* User Profile */}
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-t border-border">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          Filter
        </Button>
      </div>
    </header>
  );
};
