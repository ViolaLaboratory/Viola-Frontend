import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Navigation = () => {
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
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
            Search
          </Button>
          <Button variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
            Pitch Builder
          </Button>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
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
