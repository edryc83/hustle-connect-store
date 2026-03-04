import AfristallLogo from "@/components/AfristallLogo";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm py-8">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AfristallLogo className="h-5 w-5" />
        <span className="font-bold text-foreground">
          Afri<span className="text-primary">stall</span>
        </span>
      </div>
      <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Afristall</p>
    </div>
  </footer>
);

export default Footer;
