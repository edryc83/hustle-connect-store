import { Store } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-secondary/50 py-8">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5 text-primary" />
        <span className="font-bold text-foreground">
          Afri<span className="text-primary">stall</span>
        </span>
      </div>
      <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Afristall</p>
    </div>
  </footer>
);

export default Footer;
