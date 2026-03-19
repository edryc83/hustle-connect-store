import { Link } from "react-router-dom";
import AfristallLogo from "@/components/AfristallLogo";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-10">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2">
          <AfristallLogo className="h-5 w-5" />
          <span className="font-bold text-foreground">
            Afri<span className="text-primary">stall</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          <Link to="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Afristall. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
