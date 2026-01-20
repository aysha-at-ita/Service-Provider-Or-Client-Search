import { Search, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export function SearchBar({ onSearch, isLoading, initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValue) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-primary animate-spin" />
          ) : (
            <Search className="h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          className="block w-full pl-12 md:pl-16 pr-6 py-5 md:py-6 rounded-2xl bg-white dark:bg-gray-800 border-2 border-border/50 text-lg md:text-xl placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-xl shadow-primary/5 transition-all duration-300"
          placeholder="What are you looking for today?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 right-2 md:right-3 flex items-center">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Search
          </button>
        </div>
      </form>
      
      {/* Decorative glow behind the search bar */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-[20px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 -z-10" />
    </div>
  );
}
