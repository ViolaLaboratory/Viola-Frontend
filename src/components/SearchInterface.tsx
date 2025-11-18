import { Input } from "@/components/ui/input";

export const SearchInterface = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-6">
      <h1 className="text-4xl font-medium text-muted-foreground mb-8">
        What would you like to listen to today?
      </h1>
      <div className="w-full max-w-2xl">
        <Input 
          placeholder="Find me an eerie, suspenseful soundtrack for a scene in the woods" 
          className="h-14 text-base border-2 border-foreground/20 bg-card focus-visible:border-foreground/40 rounded-full px-6"
        />
      </div>
    </div>
  );
};
