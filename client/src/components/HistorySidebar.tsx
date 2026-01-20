import { useHistory } from "@/hooks/use-search";
import { Clock, Search, ChevronRight, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface HistorySidebarProps {
  onSelectQuery: (query: string) => void;
  className?: string;
}

export function HistorySidebar({ onSelectQuery, className = "" }: HistorySidebarProps) {
  const { data: history, isLoading } = useHistory();

  return (
    <div className={`flex flex-col h-full bg-card/50 backdrop-blur-sm border-r border-border/50 ${className}`}>
      <div className="p-6 border-b border-border/40">
        <div className="flex items-center gap-3 text-foreground">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-display text-lg font-bold">Recent Queries</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading history...</span>
          </div>
        ) : !history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center p-4">
            <Search className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No search history yet.</p>
            <p className="text-xs opacity-60">Your recent searches will appear here.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelectQuery(item.queryText)}
                className="w-full group flex items-center justify-between p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-border/50 transition-all text-left"
              >
                <div className="min-w-0">
                  <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                    {item.queryText}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.createdAt 
                      ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                      : 'Just now'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
              </motion.button>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
