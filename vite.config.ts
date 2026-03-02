import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    
    // Базовый путь для деплоя на корень домена
    base: '/',
    
    // Настройка алиасов для импортов (@/components и т.д.)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    
    // Настройки сервера разработки
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    
    // Настройки сборки для production
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['lucide-react', 'motion', 'clsx', 'tailwind-merge'],
            maps: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
    
    // Оптимизация зависимостей
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['lucide-react'],
    },
  };
});
