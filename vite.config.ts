import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "logo.jpeg", "logo-glow.png"],
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,jpeg,jpg,webp,woff2}"],
        navigateFallbackDenylist: [/^\/~oauth/],
        importScripts: ["/push-sw.js"],
        runtimeCaching: [
          {
            // Auth endpoints must NEVER be cached — prevents stale tokens causing logouts
            urlPattern: /^https:\/\/.*supabase\.co\/auth\/.*/i,
            handler: "NetworkOnly",
          },
          {
            // Other Supabase API calls (storage, rest, etc.) can use NetworkFirst
            urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "supabase-api", expiration: { maxEntries: 50, maxAgeSeconds: 300 } },
          },
        ],
      },
      manifest: {
        name: "Afristall",
        short_name: "Afristall",
        description: "Your Shop, Your WhatsApp, Your Hustle",
        theme_color: "#09090b",
        background_color: "#09090b",
        display_override: ["standalone"],
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "1024x1024", type: "image/png" },
          { src: "/pwa-512.png", sizes: "1024x1024", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
