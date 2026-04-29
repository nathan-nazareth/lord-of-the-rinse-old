import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'logo.svg'],
          manifest: {
            name: 'Organic Soap Builder',
            short_name: 'Soap Builder',
            description: 'Build your custom organic soaps',
            theme_color: '#efece6',
            background_color: '#f9f8f6',
            display: 'standalone',
            orientation: 'portrait',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: '/logo.svg',
                sizes: 'any',
                type: 'image/svg+xml'
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        '__env__': JSON.stringify({
          VITE_WEB3FORMS_ACCESS_KEY: env.VITE_WEB3FORMS_ACCESS_KEY,
          VITE_WEB3FORMS_ENDPOINT: env.VITE_WEB3FORMS_ENDPOINT,
          VITE_ADMIN_BACKEND_URL: env.VITE_ADMIN_BACKEND_URL
        })
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
