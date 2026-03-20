import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

const isPreviewHost =
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

const clearPreviewCaches = async () => {
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
  }

  if ("caches" in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map((key) => caches.delete(key)));
  }
};

if (isPreviewHost) {
  clearPreviewCaches().catch(() => undefined);
} else {
  const updateSW = registerSW({
    onNeedRefresh() {
      const toast = document.createElement("div");
      toast.textContent = "✨ New version available — updating…";
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "5rem",
        left: "50%",
        transform: "translateX(-50%)",
        background: "hsl(142 71% 35%)",
        color: "#fff",
        padding: "0.65rem 1.25rem",
        borderRadius: "9999px",
        fontSize: "0.8rem",
        fontWeight: "500",
        zIndex: "9999",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        opacity: "0",
        transition: "opacity 0.3s ease",
      });
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
      });

      setTimeout(() => {
        updateSW(true);
        window.location.reload();
      }, 2000);
    },
    onOfflineReady() {},
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 1000);
      }
    },
  });
}


createRoot(document.getElementById("root")!).render(<App />);
