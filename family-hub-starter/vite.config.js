import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/family-hub/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Family Hub',
        short_name: 'Family Hub',
        description: 'Family organizer for tasks, meals, groceries, and more',
        theme_color: '#7c6cd8',
        background_color: '#f7f7f9',
        display: 'standalone',
        start_url: '/family-hub/',
        scope: '/family-hub/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
    }),
  ],
});
