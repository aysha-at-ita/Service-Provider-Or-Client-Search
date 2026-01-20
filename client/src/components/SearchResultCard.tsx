import { ExternalLink, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface SearchHit {
  title: string;
  url: string;
  description: string | null;
  rank: number;
}

interface SearchResultCardProps {
  hit: SearchHit;
  index: number;
}

export function SearchResultCard({ hit, index }: SearchResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative bg-card hover:bg-accent/5 rounded-xl p-6 border border-border/40 hover:border-border transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
          <Globe className="w-5 h-5" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display text-foreground group-hover:text-primary transition-colors">
              <a 
                href={hit.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                {hit.title}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </h3>
            <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-md">
              Rank #{hit.rank}
            </span>
          </div>
          
          <a 
            href={hit.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-sm text-green-600 dark:text-green-400 font-mono truncate block max-w-lg hover:underline"
          >
            {hit.url}
          </a>
          
          <p className="text-muted-foreground leading-relaxed line-clamp-2">
            {hit.description || "No description available for this result."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
