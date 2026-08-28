import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'EuroTrip — Planner de viajes',
        short_name: 'EuroTrip',
        description: 'Planner de viajes y perfil de viajero',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
      workbox: {
        // Todo el bundle se precachea: la app tiene que abrir sin red.
        // Las portadas (.webp) van precacheadas: sin ellas la pantalla principal
        // queda vacía offline, que es cuando más se usa la app.
        // Sin `woff`: cualquier navegador con service worker soporta woff2, así que
        // precachear el fallback era bajar 223 KB que nunca se leen.
        globPatterns: ['**/*.{js,css,html,svg,webp,woff2}'],
        // Los tiles de OSM son lo único que se pide online; cache-first con tope.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: { outDir: 'dist', sourcemap: false },
});
