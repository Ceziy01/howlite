import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from "vite-plugin-svgr";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.svg'],
      manifest: {
        name: 'Howlite',
        short_name: 'Howlite',
        description: 'Howlite — заметки и задачи',
        theme_color: '#1f1f1f',
        background_color: '#1f1f1f',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon48.png', sizes: '48x48', type: 'image/png' },
          { src: '/icons/icon72.png', sizes: '72x72', type: 'image/png' },
          { src: '/icons/icon96.png', sizes: '96x96', type: 'image/png' },
          { src: '/icons/icon144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /\/api\/.*/,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
  server: {
    host: '0.0.0.0',
    port: 4376,
    strictPort: true,
    allowedHosts: ['ceziy.site', 'www.ceziy.site'],
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },

  },
})