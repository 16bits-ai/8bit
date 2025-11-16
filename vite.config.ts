import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Explicitly set base path for GitHub Pages with custom domain
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  assetsInclude: ['**/*.MP4', '**/*.mp4', '**/*.MOV', '**/*.mov', '**/*.webm', '**/*.avi', '**/*.mkv'],
});
