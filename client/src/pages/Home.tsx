import { useState } from "react";
import { useSearch } from "@/hooks/use-search";
import { useAuth } from "@/hooks/use-auth";
import { SearchBar } from "@/components/SearchBar";
import { SearchResultCard } from "@/components/SearchResultCard";
import { HistorySidebar } from "@/components/HistorySidebar";
import { Menu, X, Sparkles, Command, Search, LogOut, User, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mutate: performSearch, data: hits, isPending, error } = useSearch();
  const [searchedQuery, setSearchedQuery] = useState("");

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const handleSearch = (query: string) => {
    setSearchedQuery(query);
    performSearch(query);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans text-foreground">
      <aside 
        className={`
          fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:border-r border-border
          ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        `}
      >
        <HistorySidebar onSelectQuery={handleSearch} className="h-full" />
        
        <button 
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 bg-background rounded-full lg:hidden hover:bg-muted"
          data-testid="button-close-sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="p-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors lg:hidden"
              data-testid="button-sidebar-toggle"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-lg">SearchEngine</span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt={user.firstName || "User"} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">{user.firstName || user.email}</span>
                </div>
                <LogoutButton />
              </>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10 md:mb-16 space-y-4"
            >
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 text-primary rounded-full mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Fast & Reliable</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground">
                Search <span className="text-primary relative inline-block">
                  Anything
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Access a powerful index of information with just a few keystrokes.
              </p>
            </motion.div>

            <div className="mb-12 relative z-10">
              <SearchBar 
                onSearch={handleSearch} 
                isLoading={isPending} 
                initialValue={searchedQuery}
              />
            </div>

            <div className="space-y-6">
              {isPending && (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 bg-muted/30 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl"
                >
                  <p className="text-red-600 dark:text-red-400 font-medium">Something went wrong with your search.</p>
                  <p className="text-sm text-red-500/80 mt-2">Please try again later.</p>
                </motion.div>
              )}

              {!isPending && !error && hits && hits.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
                    <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                      <Command className="w-5 h-5 text-primary" />
                      Results for "{searchedQuery}"
                    </h2>
                    <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      {hits.length} hits found
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {hits.map((hit, index) => (
                      <SearchResultCard key={index} hit={hit} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {!isPending && !error && hits && hits.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or check your spelling.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LogoutButton() {
  const { logout, isLoggingOut } = useAuth();
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => logout()}
      disabled={isLoggingOut}
      data-testid="button-logout"
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}

function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-4 border-b border-border flex items-center justify-between">
        <span className="font-bold text-xl">SearchEngine</span>
        <Button onClick={() => { setShowAuth(true); setIsLogin(true); }} data-testid="button-login">
          Sign In
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {showAuth ? (
          <AuthForm isLogin={isLogin} onToggle={() => setIsLogin(!isLogin)} onBack={() => setShowAuth(false)} />
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl"
          >
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-full mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Find What You're Looking For
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              A powerful search engine that delivers top hits based on your queries. 
              Sign in to access your search history and personalized results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => { setShowAuth(true); setIsLogin(false); }} data-testid="button-get-started">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => { setShowAuth(true); setIsLogin(true); }}>
                Sign In
              </Button>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-xl bg-card border border-border">
                <Search className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Fast Search</h3>
                <p className="text-sm text-muted-foreground">Get instant results from our comprehensive database.</p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <Command className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Search History</h3>
                <p className="text-sm text-muted-foreground">Access your previous searches anytime, anywhere.</p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border">
                <User className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Personalized</h3>
                <p className="text-sm text-muted-foreground">Results tailored to your search patterns.</p>
              </div>
            </div>
          </motion.div>
        )}
      </main>
      
      <footer className="p-4 border-t border-border text-center text-sm text-muted-foreground">
        SearchEngine - Powered by PostgreSQL & Flask
      </footer>
    </div>
  );
}

function AuthForm({ isLogin, onToggle, onBack }: { isLogin: boolean; onToggle: () => void; onBack: () => void }) {
  const { loginAsync, registerAsync, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await loginAsync({ email, password });
      } else {
        await registerAsync({ email, password, firstName, lastName });
      }
    } catch (err) {
      // Error is handled by the mutation state
    }
  };

  const error = isLogin ? loginError : registerError;
  const isPending = isLogin ? isLoggingIn : isRegistering;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md"
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
          <CardDescription>
            {isLogin ? "Sign in to your account to continue" : "Sign up to start searching"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    data-testid="input-last-name"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
                {error.message}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending} data-testid="button-submit-auth">
              {isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              type="button"
              onClick={onToggle}
              className="text-primary hover:underline font-medium"
              data-testid="button-toggle-auth"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="button-back"
            >
              Back to home
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
