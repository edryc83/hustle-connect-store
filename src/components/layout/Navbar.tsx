import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { User, Sun, Moon } from "lucide-react";
import AfristallLogo from "@/components/AfristallLogo";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <AfristallLogo />
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Afri<span className="text-primary">stall</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link to="/explore">
            <Button variant="ghost" size="sm">Explore Stores</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="sm" className="border-border/50 bg-card/40 backdrop-blur-sm">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="shadow-sm shadow-primary/20">Create Your Store</Button>
          </Link>
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-border/50 bg-card/40 flex items-center justify-center"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <Link to="/login">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
