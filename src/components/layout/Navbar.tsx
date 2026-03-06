import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useState } from "react";
import AfristallLogo from "@/components/AfristallLogo";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl px-4 pb-4 pt-2 sm:hidden">
          <div className="flex flex-col gap-2">
            <Link to="/explore" onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Explore Stores</Button>
            </Link>
            <Link to="/login" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
            <Link to="/signup" onClick={() => setMobileOpen(false)}>
              <Button className="w-full">Create Your Store</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
