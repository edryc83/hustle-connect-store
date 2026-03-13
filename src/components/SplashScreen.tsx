import { useEffect, useState } from "react";

const SplashScreen = () => {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    // Logo scales up + fades in
    const enterTimer = setTimeout(() => setPhase("hold"), 600);
    // Then fades out
    const exitTimer = setTimeout(() => setPhase("exit"), 1400);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.08)_0%,transparent_70%)]" />

      {/* Logo + wordmark */}
      <div
        className={`relative flex flex-col items-center gap-4 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          phase === "enter"
            ? "scale-90 opacity-0 translate-y-2"
            : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        <img
          src="/logo.jpeg"
          alt="Afristall"
          className="h-20 w-20 rounded-2xl shadow-lg shadow-primary/20"
        />
        <div className="flex items-baseline gap-0.5">
          <span className="text-2xl font-extrabold tracking-tight text-foreground">
            Afri
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-primary">
            stall
          </span>
        </div>
      </div>

      {/* iOS-style loading bar */}
      <div className="absolute bottom-24 w-12 overflow-hidden rounded-full">
        <div className="h-[3px] w-full animate-pulse rounded-full bg-primary/30" />
      </div>
    </div>
  );
};

export default SplashScreen;
