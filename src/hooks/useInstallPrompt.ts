import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    // Check immediately on init — standalone mode or previously recorded install
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(display-mode: standalone)");
      if (mq.matches || (navigator as any).standalone === true) return true;
      if (localStorage.getItem("afristall_pwa_installed") === "true") return true;
    }
    return false;
  });

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const checkInstalled = () => {
      const installed = mq.matches || (navigator as any).standalone === true;
      if (installed) {
        setIsInstalled(true);
        setCanInstall(false);
        localStorage.setItem("afristall_pwa_installed", "true");
      }
    };
    checkInstalled();
    mq.addEventListener("change", checkInstalled);

    // Listen for the browser's install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Detect install
    const installedHandler = () => {
      setIsInstalled(true);
      setCanInstall(false);
      deferredPrompt = null;
      localStorage.setItem("afristall_pwa_installed", "true");
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      mq.removeEventListener("change", checkInstalled);
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
    return outcome === "accepted";
  }, []);

  return { canInstall, isInstalled, promptInstall };
}
