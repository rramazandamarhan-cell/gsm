import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.png',
          'favicon-32x32.png',
          'brand-logo.png',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-1024x1024.png',
          'pwa-maskable-192x192.png',
          'pwa-maskable-512x512.png',
          'store-assets/app-icon-1024x1024.png',
          'store-assets/feature-graphic-1024x500.png',
          'store-assets/screenshot-1-bargain-16x9.jpg',
          'store-assets/screenshot-2-repair-16x9.jpg',
          'store-assets/screenshot-3-empire-16x9.jpg',
          'store-assets/screenshot-4-diagnostics-16x9.jpg',
          'store-assets/screenshot-5-museum-auction-16x9.jpg',
          'privacy.html',
          'terms.html',
        ],
        manifest: {
          id: '/',
          name: 'GSM Simulator',
          short_name: 'GSM Sim',
          description:
            '2D illüstrasyonlu telefon al-sat, ekspertiz, tamir, aksesuar ve GSM imparatorluğu simülasyonu.',
          theme_color: '#0F141B',
          background_color: '#0F141B',
          display: 'standalone',
          display_override: ['fullscreen', 'standalone'],
          orientation: 'landscape',
          start_url: '/',
          scope: '/',
          lang: 'tr',
          categories: ['games', 'simulation'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-1024x1024.png',
              sizes: '1024x1024',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/store-assets/feature-graphic-1024x500.png',
              sizes: '1024x500',
              type: 'image/png',
              form_factor: 'wide',
              label: 'GSM Simulator — Pasaj Tezgâhı ve Tamir Atölyesi',
            },
            {
              src: '/store-assets/screenshot-1-bargain-16x9.jpg',
              sizes: '1920x1080',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'Esnaf Pazarlığı, Çay İkramı ve Ekspertiz Tezgâhı',
            },
            {
              src: '/store-assets/screenshot-2-repair-16x9.jpg',
              sizes: '1920x1080',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'ESD Mikro-Tamir Atölyesi ve Donanım Teşhisi',
            },
            {
              src: '/store-assets/screenshot-3-empire-16x9.jpg',
              sizes: '1920x1080',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'Flagship GSM Showroom, Barkod Sistemi ve Müze',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
          type: 'module',
        },
      }),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
