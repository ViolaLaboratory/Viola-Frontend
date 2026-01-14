import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

interface ChatEntry {
  role: string;
  message: string;
}

interface ChatPanelProps {
  conversationHistory: ChatEntry[];
  waitingForResponse: boolean;
  isLoading: boolean;
  showResults: boolean;
  thinkingText: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export const ChatPanel = ({
  conversationHistory,
  waitingForResponse,
  isLoading,
  showResults,
  thinkingText,
  searchQuery,
  onSearchChange,
  onSubmit,
}: ChatPanelProps) => (
  <section className="w-1/3 min-w-0 flex flex-col bg-[rgba(0,0,0,0.33)] backdrop-blur-[26px] border-r border-white/40 shadow-[inset_0_0_35.4px_rgba(255,255,255,0.15)] h-screen font-exo">
    <div className="flex-1 space-y-5 overflow-y-auto pr-2 px-6 py-8">
      {conversationHistory.map((entry, index) => (
        <div
          key={`${entry.role}-${index}`}
          className={`text-sm leading-relaxed ${
            entry.role === "user"
              ? "ml-auto max-w-max rounded-[17px] bg-white/8 px-4 py-3 backdrop-blur-[10px] shadow-[0_0_13px_rgba(255,255,255,0.16),inset_0_0_4px_rgba(255,255,255,0.08)] relative z-10 mr-4"
              : "text-white/80"
          }`}
        >
          {entry.message}
        </div>
      ))}
      {conversationHistory.length > 0 &&
        conversationHistory[conversationHistory.length - 1]?.role === "user" && (
          <div className="text-white/70 text-sm leading-relaxed">
            im working on that now.
          </div>
        )}
      {waitingForResponse && (
        <div className="text-white/60 text-xs tracking-wide">
          Updating brief instructions...
        </div>
      )}
    </div>

    <div className="pt-4 px-6">
      {(isLoading || showResults) && (
        <div className="flex items-center gap-3 pb-3 text-white/60 pl-8">
          <img src="/flower.png" alt="Status" className="h-5 w-5" />
          <span className="italic">
            {thinkingText || "Updating Brief Instructions..."}
          </span>
        </div>
      )}
      <form onSubmit={onSubmit} className="relative">
        <Input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={conversationHistory.length > 0 ? "Ask Away" : ""}
          className="h-12 w-full rounded-full border border-white/15 bg-black/40 pl-5 pr-12 text-sm text-white placeholder:text-white/40 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-white text-black flex items-center justify-center transition duration-300"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <p className="text-[11px] text-white/40 py-3 text-center">
        viola is still in development. leave us feedback{" "}
        <a href="#" className="underline">
          here
        </a>
        .
      </p>
    </div>
  </section>
);
