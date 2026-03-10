import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Auto-reload all open tabs when a new version is published
registerSW({
  onNeedRefresh() {
    // Immediately activate the new service worker and reload
    window.location.reload();
  },
  onOfflineReady() {},
  // Check for updates every 60 seconds
  onRegisteredSW(_url, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },
});

createRoot(document.getElementById("root")!).render(<App />);
